# Multi-User Todo Web Application

This is a full-stack multi-user todo web application built with Next.js, FastAPI, SQLModel, and Neon PostgreSQL. The application follows the agentic development workflow using Spec-Kit Plus and Claude Code.

## Project Structure

```
.
├── backend/              # FastAPI backend
│   ├── src/
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   ├── api/          # API routes
│   │   ├── middleware/   # Authentication middleware
│   │   └── utils/        # Utility functions
│   └── tests/            # Backend tests
├── frontend/             # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # Reusable UI components
│   │   ├── lib/          # API client and utilities
│   │   ├── contexts/     # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   └── types/        # TypeScript type definitions
│   └── tests/            # Frontend tests
├── docs/                 # Documentation
├── specs/                # Feature specifications
│   └── 002-todo-webapp-fullstack/  # Current feature specs
└── .specify/             # Spec-Kit Plus configuration
```

## Features

- User registration and authentication with JWT tokens
- Secure task management (Create, Read, Update, Delete)
- Task completion tracking
- User isolation (users can only access their own tasks)
- Responsive web interface

## Getting Started

For detailed setup instructions, see [docs/quickstart.md](./docs/quickstart.md).

## Development Workflow

This project follows the agentic development workflow:

1. **Specification** (`/sp.specify`) - Define feature requirements
2. **Planning** (`/sp.plan`) - Create implementation plan
3. **Tasks** (`/sp.tasks`) - Generate implementation tasks
4. **Implementation** (`/sp.implement`) - Execute tasks

## Technology Stack

- **Frontend**: Next.js 16+ with App Router
- **Backend**: Python FastAPI
- **Database**: Neon Serverless PostgreSQL with SQLModel ORM
- **Authentication**: Better Auth with JWT
- **Environment**: UV + Python 3.13+

## Documentation

- [Quickstart Guide](./docs/quickstart.md)
- [Full Documentation](./docs/README.md)

## Contributing

This project is built using Spec-Kit Plus and Claude Code. All code is AI-generated following the defined constitution and specifications.

## License

[Specify your license here]