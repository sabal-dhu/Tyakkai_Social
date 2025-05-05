from fastapi import APIRouter, Query, HTTPException, status, Request, Cookie, Depends
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from starlette.responses import RedirectResponse
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError
import traceback
import requests
import uuid
import os
from dotenv import load_dotenv
from pydantic import ValidationError, BaseModel, EmailStr
from typing import Optional
from google.oauth2 import service_account
import google.auth.transport.requests
from google.oauth2.id_token import verify_oauth2_token
from db_utils.db import log_user, log_token, User, SessionLocal, UserLog
import logging as logger
from sqlalchemy.orm import Session
from passlib.context import CryptContext

load_dotenv(override=True)

router = APIRouter()

# Load configurations
config = Config(".env")

# Setup OAuth2
oauth = OAuth(config)

oauth.register(
    name="google",
    client_id=config("GOOGLE_CLIENT_ID"),
    client_secret=config("GOOGLE_CLIENT_SECRET"),
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    authorize_params=None,
    access_token_url="https://oauth2.googleapis.com/token",
    access_token_params=None,
    refresh_token_url=None,
    redirect_uri="http://127.0.0.1:8000/auth",
    jwks_uri="https://www.googleapis.com/oauth2/v3/certs",
    client_kwargs={'scope': 'openid profile email'},
)

oauth.register(
    name='twitter',
    api_base_url='https://api.twitter.com/1.1/',
    request_token_url='https://api.twitter.com/oauth/request_token',
    access_token_url='https://api.twitter.com/oauth/access_token',
    authorize_url='https://api.twitter.com/oauth/authenticate',
)

# Secret key used to encode JWT tokens (should be kept secret)
SECRET_KEY = config("JWT_SECRET_KEY")
ALGORITHM = "HS256"
REDIRECT_URL = config("REDIRECT_URL")
FRONTEND_URL = config("FRONTEND_URL")

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models for request and response
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    company_name: str = None
    role: str = "editor"  # Default role is "editor"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Utility functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# API to register a new user
@router.post("/register", response_model=dict)
async def register_user(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if the email already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password
    hashed_password = hash_password(request.password)

    # Create a new user
    new_user = User(
        email=request.email,
        password_hash=hashed_password,
        name=request.name,
        company_name=request.company_name,
        role=request.role if request.role else "editor",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}

# API to log in a user
@router.post("/login", response_model=TokenResponse)
async def login_user(request: LoginRequest, db: Session = Depends(get_db)):
    # Check if the user exists
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Verify the password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Create a JWT token
    access_token = create_access_token(data={"sub": user.email, "role": user.role})

    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Cookie(None)):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id: str = payload.get("sub")
        user_email: str = payload.get("email")

        if user_id is None or user_email is None:
            raise credentials_exception

        return {"user_id": user_id, "user_email": user_email}

    except ExpiredSignatureError:
        # Specifically handle expired tokens
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired. Please login again.")
    except JWTError:
        # Handle other JWT-related errors
        traceback.print_exc()
        raise credentials_exception
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=401, detail="Not Authenticated")

@router.get("/oauth/google/login")
async def login(request: Request):
    redirect_uri = "http://localhost:8000/auth"
    print("====Session before redirect:", dict(request.session))
    response = await oauth.google.authorize_redirect(request, redirect_uri)
    print("====Session after setting state:", dict(request.session))
    return response



@router.route("/auth")
async def auth(request: Request):
    try:
        # Get access token from OAuth flow
        print("====session",dict(request.session))
        token = await oauth.google.authorize_access_token(request)
        print("====session",dict(request.session))
        logger.debug(f"OAuth token received: {token}")
    except Exception as e:
        logger.error(f"OAuth token retrieval failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Google authentication failed")

    # Validate token structure
    if not token or "access_token" not in token:
        logger.error("Invalid token structure received")
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    try:
        # Get user info from Google API
        user_info_endpoint = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {token['access_token']}"}
        google_response = requests.get(user_info_endpoint, headers=headers)
        google_response.raise_for_status()  # Raises exception for 4XX/5XX responses
        user_info = google_response.json()
    except Exception as e:
        logger.error(f"Failed to fetch user info: {str(e)}")
        raise HTTPException(status_code=401, detail="Failed to fetch user information")

    # Extract user data with proper error handling
    user = token.get("userinfo", {})
    expires_in = token.get("expires_in", 3600)  # Default to 1 hour if not provided
    
    user_id = user.get("sub")
    iss = user.get("iss")
    user_email = user.get("email")
    user_name = user_info.get("name", "Unknown")
    user_pic = user_info.get("picture")
    
    print("====user",user)

    logger.info(f"Authenticating user: {user_name} ({user_email})")

    # Validate issuer
    valid_issuers = ["https://accounts.google.com", "accounts.google.com"]
    if not iss or iss not in valid_issuers:
        logger.error(f"Invalid issuer: {iss}")
        raise HTTPException(status_code=401, detail="Invalid authentication provider")

    if not user_id:
        logger.error("Missing user ID in token")
        raise HTTPException(status_code=401, detail="Invalid user identification")

    # Create JWT token
    try:
        access_token_expires = timedelta(seconds=expires_in)
        access_token = create_access_token(
            data={"sub": user_id, "email": user_email},
            expires_delta=access_token_expires
        )
    except Exception as e:
        logger.error(f"JWT creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal authentication error")

    # Log user activity
    current_time = datetime.utcnow()
    session_id = str(uuid.uuid4())
    
    try:
        log_user(user_id, user_email, user_name, user_pic, current_time, current_time)
        log_token(access_token, user_email, session_id)
    except Exception as e:
        logger.error(f"Failed to log user activity: {str(e)}")
        # Continue despite logging failure - this shouldn't block auth

    # Prepare response
    # redirect_url = request.session.pop("login_redirect", "http://localhost:3000/dashboard")  # Default fallback
    # logger.info(f"Authentication successful, redirecting to: {redirect_url}")
    # print("====redirect_url", redirect_url)

    # response = RedirectResponse(url=redirect_url)
    # response.set_cookie(
    #     key="token",
    #     value=access_token,
    #     httponly=True,
    #     secure=False,  # For localhost; set True in production with HTTPS
    #     samesite="lax",
    #     max_age=expires_in,
    #     path="/"
    # )
    # print("====response", response)
    # return response
    
    # Redirect to frontend with access_token in query params
    redirect_url = f"http://localhost:3000/dashboard?access_token={access_token}"
    return RedirectResponse(url=redirect_url)
    

@router.get("/logout")
async def logout(request: Request):
    
    request.session.clear()
    response = JSONResponse(content={"message": "Logged out successfully."})
    response.delete_cookie("token")
    return response

#code for connecting facebook
FB_CLIENT_ID = os.getenv("FACEBOOK_APP_ID")
FB_CLIENT_SECRET = os.getenv("FACEBOOK_APP_SECRET")
REDIRECT_URI_FB = os.getenv("REDIRECT_URI_FB")


@router.get("/auth/facebook/login")
def facebook_login():
    fb_auth_url = (
        f"https://www.facebook.com/v19.0/dialog/oauth"
        f"?client_id={FB_CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI_FB}"
        f"&scope=pages_show_list,pages_manage_posts,pages_read_engagement,"
        f"instagram_basic,instagram_content_publish"
    )
    return RedirectResponse(fb_auth_url)


@router.get("/auth/facebook/callback")
def facebook_callback(request: Request):
    code = request.query_params.get("code")

    # Step 1: Exchange code for access token
    token_url = "https://graph.facebook.com/v19.0/oauth/access_token"
    params = {
        "client_id": FB_CLIENT_ID,
        "redirect_uri": REDIRECT_URI_FB,
        "client_secret": FB_CLIENT_SECRET,
        "code": code
    }
    res = requests.get(token_url, params=params)
    data = res.json()
    user_access_token = data.get("access_token")

    if not user_access_token:
        return JSONResponse({"error": "Token not found"}, status_code=400)

    # Step 2: Get Pages the user manages
    pages_url = "https://graph.facebook.com/v19.0/me/accounts"
    pages_res = requests.get(pages_url, params={"access_token": user_access_token})
    pages_data = pages_res.json()

    return JSONResponse(pages_data)

def get_user_pages(access_token: str):
    res = requests.get(
        "https://graph.facebook.com/v19.0/me/accounts",
        params={"access_token": access_token}
    )
    return res.json()

def get_instagram_account_id(page_id: str, page_access_token: str):
    res = requests.get(
        f"https://graph.facebook.com/v19.0/{page_id}",
        params={
            "fields": "instagram_business_account",
            "access_token": page_access_token
        }
    )
    return res.json().get("instagram_business_account", {}).get("id")

def get_instagram_profile(ig_user_id: str, access_token: str):
    res = requests.get(
        f"https://graph.facebook.com/v19.0/{ig_user_id}",
        params={
            "fields": "username,profile_picture_url",
            "access_token": access_token
        }
    )
    return res.json()

@router.get('/auth/twitter/login')
async def login(request: Request):
    # absolute url for callback
    # we will define it below
    redirect_uri = request.url_for('auth')
    return await oauth.twitter.authorize_redirect(request, redirect_uri)

@router.get('/auth/twitter/authenticate')
async def auth(request: Request):
    token = await oauth.twitter.authorize_access_token(request)
    url = 'account/verify_credentials.json'
    resp = await oauth.twitter.get(
        url, params={'skip_status': True}, token=token)
    user = resp.json()
    request.session['user'] = dict(user)
    return RedirectResponse(url='/')

@router.get('auth/twitter/logout')
async def logout(request):
    request.session.pop('user', None)
    return RedirectResponse(url='/')

def get_current_user(token: str, db: Session = Depends(get_db)) -> dict:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if not sub:
            raise credentials_exception
        
        print("====payload", payload)
        print("====sub", sub)
        # Check if the user is an email/password user
        if sub.startswith("email:"):
            email = sub.split("email:")[1]
            user = db.query(User).filter(User.email == email).first()
            if not user:
                raise credentials_exception
            return {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "company_name": user.company_name,
                "role": user.role,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
            }

        # Check if the user is an OAuth user
        elif sub.startswith("oauth:"):
            oauth_user_id = sub.split("oauth:")[1]
            oauth_user = db.query(UserLog).filter(UserLog.user_id == oauth_user_id).first()
            if not oauth_user:
                raise credentials_exception
            return {
                "id": oauth_user.id,
                "user_id": oauth_user.user_id,
                "email": oauth_user.user_email,
                "name": oauth_user.user_name,
                "profile_picture": oauth_user.user_pic,
                "first_logged_in": oauth_user.first_logged_in,
                "last_accessed": oauth_user.last_accessed,
            }

        # If the sub field is invalid
        else:
            raise credentials_exception

    except JWTError:
        raise credentials_exception
    
from fastapi import Header

@router.get("/api/users/me", response_model=dict)
async def get_user_data(authorization: str = Header(...), db: Session = Depends(get_db)):
    """
    Receives the access token from the frontend via the Authorization header,
    validates it, and fetches user data.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Invalid Authorization header")
    print("====authorization", authorization)
    token = authorization.split("Bearer ")[1]
    print("====token", token)
    return get_current_user(token, db)