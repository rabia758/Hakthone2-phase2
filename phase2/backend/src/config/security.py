"""
Security configuration for the Todo Web Application
"""

import os
from datetime import timedelta

# JWT Settings
JWT_SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "your-default-secret-key-for-development")
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30
JWT_REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password Settings
MIN_PASSWORD_LENGTH = 8
PASSWORD_REQUIRE_UPPERCASE = True
PASSWORD_REQUIRE_LOWERCASE = True
PASSWORD_REQUIRE_DIGITS = True
PASSWORD_REQUIRE_SPECIAL_CHARS = False

# Rate Limiting Settings
RATE_LIMIT_REQUESTS = 10  # Max requests per window
RATE_LIMIT_WINDOW = 60    # Window size in seconds (60 seconds)

# CORS Settings
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# Security Headers (these would be implemented in middleware)
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",  # or "SAMEORIGIN" if needed
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
}

# Input Validation Settings
MAX_EMAIL_LENGTH = 254
MAX_TASK_TITLE_LENGTH = 200
MAX_TASK_DESCRIPTION_LENGTH = 1000

# Session Settings
SESSION_EXPIRE_MINUTES = 30
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15

# Additional Security Settings
ENABLE_CSRF_PROTECTION = True  # Would require additional implementation
MAX_FILE_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB in bytes