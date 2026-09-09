from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .auth import obtener_datos_token
from .database import get_db
from .models import Usuario

esquema_seguridad = HTTPBearer(auto_error=False)


def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials | None = Depends(
        esquema_seguridad
    ),
    db: Session = Depends(get_db)
) -> Usuario:
    if not credenciales:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debes enviar un token Bearer",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        datos_token = obtener_datos_token(credenciales.credentials)
        usuario_id = int(datos_token.get("sub", ""))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"}
        )

    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id,
        Usuario.estado == True
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El usuario no existe o está inactivo",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return usuario