from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from ..database import get_session
from ..models.user import User
from typing import Dict, Optional
import time
from collections import defaultdict
import hashlib

load_dotenv()

security = HTTPBearer()
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "your-default-secret-key-for-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Simple in-memory cache for user objects
_user_cache: Dict[int, tuple] = {}  # {user_id: (user_object, timestamp)}
CACHE_TTL = 300  # 5 minutes cache TTL

# Rate limiting cache: {ip_address: [request_timestamps]}
_rate_limit_cache: Dict[str, list] = defaultdict(list)
RATE_LIMIT_REQUESTS = 10  # Max requests
RATE_LIMIT_WINDOW = 60  # Per 60 seconds


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Add additional security claims
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),  # issued at
        "type": "access"  # token type
    })

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt





def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    # Add additional security claims for refresh token
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),  # issued at
        "type": "refresh"  # token type
    })

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str, token_type: str = "access"):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Verify token type
        token_type_claim = payload.get("type")
        if token_type_claim != token_type:
            raise HTTPException(status_code=401, detail="Invalid token type")

        # Verify expiration
        exp = payload.get("exp")
        if exp is None:
            raise HTTPException(status_code=401, detail="Token has no expiration")

        if datetime.fromtimestamp(exp) < datetime.utcnow():
            raise HTTPException(status_code=401, detail="Token has expired")

        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")

        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_session)):
    token = credentials.credentials
    user_id = verify_token(token, "access")

    # Check cache first
    current_time = time.time()
    if user_id in _user_cache:
        cached_user, timestamp = _user_cache[user_id]
        if current_time - timestamp < CACHE_TTL:
            return cached_user
        else:
            # Cache expired, remove from cache
            del _user_cache[user_id]

    # Get user from database
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    # Store in cache
    _user_cache[user_id] = (user, current_time)
    return user


def check_rate_limit(request: Request) -> bool:
    """
    Check if the request exceeds the rate limit.
    Returns True if the request is allowed, False otherwise.
    """
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()

    # Clean up old requests outside the window
    _rate_limit_cache[client_ip] = [
        req_time for req_time in _rate_limit_cache[client_ip]
        if current_time - req_time < RATE_LIMIT_WINDOW
    ]

    # Check if we're under the limit
    if len(_rate_limit_cache[client_ip]) < RATE_LIMIT_REQUESTS:
        _rate_limit_cache[client_ip].append(current_time)
        return True
    else:
        return False