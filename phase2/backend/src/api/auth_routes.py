from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlmodel import Session
from sqlalchemy.orm import Session as SqlSession
from ..database import get_session
from ..models.user import User, UserCreate, UserRead
from ..services.user_service import UserService
from ..middleware.auth import create_access_token, create_refresh_token, verify_token, check_rate_limit
from datetime import timedelta
from typing import Dict, Any
import re

class LoginRequest(BaseModel):
    email: str
    password: str

router = APIRouter()

@router.post("/auth/register", response_model=Dict[str, Any])
def register(request: Request, user_create: UserCreate, db: Session = Depends(get_session)):
    # Apply rate limiting
    if not check_rate_limit(request):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")

    # Validate email format
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, user_create.email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    # Validate password strength
    password = user_create.password
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    if len(password) > 72:
        raise HTTPException(status_code=400, detail="Password cannot be longer than 72 characters")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one digit")

    try:
        db_user = UserService.create_user(db, user_create)
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": str(db_user.id)}, expires_delta=access_token_expires
        )

        return {
            "success": True,
            "data": {
                "user": UserRead(
                    id=db_user.id,
                    email=db_user.email,
                    created_at=db_user.created_at,
                    updated_at=db_user.updated_at
                ),
                "token": access_token
            },
            "message": "User registered successfully"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Registration failed")


@router.post("/auth/login", response_model=Dict[str, Any])
def login(request: Request, login_data: LoginRequest, db: Session = Depends(get_session)):
    # Apply rate limiting
    if not check_rate_limit(request):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")

    email = login_data.email
    password = login_data.password

    # Validate email format
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    # Validate password
    if len(password) < 1:
        raise HTTPException(status_code=400, detail="Password cannot be empty")
    if len(password) > 72:
        raise HTTPException(status_code=400, detail="Password cannot be longer than 72 characters")

    user = UserService.authenticate_user(db, email, password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    # Create access and refresh tokens
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    refresh_token = create_refresh_token(
        data={"sub": str(user.id)}
    )

    return {
        "success": True,
        "data": {
            "user": UserRead(
                id=user.id,
                email=user.email,
                created_at=user.created_at,
                updated_at=user.updated_at
            ),
            "token": access_token,
            "refresh_token": refresh_token
        },
        "message": "Login successful"
    }


@router.post("/auth/refresh", response_model=Dict[str, Any])
def refresh_access_token(refresh_token: str, db: Session = Depends(get_session)):
    try:
        # Verify the refresh token
        user_id = verify_token(refresh_token, "refresh")

        # Get the user from the database to ensure they still exist
        user = db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        # Create a new access token
        access_token_expires = timedelta(minutes=30)
        new_access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )

        return {
            "success": True,
            "data": {
                "user": UserRead(
                    id=user.id,
                    email=user.email,
                    created_at=user.created_at,
                    updated_at=user.updated_at
                ),
                "token": new_access_token
            },
            "message": "Token refreshed successfully"
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")