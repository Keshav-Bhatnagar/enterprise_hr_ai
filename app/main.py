from fastapi import FastAPI, HTTPException
import logging
from app.api import dashboard, attrition
from app.utils.logger import setup_logging
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from contextlib import asynccontextmanager

# Create prediction logs dir
os.makedirs('data/predictions', exist_ok=True)

setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application starting up...")
    try:
        from app.api.attrition import get_attrition_predictor
        get_attrition_predictor()
    except Exception as e:
        logger.warning(f"Predictor preload skipped: {e}")
    yield
    logger.info("Application shutting down...")

app = FastAPI(title="Enterprise HR AI API", version="1.0", lifespan=lifespan)

# Enterprise Optimizations: Compress large JSON payloads (e.g., Intelligence Matrix)
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import dashboard, attrition, agent, auth, hcm, ingestion, compliance, retention

app.include_router(auth.router)
app.include_router(attrition.router)
app.include_router(dashboard.router)
app.include_router(agent.router)
app.include_router(hcm.router)
app.include_router(ingestion.router)
app.include_router(compliance.router)
app.include_router(retention.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Enterprise HR AI API"}
