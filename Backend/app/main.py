from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes import auth, productos, usuarios, ventas


# ==========================================================
# CREAR TABLAS
# ==========================================================

Base.metadata.create_all(bind=engine)


# ==========================================================
# CREAR APLICACIÓN
# ==========================================================

app = FastAPI(
    title="API Proyecto React",
    version="1.0.0"
)


# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================================
# RUTAS
# ==========================================================

app.include_router(
    usuarios.router
)

app.include_router(
    auth.router
)

app.include_router(
    productos.router
)

app.include_router(
    ventas.router
)


# ==========================================================
# RUTA PRINCIPAL
# ==========================================================

@app.get("/")
def inicio():
    return {
        "success": True,
        "message": "API funcionando correctamente"
    }