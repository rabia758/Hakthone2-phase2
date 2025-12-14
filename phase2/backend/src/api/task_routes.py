from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import List, Optional
from ..database import get_session
from ..models.task import Task, TaskCreate, TaskUpdate, TaskRead
from ..services.task_service import TaskService
from ..middleware.auth import get_current_user
from ..models.user import User
from typing import Dict, Any

router = APIRouter()


@router.get("/{user_id}/tasks", response_model=Dict[str, Any])
def get_tasks(
    user_id: int,
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of tasks to return"),
    offset: int = Query(0, ge=0, description="Number of tasks to skip"),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access these tasks")

    # Use database-level pagination for performance
    tasks = TaskService.get_tasks_paginated(db, user_id, completed, limit, offset)
    total = TaskService.get_tasks_count(db, user_id, completed)

    return {
        "success": True,
        "data": {
            "tasks": [
                TaskRead(
                    id=task.id,
                    title=task.title,
                    description=task.description,
                    completed=task.completed,
                    created_at=task.created_at,
                    updated_at=task.updated_at,
                    user_id=task.user_id
                ) for task in tasks
            ],
            "total": total,
            "limit": limit,
            "offset": offset
        }
    }


@router.post("/{user_id}/tasks", response_model=Dict[str, Any])
def create_task(
    user_id: int,
    task_create: TaskCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to create tasks for this user")

    db_task = TaskService.create_task(db, task_create, user_id)

    return {
        "success": True,
        "data": TaskRead(
            id=db_task.id,
            title=db_task.title,
            description=db_task.description,
            completed=db_task.completed,
            created_at=db_task.created_at,
            updated_at=db_task.updated_at,
            user_id=db_task.user_id
        ),
        "message": "Task created successfully"
    }


@router.get("/{user_id}/tasks/{id}", response_model=Dict[str, Any])
def get_task(
    user_id: int,
    id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this task")

    db_task = TaskService.get_task(db, id, user_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    return {
        "success": True,
        "data": TaskRead(
            id=db_task.id,
            title=db_task.title,
            description=db_task.description,
            completed=db_task.completed,
            created_at=db_task.created_at,
            updated_at=db_task.updated_at,
            user_id=db_task.user_id
        )
    }


@router.put("/{user_id}/tasks/{id}", response_model=Dict[str, Any])
def update_task(
    user_id: int,
    id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")

    db_task = TaskService.update_task(db, id, task_update, user_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    return {
        "success": True,
        "data": TaskRead(
            id=db_task.id,
            title=db_task.title,
            description=db_task.description,
            completed=db_task.completed,
            created_at=db_task.created_at,
            updated_at=db_task.updated_at,
            user_id=db_task.user_id
        ),
        "message": "Task updated successfully"
    }


@router.delete("/{user_id}/tasks/{id}", response_model=Dict[str, Any])
def delete_task(
    user_id: int,
    id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")

    success = TaskService.delete_task(db, id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")

    return {
        "success": True,
        "data": {
            "message": "Task deleted successfully"
        }
    }


@router.patch("/{user_id}/tasks/{id}/complete", response_model=Dict[str, Any])
def update_task_completion(
    user_id: int,
    id: int,
    completed: bool,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")

    db_task = TaskService.update_task_completion(db, id, completed, user_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    return {
        "success": True,
        "data": TaskRead(
            id=db_task.id,
            title=db_task.title,
            description=db_task.description,
            completed=db_task.completed,
            created_at=db_task.created_at,
            updated_at=db_task.updated_at,
            user_id=db_task.user_id
        ),
        "message": "Task completion status updated successfully"
    }