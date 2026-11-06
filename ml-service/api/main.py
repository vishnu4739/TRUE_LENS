"""FastAPI application entry point for TrueLens ML Service."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import load_all_saved_models, router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("truelens_ml")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load saved models from disk
    logger.info("Initializing TrueLens ML Service...")
    load_all_saved_models()
    yield
    # Shutdown
    logger.info("Shutting down TrueLens ML Service...")


app = FastAPI(
    title="TrueLens ML Service",
    description="Machine learning API for AI-generated vs real photograph detection",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
