<!--
Sync Impact Report:
- Version change: N/A → 1.0.0
- Modified principles: [PRINCIPLE_1_NAME] → Agentic Development Workflow, [PRINCIPLE_2_NAME] → Technology Stack Requirements, [PRINCIPLE_3_NAME] → Core Functional Requirements, [PRINCIPLE_4_NAME] → API Requirements, [PRINCIPLE_5_NAME] → Authentication & Security, [PRINCIPLE_6_NAME] → Database & Models
- Added sections: Frontend Requirements, Code Quality, Runtime Behavior
- Removed sections: None
- Templates requiring updates: ⚠ pending - .specify/templates/plan-template.md, .specify/templates/spec-template.md, .specify/templates/tasks-template.md
- Follow-up TODOs: None
-->
# todo-webapp-fullstack Constitution

## Core Principles

### Agentic Development Workflow
Development must follow this sequence without skipping any stage:
1. sp.specify
2. sp.plan
3. sp.tasks
4. sp.implement (Claude Code only)
All code must be agent-generated and traceable.

### Technology Stack Requirements
* Frontend: Next.js 16+ (App Router)
* Backend: Python FastAPI
* ORM: SQLModel
* Database: Neon Serverless PostgreSQL
* Authentication: Better Auth (JWT Mode)
* Spec Framework: Spec-Kit Plus
* AI Development: Claude Code
* Environment: UV + Python 3.13+

### Core Functional Requirements
The web app must implement all five basic features:
  1. Add task
  2. Delete task
  3. Update task
  4. View tasks
  5. Mark task as complete

These features must be delivered as:
  - RESTful API endpoints in FastAPI
  - Interactive frontend UI in Next.js
  - Persistent storage using PostgreSQL via SQLModel ORM

### API Requirements
The backend must expose REST endpoints:
  GET    /api/{user_id}/tasks
  POST   /api/{user_id}/tasks
  GET    /api/{user_id}/tasks/{id}
  PUT    /api/{user_id}/tasks/{id}
  DELETE /api/{user_id}/tasks/{id}
  PATCH  /api/{user_id}/tasks/{id}/complete
All endpoints must be JWT-protected.

### Authentication & Security
* Better Auth must be configured to issue JWT tokens on login.
* Frontend must attach tokens in Authorization: Bearer <token>.
* Backend must verify JWT via shared environment secret BETTER_AUTH_SECRET.
* API must enforce:
    - 401 Unauthorized for missing/invalid tokens
    - User isolation: operations only affect the authenticated user's tasks
    - Ownership validation for every endpoint

### Database & Models
* SQLModel must define User and Task models.
* Task table must include: id, title, description, completed, created_at,
  updated_at, user_id.
* Database interactions must be typed, transactional, and clean.

## Frontend Requirements
* Use Next.js App Router.
* Build responsive UI for:
    - Task list
    - Create + update + delete actions
    - Mark complete toggle
    - Auth (login/signup)
* API client must automatically attach JWT token to every request.

## Code Quality
* Clean, modular, well-structured code.
* Proper separation of concerns:
      frontend/
      backend/
        app/
          api/
          models/
          services/
          auth/
* No duplicated business logic between frontend and backend.
* Everything must be generated via Spec-Kit Plus tasks.

## Runtime Behavior
* Fully functional multi-user environment.
* Stateless authentication via JWT.
* All user data must be isolated via user_id in DB queries.

## Governance

Constitution supersedes all other practices. Amendments require documentation, approval, and migration plan.

**Version**: 1.0.0 | **Ratified**: 2025-12-12 | **Last Amended**: 2025-12-12