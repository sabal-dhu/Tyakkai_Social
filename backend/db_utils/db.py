from sqlalchemy import create_engine, Column, String, Integer, DateTime, func, ForeignKey, Table, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

# Set up SQLite database (this will create a local 'database.db' file)
DATABASE_URL = "sqlite:///database.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Define user log model
class UserLog(Base):
    __tablename__ = "user_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    user_email = Column(String, nullable=False)
    user_name = Column(String)
    user_pic = Column(String)
    first_logged_in = Column(DateTime, default=datetime.utcnow)
    last_accessed = Column(DateTime, default=datetime.utcnow)

# Define token log model
class TokenLog(Base):
    __tablename__ = "token_logs"
    id = Column(Integer, primary_key=True, index=True)
    access_token = Column(String, nullable=False)
    user_email = Column(String, nullable=False)
    session_id = Column(String, nullable=False)

# Define users table for registration data
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    company_name = Column(String, nullable=True)
    role = Column(String, nullable=False, default="editor")  # Default role is "editor"
    created_at = Column(DateTime, server_default=func.now())  # Auto-set creation time
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())  # Auto-set update time
    active = Column(Boolean, default=True, nullable=False)
class SocialAccount(Base):
    __tablename__ = "social_accounts"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform_name = Column(String, nullable=False)  # e.g. facebook, instagram
    access_token = Column(String, nullable=False)   # Store encrypted if needed
    refresh_token = Column(String, nullable=True)   # Store encrypted if needed
    token_expiry = Column(DateTime, nullable=True)
    account_id = Column(String, nullable=False)     # External social account ID
    connected_at = Column(DateTime, default=datetime.utcnow)

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    content = Column(String, nullable=False)
    url = Column(String, nullable=True)
    scheduled_datetime = Column(DateTime, nullable=True)
    is_recurring = Column(Boolean, default=False)
    recurring_type = Column(String, nullable=True)
    recurring_end_date = Column(DateTime, nullable=True)
    campaign = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    platforms = relationship("PostPlatform", back_populates="post")
    recurring_days = relationship("RecurringDay", back_populates="post")
    media = relationship("Media", back_populates="post")

class PostPlatform(Base):
    __tablename__ = "post_platforms"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    platform = Column(String, nullable=False)
    post = relationship("Post", back_populates="platforms")

class RecurringDay(Base):
    __tablename__ = "recurring_days"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    day = Column(String, nullable=False)
    post = relationship("Post", back_populates="recurring_days")

class Media(Base):
    __tablename__ = "media"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # image, video, etc.
    post = relationship("Post", back_populates="media")

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Function to log user details
def log_user(user_id, user_email, user_name, user_pic, first_logged_in, last_accessed):
    db = SessionLocal()
    try:
        user_log = UserLog(
            user_id=user_id,
            user_email=user_email,
            user_name=user_name,
            user_pic=user_pic,
            first_logged_in=first_logged_in,
            last_accessed=last_accessed,
        )
        db.add(user_log)
        db.commit()
    except Exception as e:
        print("Error logging user:", e)
        db.rollback()
    finally:
        db.close()

# Function to log token info
def log_token(access_token, user_email, session_id):
    db = SessionLocal()
    try:
        token_log = TokenLog(
            access_token=access_token,
            user_email=user_email,
            session_id=session_id,
        )
        db.add(token_log)
        db.commit()
    except Exception as e:
        print("Error logging token:", e)
        db.rollback()
    finally:
        db.close()