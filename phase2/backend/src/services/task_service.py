from sqlmodel import Session, select
from typing import List, Optional
from ..models.task import Task, TaskCreate, TaskUpdate
from ..models.user import User


class TaskService:
    @staticmethod
    def create_task(db: Session, task_create: TaskCreate, user_id: int) -> Task:
        db_task = Task(
            title=task_create.title,
            description=task_create.description,
            completed=task_create.completed,
            user_id=user_id
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def get_tasks(db: Session, user_id: int, completed: Optional[bool] = None) -> List[Task]:
        query = select(Task).where(Task.user_id == user_id)

        if completed is not None:
            query = query.where(Task.completed == completed)

        return db.exec(query).all()

    @staticmethod
    def get_tasks_paginated(
        db: Session,
        user_id: int,
        completed: Optional[bool] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Task]:
        query = select(Task).where(Task.user_id == user_id)

        if completed is not None:
            query = query.where(Task.completed == completed)

        query = query.offset(offset).limit(limit)
        return db.exec(query).all()

    @staticmethod
    def get_tasks_count(db: Session, user_id: int, completed: Optional[bool] = None) -> int:
        query = select(Task).where(Task.user_id == user_id)

        if completed is not None:
            query = query.where(Task.completed == completed)

        return db.exec(query).count()

    @staticmethod
    def get_task(db: Session, task_id: int, user_id: int) -> Optional[Task]:
        return db.exec(
            select(Task).where(Task.id == task_id, Task.user_id == user_id)
        ).first()

    @staticmethod
    def update_task(db: Session, task_id: int, task_update: TaskUpdate, user_id: int) -> Optional[Task]:
        db_task = TaskService.get_task(db, task_id, user_id)
        if db_task:
            # Update only the fields that are provided
            for field, value in task_update.dict(exclude_unset=True).items():
                setattr(db_task, field, value)

            db.add(db_task)
            db.commit()
            db.refresh(db_task)
            return db_task
        return None

    @staticmethod
    def delete_task(db: Session, task_id: int, user_id: int) -> bool:
        db_task = TaskService.get_task(db, task_id, user_id)
        if db_task:
            db.delete(db_task)
            db.commit()
            return True
        return False

    @staticmethod
    def update_task_completion(db: Session, task_id: int, completed: bool, user_id: int) -> Optional[Task]:
        db_task = TaskService.get_task(db, task_id, user_id)
        if db_task:
            db_task.completed = completed
            db.add(db_task)
            db.commit()
            db.refresh(db_task)
            return db_task
        return None