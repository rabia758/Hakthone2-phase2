from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.gzip import GZipMiddleware
from .utils.error_handler import init_error_handlers
from .api import auth_routes, task_routes
from .database import create_db_and_tables
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_db_and_tables()
    yield
    # Shutdown (if needed)

app = FastAPI(
    title="Todo API",
    description="Multi-user todo web application API",
    version="1.0.0",
    lifespan=lifespan
)

# Add security and performance middleware
app.add_middleware(
    GZipMiddleware,
    minimum_size=1000,
)

# Add trusted host middleware to prevent HTTP Host Header attacks
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"],  # In production, replace with specific hosts
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize error handlers
init_error_handlers(app)

# Include routers
app.include_router(auth_routes.router, prefix="/api", tags=["authentication"])
app.include_router(task_routes.router, prefix="/api", tags=["tasks"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Todo API"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}