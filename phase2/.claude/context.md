# todo-webapp-fullstack Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-12

## Active Technologies

- Python 3.13+ with FastAPI for backend API
- Next.js 16+ with App Router for frontend
- SQLModel ORM for database operations
- Neon Serverless PostgreSQL for data storage
- Better Auth for JWT-based authentication
- UV package manager for Python dependencies
- pytest for backend testing
- Jest/React Testing Library for frontend testing

## Project Structure

```text
backend/
├── src/
│   ├── models/
│   │   ├── user.py
│   │   └── task.py
│   ├── services/
│   │   ├── auth.py
│   │   ├── user_service.py
│   │   └── task_service.py
│   ├── api/
│   │   ├── auth_routes.py
│   │   └── task_routes.py
│   └── main.py
└── tests/
    ├── unit/
    └── integration/

frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── signup/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── TaskList/
│   │   ├── TaskForm/
│   │   └── Auth/
│   ├── lib/
│   │   └── api.ts
│   └── types/
│       └── index.ts
└── tests/
    ├── unit/
    └── integration/
```

## Commands

### Backend Commands
```bash
# Set up backend environment
cd backend
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install fastapi sqlmodel uvicorn python-multipart python-jose[cryptography] passlib[bcrypt] python-dotenv

# Run backend server
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Run backend tests
uv run pytest
```

### Frontend Commands
```bash
# Set up frontend
cd frontend
npm install

# Run frontend development server
npm run dev

# Run frontend tests
npm test
```

### Database Commands
```bash
# Initialize database tables
uv run python -c "from src.models import create_db_and_tables; create_db_and_tables()"
```

## Code Style

### Python (Backend)
- Follow PEP 8 guidelines
- Use type hints for all function parameters and return values
- Use Pydantic models for data validation
- Use async/await for asynchronous operations
- Structure code in models, services, and API layers

### JavaScript/TypeScript (Frontend)
- Use TypeScript for type safety
- Follow Next.js best practices with App Router
- Use React hooks appropriately
- Implement proper error handling and loading states
- Structure components in a reusable manner

## Recent Changes

- Feature 002-todo-webapp-fullstack: Full multi-user todo application with authentication
  - Added Next.js frontend with user authentication
  - Added FastAPI backend with JWT-protected endpoints
  - Implemented SQLModel for User and Task entities
  - Added Better Auth integration for user management
  - Created API contracts for task CRUD operations

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->