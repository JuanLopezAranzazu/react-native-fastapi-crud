import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()  # lee el archivo .env

DATABASE_URL = os.getenv("DATABASE_URL")

# pool_pre_ping evita errores cuando MySQL cierra conexiones inactivas
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Dependencia de FastAPI: abre una sesión por request
    y la cierra al terminar, pase lo que pase.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
