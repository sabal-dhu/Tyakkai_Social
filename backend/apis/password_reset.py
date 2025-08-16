from fastapi import APIRouter, HTTPException, Body, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from db_utils.db import User, SessionLocal
from sqlalchemy.orm import Session
from jose import jwt
from datetime import datetime, timedelta
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

router = APIRouter(prefix="/api")

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
FRONTEND_URL = "http://localhost:3000"
RESET_TOKEN_EXPIRE_MINUTES = 30

EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS") 

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

def create_reset_token(email: str):
    expire = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": email, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_reset_token(token: str):
    from jose import JWTError, ExpiredSignatureError
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=400, detail="Invalid token")
        return email
    except ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Reset link expired")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")

def send_reset_email(email: str, reset_link: str):
    subject = "Tyakkai Social Password Reset"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border:1px solid #eee; border-radius:8px; padding:24px;">
        <div style="text-align:center;">
            <img src="https://ibb.co/8nxCRqKm" alt="Tyakkai Social Logo" style="width:180px; margin-bottom:16px;" />
        </div>
        <h2 style="color:#6c2eb7; text-align:center;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your Tyakkai Social account.</p>
        <p>
            <a href="{reset_link}" style="background:#6c2eb7;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;display:inline-block;">Reset Password</a>
        </p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p style="color:#888;font-size:13px;">&copy; {datetime.now().year} Tyakkai Social</p>
    </div>
    """

    msg = MIMEMultipart()
    msg["From"] = EMAIL_USER
    msg["To"] = email
    msg["Subject"] = subject
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_USER, email, msg.as_string())
        print(f"Password reset email sent to {email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        return JSONResponse({"message": "No account found with this email."}, status_code=404)

    token = create_reset_token(user.email)
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
    send_reset_email(user.email, reset_link)
    return {"message": "Password reset link has been sent to your email."}

@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    email = verify_reset_token(request.token)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    user.password_hash = pwd_context.hash(request.new_password)
    db.commit()
    return {"message": "Password reset successful"}