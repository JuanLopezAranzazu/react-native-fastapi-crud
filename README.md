# CRUD de usuarios: React Native + FastAPI + SQLAlchemy + MySQL

Proyecto para aprender cómo se conectan una app móvil y una API con base de datos.

```
┌────────────────┐   HTTP/JSON   ┌───────────────┐   SQL   ┌───────┐
│ React Native   │ ────────────► │ FastAPI       │ ──────► │ MySQL │
│ (Expo)         │ ◄──────────── │ + SQLAlchemy  │ ◄────── │       │
└────────────────┘               └───────────────┘         └───────┘
```

## Estructura

```
crud/
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── database.py   # conexión a MySQL
│       ├── models.py     # tabla "users" (SQLAlchemy)
│       ├── schemas.py    # validación de datos (Pydantic)
│       ├── crud.py       # consultas a la BD
│       └── main.py       # endpoints HTTP
└── mobile/
    ├── App.js            # navegación
    └── src/
        ├── config.js     # URL de la API  <-- lo primero que debes editar
        ├── api.js        # llamadas fetch
        ├── theme.js
        └── screens/
            ├── UserListScreen.js   # listar, buscar, eliminar
            └── UserFormScreen.js   # crear y editar
```

---

## 1. Base de datos MySQL

Entra a MySQL y crea la base de datos:

```sql
CREATE DATABASE users_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Las tablas se crean solas al iniciar la API.

## 2. Backend (FastAPI)

Requiere Python 3.9 o superior.

```bash
cd backend
python -m venv venv

# Activar el entorno virtual
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

pip install -r requirements.txt

cp .env.example .env            # Windows: copy .env.example .env
# Edita .env con tu usuario y contraseña de MySQL

uvicorn app.main:app --reload --host 0.0.0.0
```

- `--host 0.0.0.0` es necesario para que tu celular pueda conectarse.
- Abre http://localhost:8000/docs: puedes probar todos los endpoints desde el navegador antes de tocar la app.

## 3. App móvil (React Native con Expo)

Necesitas Node.js instalado y la app **Expo Go** en tu celular.

```bash
cd mobile
npm install
```

Edita `src/config.js` y pon la IP de tu PC:

| Dónde corres la app | URL |
|---|---|
| Celular físico (Expo Go) | `http://IP_DE_TU_PC:8000` (misma red WiFi) |
| Emulador Android | `http://10.0.2.2:8000` |
| Simulador iOS / Web | `http://localhost:8000` |

Inicia la app y escanea el QR con Expo Go:

```bash
npx expo start
```

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| POST | `/users` | Crea un usuario |
| GET | `/users?search=ana` | Lista (con búsqueda opcional) |
| GET | `/users/{id}` | Obtiene uno |
| PUT | `/users/{id}` | Actualiza |
| DELETE | `/users/{id}` | Elimina |

Ejemplo de JSON para crear:

```json
{ "name": "Ana Pérez", "email": "ana@correo.com", "phone": "300 123 4567", "is_active": true }
```
