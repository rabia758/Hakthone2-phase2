import pytest
from unittest.mock import Mock, patch, MagicMock
from sqlmodel import Session
from datetime import datetime
from backend.src.models.user import User, UserCreate
from backend.src.services.user_service import UserService


class TestUserService:
    def setup_method(self):
        """Setup test dependencies"""
        self.mock_session = Mock(spec=Session)
        self.user_id = 1
        self.email = "test@example.com"
        self.password = "testpassword"

    def test_create_user(self):
        """Test creating a new user"""
        user_create = UserCreate(
            email=self.email,
            password=self.password
        )

        # Mock the database operations
        with patch('backend.src.services.user_service.bcrypt') as mock_bcrypt:
            mock_bcrypt.hash.return_value = "hashed_password"

            self.mock_session.add.return_value = None
            self.mock_session.commit.return_value = None
            self.mock_session.refresh.return_value = None

            result = UserService.create_user(self.mock_session, user_create)

            # Verify session operations were called
            self.mock_session.add.assert_called_once()
            self.mock_session.commit.assert_called_once()
            self.mock_session.refresh.assert_called_once()
            mock_bcrypt.hash.assert_called_once()

            assert result.email == self.email

    def test_get_user_by_id(self):
        """Test getting a user by ID"""
        expected_user = User(
            id=self.user_id,
            email=self.email,
            hashed_password="hashed_password",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        with patch('backend.src.services.user_service.select') as mock_select:
            mock_query = Mock()
            mock_query.where.return_value = mock_query
            mock_select.return_value = mock_query

            mock_exec_result = Mock()
            mock_exec_result.first.return_value = expected_user
            self.mock_session.exec.return_value = mock_exec_result

            result = UserService.get_user_by_id(self.mock_session, self.user_id)

            # Verify the query was constructed correctly
            mock_select.assert_called_once()
            self.mock_session.exec.assert_called_once_with(mock_query)
            mock_exec_result.first.assert_called_once()
            assert result == expected_user

    def test_get_user_by_email(self):
        """Test getting a user by email"""
        expected_user = User(
            id=self.user_id,
            email=self.email,
            hashed_password="hashed_password",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        with patch('backend.src.services.user_service.select') as mock_select:
            mock_query = Mock()
            mock_query.where.return_value = mock_query
            mock_select.return_value = mock_query

            mock_exec_result = Mock()
            mock_exec_result.first.return_value = expected_user
            self.mock_session.exec.return_value = mock_exec_result

            result = UserService.get_user_by_email(self.mock_session, self.email)

            # Verify the query was constructed correctly
            mock_select.assert_called_once()
            self.mock_session.exec.assert_called_once_with(mock_query)
            mock_exec_result.first.assert_called_once()
            assert result == expected_user

    def test_authenticate_user_success(self):
        """Test successful user authentication"""
        expected_user = User(
            id=self.user_id,
            email=self.email,
            hashed_password="hashed_password",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        with patch('backend.src.services.user_service.bcrypt') as mock_bcrypt:
            mock_bcrypt.checkpw.return_value = True

            with patch.object(UserService, 'get_user_by_email', return_value=expected_user):
                result = UserService.authenticate_user(self.mock_session, self.email, self.password)

                # Verify bcrypt check was called
                mock_bcrypt.checkpw.assert_called_once_with(self.password.encode('utf-8'), "hashed_password".encode('utf-8'))
                assert result == expected_user

    def test_authenticate_user_wrong_password(self):
        """Test authentication with wrong password"""
        expected_user = User(
            id=self.user_id,
            email=self.email,
            hashed_password="hashed_password",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        with patch('backend.src.services.user_service.bcrypt') as mock_bcrypt:
            mock_bcrypt.checkpw.return_value = False

            with patch.object(UserService, 'get_user_by_email', return_value=expected_user):
                result = UserService.authenticate_user(self.mock_session, self.email, self.password)

                # Verify bcrypt check was called and returned False
                mock_bcrypt.checkpw.assert_called_once_with(self.password.encode('utf-8'), "hashed_password".encode('utf-8'))
                assert result is None

    def test_authenticate_user_user_not_found(self):
        """Test authentication when user doesn't exist"""
        with patch.object(UserService, 'get_user_by_email', return_value=None):
            result = UserService.authenticate_user(self.mock_session, self.email, self.password)

            # Verify None is returned when user is not found
            assert result is None

    def test_hash_password(self):
        """Test password hashing"""
        with patch('backend.src.services.user_service.bcrypt') as mock_bcrypt:
            mock_bcrypt.hash.return_value = "hashed_password"

            result = UserService.hash_password(self.password)

            # Verify bcrypt hash was called
            mock_bcrypt.hash.assert_called_once_with(self.password.encode('utf-8'))
            assert result == "hashed_password"

    def test_verify_password(self):
        """Test password verification"""
        with patch('backend.src.services.user_service.bcrypt') as mock_bcrypt:
            mock_bcrypt.checkpw.return_value = True

            result = UserService.verify_password(self.password, "hashed_password")

            # Verify bcrypt checkpw was called
            mock_bcrypt.checkpw.assert_called_once_with(self.password.encode('utf-8'), "hashed_password".encode('utf-8'))
            assert result is True