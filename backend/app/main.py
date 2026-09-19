from typing import List

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import Base, engine, get_db

# Crea las tablas si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CRUD de usuarios", version="1.0.0")

# CORS: permite que otros orígenes (dominios) puedan hacer peticiones a nuestra API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok"}


@app.post("/users", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED, tags=["Users"])
def create_user(data: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, data.email):
        raise HTTPException(status.HTTP_409_CONFLICT, "Ya existe un usuario con ese email")
    return crud.create_user(db, data)


@app.get("/users", response_model=List[schemas.UserOut], tags=["Users"])
def list_users(search: str = "", skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, search=search, skip=skip, limit=limit)


@app.get("/users/{user_id}", response_model=schemas.UserOut, tags=["Users"])
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
    return user


@app.put("/users/{user_id}", response_model=schemas.UserOut, tags=["Users"])
def update_user(user_id: int, data: schemas.UserUpdate, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")

    # Si cambia el email, verificar que no lo tenga otro usuario
    if data.email and data.email != user.email:
        if crud.get_user_by_email(db, data.email):
            raise HTTPException(status.HTTP_409_CONFLICT, "Ya existe un usuario con ese email")

    return crud.update_user(db, user, data)


@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Users"])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
    crud.delete_user(db, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
