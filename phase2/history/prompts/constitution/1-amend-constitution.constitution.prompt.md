---
id: 1
title: amend-constitution
stage: constitution
date: 2025-12-12
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-cli-todo
user: S-D-C TECH
command: /sp.constitution
labels: [constitution,setup]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
---

## Prompt

version: 1.0.0
name: todo-webapp-fullstack
description: >
  Constitution for transforming a console-based todo app into a modern
  multi-user full-stack web application using Spec-Kit Plus and Claude Code.
  This project follows the Agentic Dev Stack workflow:
  Write Specs → Generate Plan → Break into Tasks → Implement via Claude Code.
  Manual coding is strictly prohibited.

principles:

  - Agentic Development Workflow:
      Development must follow this sequence without skipping any stage:
      1. sp.specify
      2. sp.plan
      3. sp.tasks
      4. sp.implement (Claude Code only)
      All code must be agent-generated and traceable.

  - Technology Stack Requirements:
      * Frontend: Next.js 16+ (App Router)
      * Backend: Python FastAPI
      * ORM: SQLModel
      * Database: Neon Serverless PostgreSQL
      * Authentication: Better Auth (JWT Mode)
      * Spec Framework: Spec-Kit Plus
      * AI Development: Claude Code
      * Environment: UV + Python 3.13+

  - Core Functional Requirements:
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

  - API Requirements:
      The backend must expose REST endpoints:
        GET    /api/{user_id}/tasks
        POST   /api/{user_id}/tasks
        GET    /api/{user_id}/tasks/{id}
        PUT    /api/{user_id}/tasks/{id}
        DELETE /api/{user_id}/tasks/{id}
        PATCH  /api/{user_id}/tasks/{id}/complete
      All endpoints must be JWT-protected.

  - Authentication & Security:
      * Better Auth must be configured to issue JWT tokens on login.
      * Frontend must attach tokens in Authorization: Bearer <token>.
      * Backend must verify JWT via shared environment secret BETTER_AUTH_SECRET.
      * API must enforce:
          - 401 Unauthorized for missing/invalid tokens
          - User isolation: operations only affect the authenticated user's tasks
          - Ownership validation for every endpoint

  - Database & Models:
      * SQLModel must define User and Task models.
      * Task table must include: id, title, description, completed, created_at,
        updated_at, user_id.
      * Database interactions must be typed, transactional, and clean.

  - Frontend Requirements:
      * Use Next.js App Router.
      * Build responsive UI for:
          - Task list
          - Create + update + delete actions
          - Mark complete toggle
          - Auth (login/signup)
      * API client must automatically attach JWT token to every request.

  - Code Quality:
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

  - Runtime Behavior:
      * Fully functional multi-user environment.
      * Stateless authentication via JWT.
      * All user data must be isolated via user_id in DB queries

## Response snapshot

Created and updated the project constitution file with all the specified principles and requirements for the todo-webapp-fullstack project.

## Outcome

- ✅ Impact: Constitution file created with all specified principles
- 🧪 Tests: N/A
- 📁 Files: Updated .specify/memory/constitution.md
- 🔁 Next prompts: /sp.specify to create feature specification
- 🧠 Reflection: Constitution properly established with all required principles and governance structure

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A