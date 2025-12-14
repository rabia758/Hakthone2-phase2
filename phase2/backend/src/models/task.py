from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime


class TaskBase(SQLModel):
    title: str
    description: Optional[str] = None
    completed: bool = Field(default=False, index=True)
    user_id: int = Field(foreign_key="user.id", index=True)


class Task(TaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    completed: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: int = Field(foreign_key="user.id", index=True)

    # Relationship to user
    user: "User" = Relationship(back_populates="tasks")


class TaskCreate(TaskBase):
    title: str
    description: Optional[str] = None
    completed: bool = False


class TaskRead(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime
    user_id: int


class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None