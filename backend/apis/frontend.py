from typing import List, Dict, Optional
from fastapi import APIRouter, Query
from datetime import datetime, timedelta

router = APIRouter(prefix="/api")

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
        {
            "id": 2,
            "name": "Instagram",
            "connected": True,
            "followers": "8.7K",
            "engagement": "5.2%",
            "posts": 67,
            "icon": "instagram",
        },
        {
            "id": 3,
            "name": "Twitter",
            "connected": True,
            "followers": "3.1K",
            "engagement": "2.7%",
            "posts": 128,
            "icon": "twitter",
        }
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

@router.get("/posts/scheduled")
async def get_scheduled_posts():
    return [
        {
            "id": 1,
            "content": "Check out our new product line!",
            "platforms": ["Instagram"],
            "scheduled_datetime": (datetime.utcnow() + timedelta(hours=3)).isoformat(),
            "status": "scheduled",
            "media_count": 1,
            "media": [{"type": "image", "url": "https://via.placeholder.com/300x200"}],
        }
    ]

@router.post("/posts")
async def create_post():
    return {"id": 123, "status": "scheduled"}

@router.put("/posts/{post_id}")
async def update_post(post_id: int):
    return {"id": post_id, "status": "updated"}

@router.delete("/posts/{post_id}")
async def delete_post(post_id: int):
    return {"status": "deleted", "id": post_id}

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
@router.post("/hashtags/generate")
async def generate_hashtags():
    return [
        "#socialmedia",
        "#digitalmarketing",
        "#marketing"
    ]

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
