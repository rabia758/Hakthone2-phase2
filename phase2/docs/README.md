# Multi-User Todo Web Application

## Overview

This is a full-stack multi-user todo web application with Next.js frontend, FastAPI backend, SQLModel ORM, and Better Auth JWT authentication. The system provides secure CRUD operations for tasks with proper user isolation.

## Features

- User registration and authentication with JWT tokens
- Secure task management (Create, Read, Update, Delete)
- Task completion tracking
- User isolation (users can only access their own tasks)
- Responsive web interface

## Technology Stack

- **Frontend**: Next.js 16+ with App Router
- **Backend**: Python FastAPI
- **Database**: Neon Serverless PostgreSQL with SQLModel ORM
- **Authentication**: Better Auth with JWT
- **Environment**: UV + Python 3.13+

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Task Management
- `GET /api/{user_id}/tasks` - Get all tasks for a user
- `POST /api/{user_id}/tasks` - Create a new task
- `GET /api/{user_id}/tasks/{id}` - Get a specific task
- `PUT /api/{user_id}/tasks/{id}` - Update a specific task
- `DELETE /api/{user_id}/tasks/{id}` - Delete a specific task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle task completion status

## Getting Started

### Prerequisites

- Python 3.13+
- Node.js 18+
- UV package manager
- Access to Neon PostgreSQL database

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   uv pip install -e .
   ```

3. Create a `.env` file with your database URL and auth secret:
   ```env
   DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname
   BETTER_AUTH_SECRET=your-super-secret-jwt-signing-key
   ```

4. Run the development server:
   ```bash
   uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. Create a `.env.local` file with your API URLs:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000/api/auth
   BETTER_AUTH_SECRET=your-super-secret-jwt-signing-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL database connection string
- `BETTER_AUTH_SECRET`: Secret key for JWT token signing

### Frontend
- `NEXT_PUBLIC_API_URL`: Base URL for the backend API
- `NEXT_PUBLIC_BETTER_AUTH_URL`: URL for authentication endpoints
- `BETTER_AUTH_SECRET`: Secret key for JWT validation

## Project Structure

```
backend/
├── src/
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   ├── api/             # API routes
│   ├── middleware/      # Authentication middleware
│   ├── utils/           # Utility functions
│   └── main.py          # Main application entry point
└── tests/               # Test files

frontend/
├── src/
│   ├── app/             # Next.js app router pages
│   ├── components/      # Reusable UI components
│   ├── lib/             # Utility functions and API client
│   ├── contexts/        # React context providers
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript type definitions
└── tests/               # Test files
```

## Development

### Running Tests

#### Backend
```bash
cd backend
uv run pytest
```

#### Frontend
```bash
cd frontend
npm test
```

## Deployment

### Backend
1. Set up production database (Neon PostgreSQL)
2. Configure environment variables
3. Deploy using your preferred Python hosting (AWS, GCP, etc.)

### Frontend
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or other Next.js hosting

## Security Considerations

- JWT tokens are used for authentication
- All API endpoints require valid JWT tokens
- User data isolation is enforced at the API and database level
- Passwords are hashed using bcrypt
- Input validation is performed at both API and database levels

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request