import os
from fastapi import FastAPI, Header, HTTPException, Depends, Request
from starlette.config import Config
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from typing import List
from apis import authentication, frontend
import logging as logger
import time


from dotenv import load_dotenv
load_dotenv(override=True)

config = Config(".env")

expected_api_secret = os.getenv("SECRET_KEY")
print("=====expected_api_secret======",expected_api_secret)
app = FastAPI()

# Add Session middleware
app.add_middleware(SessionMiddleware, secret_key=expected_api_secret)

origins= [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# # Logging time taken for each api request
@app.middleware("http")
async def log_response_time(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"Request: {request.url.path} completed in {process_time:.4f} seconds")
    return response 


app.include_router(authentication.router, tags=["Authentication"])
app.include_router(frontend.router, tags=["Frontend"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)