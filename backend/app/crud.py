from typing import Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from . import models, schemas


def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, search: str = "", skip: int = 0, limit: int = 100):
    query = db.query(models.User)
    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(models.User.name.like(like), models.User.email.like(like))
        )
    return query.order_by(models.User.id.desc()).offset(skip).limit(limit).all()


def create_user(db: Session, data: schemas.UserCreate) -> models.User:
    user = models.User(**data.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)  # recarga el objeto para obtener id y created_at
    return user


def update_user(db: Session, user: models.User, data: schemas.UserUpdate) -> models.User:
    # exclude_unset=True -> solo los campos que el cliente realmente envió
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: models.User) -> None:
    db.delete(user)
    db.commit()
