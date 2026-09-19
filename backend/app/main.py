from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models, schemas
from .database import Base, engine, get_db

# Crea las tablas si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CRUD de usuarios", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok"}

