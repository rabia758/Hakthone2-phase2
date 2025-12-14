import pytest
from unittest.mock import Mock, patch
from sqlmodel import Session
from datetime import datetime
from backend.src.models.task import Task, TaskCreate, TaskUpdate
from backend.src.services.task_service import TaskService


class TestTaskService:
    def setup_method(self):
        """Setup test dependencies"""
        self.mock_session = Mock(spec=Session)
        self.user_id = 1
        self.task_id = 1

    def test_create_task(self):
        """Test creating a new task"""
        task_create = TaskCreate(
            title="Test Task",
            description="Test Description",
            completed=False
        )

        # Mock the database operations
        expected_task = Task(
            id=1,
            title="Test Task",
            description="Test Description",
            completed=False,
            user_id=self.user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        with patch('backend.src.services.task_service.select') as mock_select:
            self.mock_session.add.return_value = None
            self.mock_session.commit.return_value = None
            self.mock_session.refresh.return_value = None

            # Set the id after refresh would be called
            created_task = Task(
                id=1,
                title="Test Task",
                description="Test Description",
                completed=False,
                user_id=self.user_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )

            result = TaskService.create_task(self.mock_session, task_create, self.user_id)

            # Verify session operations were called
            self.mock_session.add.assert_called_once()
            self.mock_session.commit.assert_called_once()
            self.mock_session.refresh.assert_called_once()

            assert result.user_id == self.user_id
            assert result.title == "Test Task"

    def test_get_tasks(self):
        """Test getting all tasks for a user"""
        mock_result = Mock()
        mock_result.all.return_value = [
            Task(
                id=1,
                title="Task 1",
                description="Description 1",
                completed=False,
                user_id=self.user_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            ),
            Task(
                id=2,
                title="Task 2",
                description="Description 2",
                completed=True,
                user_id=self.user_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        ]

        with patch('backend.src.services.task_service.select') as mock_select:
            mock_query = Mock()
            mock_query.where.return_value = mock_query
            mock_select.return_value = mock_query

            self.mock_session.exec.return_value = mock_result

            result = TaskService.get_tasks(self.mock_session, self.user_id)

            # Verify the query was constructed correctly
            mock_select.assert_called_once()
            self.mock_session.exec.assert_called_once_with(mock_query)
            assert len(result) == 2

    def test_get_tasks_with_completion_filter(self):
        """Test getting tasks with completion status filter"""
        mock_result = Mock()
        mock_result.all.return_value = [
            Task(
                id=1,
                title="Task 1",
                description="Description 1",
                completed=True,
                user_id=self.user_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        ]

        with patch('backend.src.services.task_service.select') as mock_select:
            mock_query = Mock()
            mock_query.where.return_value = mock_query
            mock_query.where.return_value = mock_query  # For the completed filter
            mock_select.return_value = mock_query

            self.mock_session.exec.return_value = mock_result

            result = TaskService.get_tasks(self.mock_session, self.user_id, completed=True)

            # Verify the query was constructed with completion filter
            mock_select.assert_called_once()
            assert mock_query.where.call_count == 2  # Called twice for both filters
            self.mock_session.exec.assert_called_once_with(mock_query)
            assert len(result) == 1
            assert result[0].completed is True

    def test_get_task_by_id(self):
        """Test getting a specific task by ID"""
        expected_task = Task(
            id=self.task_id,
            title="Test Task",
            description="Test Description",
            completed=False,
            user_id=self.user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        with patch('backend.src.services.task_service.select') as mock_select:
            mock_query = Mock()
            mock_query.where.return_value = mock_query
            mock_select.return_value = mock_query

            mock_exec_result = Mock()
            mock_exec_result.first.return_value = expected_task
            self.mock_session.exec.return_value = mock_exec_result

            result = TaskService.get_task(self.mock_session, self.task_id, self.user_id)

            # Verify the query was constructed correctly
            mock_select.assert_called_once()
            self.mock_session.exec.assert_called_once_with(mock_query)
            mock_exec_result.first.assert_called_once()
            assert result == expected_task

    def test_update_task(self):
        """Test updating an existing task"""
        task_update = TaskUpdate(title="Updated Title")

        existing_task = Task(
            id=self.task_id,
            title="Original Title",
            description="Original Description",
            completed=False,
            user_id=self.user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        # Mock the get_task method to return the existing task
        with patch.object(TaskService, 'get_task', return_value=existing_task):
            self.mock_session.add.return_value = None
            self.mock_session.commit.return_value = None
            self.mock_session.refresh.return_value = None

            result = TaskService.update_task(self.mock_session, self.task_id, task_update, self.user_id)

            # Verify the task was updated
            assert result.title == "Updated Title"
            self.mock_session.add.assert_called_once_with(existing_task)
            self.mock_session.commit.assert_called_once()
            self.mock_session.refresh.assert_called_once()

    def test_update_task_not_found(self):
        """Test updating a task that doesn't exist"""
        task_update = TaskUpdate(title="Updated Title")

        # Mock the get_task method to return None
        with patch.object(TaskService, 'get_task', return_value=None):
            result = TaskService.update_task(self.mock_session, self.task_id, task_update, self.user_id)

            # Verify None is returned when task is not found
            assert result is None

    def test_delete_task(self):
        """Test deleting an existing task"""
        existing_task = Task(
            id=self.task_id,
            title="Test Task",
            description="Test Description",
            completed=False,
            user_id=self.user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        # Mock the get_task method to return the existing task
        with patch.object(TaskService, 'get_task', return_value=existing_task):
            self.mock_session.delete.return_value = None
            self.mock_session.commit.return_value = None

            result = TaskService.delete_task(self.mock_session, self.task_id, self.user_id)

            # Verify the task was deleted
            self.mock_session.delete.assert_called_once_with(existing_task)
            self.mock_session.commit.assert_called_once()
            assert result is True

    def test_delete_task_not_found(self):
        """Test deleting a task that doesn't exist"""
        # Mock the get_task method to return None
        with patch.object(TaskService, 'get_task', return_value=None):
            result = TaskService.delete_task(self.mock_session, self.task_id, self.user_id)

            # Verify False is returned when task is not found
            assert result is False

    def test_update_task_completion(self):
        """Test updating task completion status"""
        existing_task = Task(
            id=self.task_id,
            title="Test Task",
            description="Test Description",
            completed=False,
            user_id=self.user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        # Mock the get_task method to return the existing task
        with patch.object(TaskService, 'get_task', return_value=existing_task):
            self.mock_session.add.return_value = None
            self.mock_session.commit.return_value = None
            self.mock_session.refresh.return_value = None

            result = TaskService.update_task_completion(self.mock_session, self.task_id, True, self.user_id)

            # Verify the completion status was updated
            assert result.completed is True
            self.mock_session.add.assert_called_once_with(existing_task)
            self.mock_session.commit.assert_called_once()
            self.mock_session.refresh.assert_called_once()

    def test_update_task_completion_not_found(self):
        """Test updating completion status of a task that doesn't exist"""
        # Mock the get_task method to return None
        with patch.object(TaskService, 'get_task', return_value=None):
            result = TaskService.update_task_completion(self.mock_session, self.task_id, True, self.user_id)

            # Verify None is returned when task is not found
            assert result is None