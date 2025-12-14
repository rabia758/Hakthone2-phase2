# Quickstart Guide: Multi-User Todo Web Application

## Overview

This guide provides instructions for setting up and running the multi-user todo web application. The application consists of a Next.js frontend and a FastAPI backend with Neon PostgreSQL database.

## Prerequisites

- Python 3.13+
- Node.js 18+ (for Next.js)
- UV package manager
- Access to Neon PostgreSQL database
- Better Auth account or self-hosted authentication service

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Backend Setup

Navigate to the backend directory and set up the Python environment:

```bash
cd backend
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e .
```

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname
BETTER_AUTH_SECRET=your-super-secret-jwt-signing-key
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
# or if using pnpm/yarn
pnpm install
# or
yarn install
```

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000/api/auth
BETTER_AUTH_SECRET=your-super-secret-jwt-signing-key
```

## Database Setup

### 1. Initialize the Database

Run the following command to create the necessary tables:

```bash
cd backend
# Activate your virtual environment first
uv run python -c "from src.database import create_db_and_tables; create_db_and_tables()"
```

## Running the Application

### 1. Start the Backend

```bash
cd backend
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`.

### 2. Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
# or
pnpm dev
# or
yarn dev
```

The frontend will be available at `http://localhost:3000`.

## API Endpoints

The backend provides the following endpoints:

- `GET /api/{user_id}/tasks` - Get user's tasks
- `POST /api/{user_id}/tasks` - Create a new task
- `GET /api/{user_id}/tasks/{id}` - Get specific task
- `PUT /api/{user_id}/tasks/{id}` - Update a task
- `DELETE /api/{user_id}/tasks/{id}` - Delete a task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle task completion

## Authentication

The application uses Better Auth for authentication with JWT tokens:

1. Users register/login through the frontend
2. JWT tokens are stored securely in the browser
3. All API requests include the JWT in the Authorization header
4. Backend validates tokens and extracts user_id for authorization

## Testing

### Backend Tests

Run backend tests using pytest:

```bash
cd backend
uv run pytest
```

### Frontend Tests

Run frontend tests:

```bash
cd frontend
npm test
# or
pnpm test
# or
yarn test
```

## Development Workflow

1. Make changes to the code
2. Backend changes auto-reload with `--reload` flag
3. Frontend changes auto-reload in development mode
4. Run tests before committing changes
5. Follow the agentic development workflow: specify → plan → tasks → implement

## Deployment

### Backend Deployment

1. Set up production database (Neon PostgreSQL)
2. Configure environment variables
3. Deploy using your preferred Python hosting (AWS, GCP, etc.)
4. Set up proper logging and monitoring

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or other Next.js hosting
3. Configure environment variables for production API endpoints

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Verify DATABASE_URL in backend .env file
   - Check Neon PostgreSQL connection settings
   - Ensure firewall rules allow connections

2. **Authentication Issues**:
   - Verify BETTER_AUTH_SECRET matches between frontend and backend
   - Check JWT token expiration settings
   - Ensure CORS is properly configured

3. **API Connection Issues**:
   - Verify NEXT_PUBLIC_API_URL in frontend .env
   - Check if backend is running and accessible
   - Confirm proper authorization headers are being sent

### Useful Commands

```bash
# Check backend API status
curl http://localhost:8000/health

# View backend logs
tail -f logs/backend.log

# Run database health check
uv run python -c "from src.database import engine; connection = engine.connect(); print('Database connected successfully'); connection.close()"
```