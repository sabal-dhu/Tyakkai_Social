from sqlalchemy import create_engine, Column, String, Integer, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
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
