import os
import secrets

from datetime import datetime, timedelta, timezone

import bcrypt
from dotenv import load_dotenv
from jose import JWTError, jwt


# ==========================================================
# CONFIGURACIÓN
# ==========================================================

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not JWT_SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY no está configurada en .env"
    )

JWT_ALGORITHM = "HS256"


# Token normal de inicio de sesión
JWT_EXPIRE_MINUTES = 60

# Token para recuperación de contraseña
RESET_TOKEN_EXPIRE_MINUTES = 15


# ==========================================================
# CONTRASEÑAS
# ==========================================================

def hash_password(password: str) -> str:
    """
    Genera un hash seguro de la contraseña.

    bcrypt trabaja con un máximo de 72 bytes.
    """
    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        raise ValueError(
            "La contraseña no puede superar los 72 bytes."
        )

    salt = bcrypt.gensalt()

    hashed = bcrypt.hashpw(
        password_bytes,
        salt
    )

    return hashed.decode("utf-8")


def verify_password(
    password: str,
    hashed_password: str
) -> bool:

    password_bytes = password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")

    return bcrypt.checkpw(
        password_bytes,
        hashed_bytes
    )


# ==========================================================
# TOKEN DE ACCESO
# ==========================================================

def crear_token_acceso(
    usuario_id: int,
    rol_id: int
) -> str:

    expiracion = (
        datetime.now(timezone.utc)
        + timedelta(minutes=JWT_EXPIRE_MINUTES)
    )

    datos = {
        "sub": str(usuario_id),
        "rol_id": rol_id,
        "tipo": "acceso",
        "exp": expiracion,
    }

    return jwt.encode(
        datos,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )


def obtener_datos_token(token: str) -> dict:

    try:
        return jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

    except JWTError as error:
        raise ValueError(
            "Token inválido o expirado"
        ) from error


# ==========================================================
# RECUPERACIÓN DE CONTRASEÑA
# ==========================================================

def generar_codigo_recuperacion() -> str:
    """
    Genera un código numérico de 6 dígitos.

    secrets se utiliza para generar valores
    aleatorios apropiados para procesos de seguridad.
    """

    return f"{secrets.randbelow(1_000_000):06d}"


def crear_token_recuperacion(
    usuario_id: int,
    codigo: str
) -> str:
    """
    Crea un JWT temporal que contiene:

    - ID del usuario
    - código de recuperación
    - tipo de token
    - fecha de expiración

    El código NO se guarda en la base de datos.
    """

    expiracion = (
        datetime.now(timezone.utc)
        + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    )

    datos = {
        "sub": str(usuario_id),
        "codigo": codigo,
        "tipo": "recuperacion",
        "exp": expiracion,
    }

    return jwt.encode(
        datos,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )


def obtener_datos_token_recuperacion(
    token: str
) -> dict:
    """
    Valida el token temporal de recuperación.
    """

    try:
        datos = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        # Comprobamos que sea un token
        # de recuperación y no uno de login.
        if datos.get("tipo") != "recuperacion":
            raise ValueError(
                "Token de recuperación inválido"
            )

        return datos

    except JWTError as error:
        raise ValueError(
            "Token de recuperación inválido o expirado"
        ) from error


def verificar_codigo_recuperacion(
    token: str,
    codigo_ingresado: str
) -> dict:
    """
    Verifica que el código ingresado coincida
    con el código almacenado temporalmente dentro
    del JWT de recuperación.
    """

    datos = obtener_datos_token_recuperacion(token)

    codigo_guardado = str(
        datos.get("codigo", "")
    )

    codigo_ingresado = str(
        codigo_ingresado
    ).strip()

    if codigo_guardado != codigo_ingresado:
        raise ValueError(
            "El código de recuperación es incorrecto."
        )

    return datos

def crear_token_restablecimiento(
    usuario_id: int
) -> str:
    """
    Crea un token temporal para permitir
    el cambio de contraseña después de
    verificar correctamente el código.
    """

    expiracion = (
        datetime.now(timezone.utc)
        + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    )

    datos = {
        "sub": str(usuario_id),
        "tipo": "restablecimiento",
        "exp": expiracion,
    }

    return jwt.encode(
        datos,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )


def obtener_datos_token_restablecimiento(
    token: str
) -> dict:
    """
    Valida el token generado después
    de verificar el código.
    """

    try:
        datos = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        if datos.get("tipo") != "restablecimiento":
            raise ValueError(
                "Token de restablecimiento inválido"
            )

        return datos

    except JWTError as error:
        raise ValueError(
            "Token de restablecimiento inválido o expirado"
        ) from error