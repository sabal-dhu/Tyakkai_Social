from typing import List, Dict, Optional
from fastapi import APIRouter, Query, UploadFile, File, Body, Form, Depends, HTTPException, Header
from db_utils.db import SessionLocal, Post, PostPlatform, RecurringDay, Media, User
from datetime import datetime, timedelta
import os
from sqlalchemy.orm import Session
from apis.authentication import get_current_user
from tyakkai_ai.hashtag import TyakkaiHashtagAPI
from dotenv import load_dotenv

router = APIRouter(prefix="/api")

UPLOAD_DIR = "uploaded_media"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/posts")
async def create_post(
    content: str = Form(...),
    scheduled_datetime: str = Form(...),
    platforms: list[str] = Form(...),
    is_recurring: bool = Form(False),
    recurring_type: str = Form(None),
    recurring_days: list[str] = Form([]),
    recurring_end_date: str = Form(None),
    campaign: str = Form(None),
    media: list[UploadFile] = File([]),
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    # --- AUTHENTICATION ---
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    token = authorization.split("Bearer ")[1]
    user = get_current_user(token, db)
    user_id = user["id"]

    try:
        # --- CREATE POST ---
        post = Post(
            content=content,
            scheduled_datetime=datetime.fromisoformat(scheduled_datetime),
            is_recurring=is_recurring,
            recurring_type=recurring_type,
            recurring_end_date=datetime.fromisoformat(recurring_end_date) if recurring_end_date else None,
            campaign=campaign,
            user_id=user_id,
        )
        db.add(post)
        db.commit()
        db.refresh(post)

        # --- PLATFORMS ---
        for platform in platforms:
            db.add(PostPlatform(post_id=post.id, platform=platform))

        # --- RECURRING DAYS ---
        for day in recurring_days:
            db.add(RecurringDay(post_id=post.id, day=day))

        # --- MEDIA UPLOAD ---
        for file in media:
            filename = f"{post.id}_{file.filename}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            with open(file_path, "wb") as f:
                f.write(await file.read())
            file_type = file.content_type.split("/")[0]
            db.add(Media(post_id=post.id, file_path=file_path, file_type=file_type))

        db.commit()
        return {"id": post.id, "status": "scheduled"}
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()

@router.get("/posts/scheduled")
async def get_scheduled_posts(db: Session = Depends(get_db), authorization: str = Header(...)):
    # Authenticate user
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    token = authorization.split("Bearer ")[1]
    user = get_current_user(token, db)
    user_id = user["id"]

    # Query posts for this user
    posts = db.query(Post).filter(Post.user_id == user_id).order_by(Post.scheduled_datetime.desc()).all()
    result = []
    for post in posts:
        # Get platforms
        platforms = [p.platform for p in post.platforms]
        # Get media
        media_objs = []
        for m in post.media:
            media_objs.append({
                "type": m.file_type,
                "url": f"/{m.file_path}"  # You may want to serve these files via a static route
            })
        result.append({
            "id": post.id,
            "content": post.content,
            "platforms": platforms,
            "campaign": post.campaign,
            "scheduled_datetime": post.scheduled_datetime.isoformat(),
            "status": "scheduled",
            "media_count": len(media_objs),
            "media": media_objs,
        })
    return result
        
@router.put("/posts/{post_id}")
async def update_post(
    post_id: int,
    content: str = Form(...),
    scheduled_datetime: str = Form(...),
    platforms: list[str] = Form(...),
    is_recurring: bool = Form(False),
    recurring_type: str = Form(None),
    recurring_days: list[str] = Form([]),
    recurring_end_date: str = Form(None),
    campaign: str = Form(None),
    media: list[UploadFile] = File([]),
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    # Authenticate user
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    token = authorization.split("Bearer ")[1]
    user = get_current_user(token, db)
    user_id = user["id"]

    post = db.query(Post).filter(Post.id == post_id, Post.user_id == user_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    try:
        # Update post fields
        post.content = content
        post.scheduled_datetime = datetime.fromisoformat(scheduled_datetime)
        post.is_recurring = is_recurring
        post.recurring_type = recurring_type
        post.recurring_end_date = datetime.fromisoformat(recurring_end_date) if recurring_end_date else None
        post.campaign = campaign

        # Update platforms
        db.query(PostPlatform).filter(PostPlatform.post_id == post.id).delete()
        for platform in platforms:
            db.add(PostPlatform(post_id=post.id, platform=platform))

        # Update recurring days
        db.query(RecurringDay).filter(RecurringDay.post_id == post.id).delete()
        for day in recurring_days:
            db.add(RecurringDay(post_id=post.id, day=day))

        # Update media: remove old, add new
        db.query(Media).filter(Media.post_id == post.id).delete()
        for file in media:
            filename = f"{post.id}_{file.filename}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            with open(file_path, "wb") as f:
                f.write(await file.read())
            file_type = file.content_type.split("/")[0]
            db.add(Media(post_id=post.id, file_path=file_path, file_type=file_type))

        db.commit()
        return {"id": post.id, "status": "updated"}
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: int,
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    # Authenticate user
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    token = authorization.split("Bearer ")[1]
    user = get_current_user(token, db)
    user_id = user["id"]

    post = db.query(Post).filter(Post.id == post_id, Post.user_id == user_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    try:
        # Delete related tables first due to foreign key constraints
        db.query(PostPlatform).filter(PostPlatform.post_id == post.id).delete()
        db.query(RecurringDay).filter(RecurringDay.post_id == post.id).delete()
        db.query(Media).filter(Media.post_id == post.id).delete()
        db.delete(post)
        db.commit()
        return {"status": "deleted", "id": post_id}
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()
        
@router.get("/users")
async def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "active": user.active,
            "role": user.role,
            "lastLogin": user.updated_at.isoformat() if user.updated_at else None,
        })
    return result

@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    data: dict = Body(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if "active" not in data:
        raise HTTPException(status_code=400, detail="Missing 'active' field")
    user.active = bool(data["active"])
    db.commit()
    return {
        "success": True,
        "message": f"User {user_id} status updated to {'active' if user.active else 'inactive'}",
        "user": {"id": user_id, "active": user.active},
    }
        
# 1. Dashboard Endpoints
@router.get("/dashboard/stats")
async def get_dashboard_stats():
    return {
        "totalFollowers": "1K",
        "followerGrowth": "12%",
        "engagementRate": "4.2%",
        "engagementGrowth": "0.8%",
        "totalPosts": "237",
        "newPosts": "24",
        "scheduledPosts": "12",
        "nextPostTime": "3 hours",
        "timestamp": datetime.utcnow().isoformat()
    }

# 2. Platform Endpoints
@router.get("/platforms")
async def get_connected_platforms():
    return [
        {
            "id": 1,
            "name": "Facebook",
            "connected": True,
            "followers": "5.2K",
            "engagement": "3.8%",
            "posts": 42,
            "icon": "facebook",
        },
        # {
        #     "id": 2,
        #     "name": "Instagram",
        #     "connected": True,
        #     "followers": "8.7K",
        #     "engagement": "5.2%",
        #     "posts": 67,
        #     "icon": "instagram",
        # },
        # {
        #     "id": 3,
        #     "name": "Twitter",
        #     "connected": True,
        #     "followers": "3.1K",
        #     "engagement": "2.7%",
        #     "posts": 128,
        #     "icon": "twitter",
        # }
    ]

@router.post("/connect-platform/{platform}")
async def connect_platform(platform: str):
    return {"status": f"{platform} connected successfully"}

# 3. Posts Endpoints
@router.get("/posts/upcoming")
async def get_upcoming_posts():
    return [
        {
            "id": 1,
            "platform": "Instagram",
            "date": "Today, 3:00 PM",
            "content": "New product launch! Check out our latest social media management features...",
            "media": [{"type": "image", "url": "https://via.placeholder.com/300x200"}],
        },
        {
            "id": 2,
            "platform": "Facebook",
            "date": "Tomorrow, 10:00 AM",
            "content": "Tips for small businesses...",
            "media": [],
        }
    ]





# 4. Campaign Endpoints
@router.get("/campaigns")
async def get_campaigns():
    return [
        {"id": 1, "name": "Product Launch"},
        {"id": 2, "name": "Summer Sale"},
        {"id": 3, "name": "Webinar"}
    ]

# 5. Analytics Endpoints
@router.get("/analytics")
async def get_analytics(
    timeRange: str = Query("7d"),
    platform: Optional[str] = Query(None)
):
    return {
        "summary": {
            "totalEngagement": 12547,
            "engagementGrowth": 8.3,
            "impressions": 98450,
        },
        "platforms": {
            "facebook": {"name": "Facebook", "engagement": 4235},
            "instagram": {"name": "Instagram", "engagement": 6890},
        },
        "topPosts": [
            {
                "id": 1,
                "platform": "Instagram",
                "engagement": 1245,
                "content": "Check out our new product line!"
            }
        ]
    }

# 6. Calendar Endpoints
@router.get("/posts/calendar")
async def get_calendar_posts(
    year: int = Query(...),
    month: int = Query(...),
    view: str = Query("month")
):
    return [
        {
            "id": 1,
            "content": "Product launch post",
            "platforms": ["instagram"],
            "scheduled_datetime": datetime(year, month, 15, 14, 30).isoformat(),
            "status": "scheduled"
        }
    ]

# 7. Hashtag Endpoints

# Initialize the hashtag API 
# Load environment variables from .env file

GROK_API_KEY = os.getenv("GROK_API_KEY")
GROK_API_BASE = os.getenv("GROK_API_BASE")

hashtag_api = TyakkaiHashtagAPI(
    model_name="llama3-70b-8192",
    api_key=GROK_API_KEY,
    api_base=GROK_API_BASE
)

@router.post("/hashtags/generate")
async def generate_hashtags_api(
    data: dict = Body(...)
):
    content = data.get("content")
    platform = data.get("platform")
    industry = data.get("industry")
    count = data.get("count", 15)
    
    print(f"Received data: {data}")
    print(f"Content: {content}, Platform: {platform}, Industry: {industry}, Count: {count}")

    if not all([content, platform, industry]):
        raise HTTPException(status_code=400, detail="Missing required fields: content, platform, industry")

    try:
        hashtags = await hashtag_api.generate_hashtags(
            content=content,
            platform=platform,
            industry=industry,
            count=count
        )
        # Ensure each hashtag starts with '#'
        hashtags = [h if h.startswith("#") else f"#{h}" for h in hashtags]
        return {"hashtags": hashtags}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 8. Notification Endpoints
@router.get("/notifications")
async def get_notifications(filter: str = Query("all")):
    return [
        {
            "id": 1,
            "type": "post_published",
            "message": "Your post was published",
            "is_read": False
        }
    ]

@router.post("/notifications/{id}/read")
async def mark_notification_read(id: int):
    return {"status": "read", "id": id}

@router.post("/notifications/read-all")
async def mark_all_notifications_read():
    return {"status": "all read"}

@router.delete("/notifications/{id}")
async def delete_notification(id: int):
    return {"status": "deleted", "id": id}

@router.delete("/notifications/delete-all")
async def delete_all_notifications():
    return {"status": "all deleted"}

@router.get("/notifications/unread/count")
async def get_unread_notifications_count():
    return {"count": 2}
