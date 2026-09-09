import os
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
    hashed = bcrypt.hashpw(password_bytes, salt )

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
# TOKEN DE RECUPERACIÓN DE CONTRASEÑA
# ==========================================================

def crear_token_recuperacion(
    usuario_id: int
) -> str:

    expiracion = (
        datetime.now(timezone.utc)
        + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    )

    datos = {
        "sub": str(usuario_id),
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