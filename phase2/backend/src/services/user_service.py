from sqlmodel import Session, select
from ..models.user import User, UserCreate
from passlib.context import CryptContext
from typing import Optional

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_user(db: Session, user_create: UserCreate) -> User:
        # Check if user already exists
        existing_user = db.exec(select(User).where(User.email == user_create.email)).first()
        if existing_user:
            raise ValueError("User with this email already exists")

        # Hash the password
        hashed_password = UserService.get_password_hash(user_create.password)

        # Create new user
        db_user = User(
            email=user_create.email,
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        user = db.exec(select(User).where(User.email == email)).first()
        if not user or not UserService.verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        return db.exec(select(User).where(User.email == email)).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.get(User, user_id)