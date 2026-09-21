from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import PQR, Usuario
from ..schemas import (
    PQRCreate,
    PQREstadoUpdate,
    PQRRespuestaUpdate,
    PQRResponse
)
from ..dependencies import obtener_usuario_actual


router = APIRouter(
    prefix="/pqr",
    tags=["PQR"]
)


# ==========================================================
# CONSTRUIR RESPUESTA CON DATOS DEL CLIENTE
# ==========================================================

def construir_pqr_response(
    db: Session,
    pqr: PQR
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == pqr.usuario_id)
        .first()
    )

    nombre_cliente = None
    correo_cliente = None

    if usuario:
        nombre_cliente = (
            f"{usuario.nombres} {usuario.apellidos}"
        ).strip()

        correo_cliente = usuario.email

    return {
        "id": pqr.id,
        "usuario_id": pqr.usuario_id,
        "tipo": pqr.tipo,
        "asunto": pqr.asunto,
        "descripcion": pqr.descripcion,
        "respuesta": pqr.respuesta,
        "respondido_por": pqr.respondido_por,
        "estado": pqr.estado,
        "fecha": pqr.fecha,
        "nombre_cliente": nombre_cliente,
        "correo_cliente": correo_cliente,
    }


# ==========================================================
# OBTENER PQR
# ==========================================================

@router.get("/", response_model=list[PQRResponse])
def obtener_pqr(
    db: Session = Depends(get_db),
    usuario_actual=Depends(obtener_usuario_actual)
):
    # Administrador y empleado pueden ver todas
    if usuario_actual.rol_id in [1, 3]:

        pqr_lista = (
            db.query(PQR)
            .order_by(PQR.fecha.desc())
            .all()
        )

        return [
            construir_pqr_response(db, pqr)
            for pqr in pqr_lista
        ]

    # Cliente solamente puede ver sus propias PQR
    if usuario_actual.rol_id == 2:

        pqr_lista = (
            db.query(PQR)
            .filter(PQR.usuario_id == usuario_actual.id)
            .order_by(PQR.fecha.desc())
            .all()
        )

        return [
            construir_pqr_response(db, pqr)
            for pqr in pqr_lista
        ]

    raise HTTPException(
        status_code=403,
        detail="No tienes permisos para consultar las PQR."
    )


# ==========================================================
# CREAR PQR
# ==========================================================

@router.post("/", response_model=PQRResponse)
def crear_pqr(
    datos: PQRCreate,
    db: Session = Depends(get_db),
    usuario_actual=Depends(obtener_usuario_actual)
):
    # Cliente y empleado pueden crear PQR
    if usuario_actual.rol_id not in [2, 3]:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para crear una PQR."
        )

    nueva_pqr = PQR(
        usuario_id=usuario_actual.id,
        tipo=datos.tipo,
        asunto=datos.asunto,
        descripcion=datos.descripcion,
        respuesta=None,
        respondido_por=None,
        estado="pendiente"
    )

    db.add(nueva_pqr)
    db.commit()
    db.refresh(nueva_pqr)

    return construir_pqr_response(
        db,
        nueva_pqr
    )


# ==========================================================
# ACTUALIZAR ESTADO
# ==========================================================

@router.put("/{pqr_id}/estado", response_model=PQRResponse)
def actualizar_estado_pqr(
    pqr_id: int,
    datos: PQREstadoUpdate,
    db: Session = Depends(get_db),
    usuario_actual=Depends(obtener_usuario_actual)
):
    # Administrador y empleado pueden cambiar estados
    if usuario_actual.rol_id not in [1, 3]:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para cambiar el estado de una PQR."
        )

    pqr = (
        db.query(PQR)
        .filter(PQR.id == pqr_id)
        .first()
    )

    if not pqr:
        raise HTTPException(
            status_code=404,
            detail="La PQR no existe."
        )

    pqr.estado = datos.estado

    db.commit()
    db.refresh(pqr)

    return construir_pqr_response(
        db,
        pqr
    )


# ==========================================================
# RESPONDER PQR
# ==========================================================

@router.put("/{pqr_id}/responder", response_model=PQRResponse)
def responder_pqr(
    pqr_id: int,
    datos: PQRRespuestaUpdate,
    db: Session = Depends(get_db),
    usuario_actual=Depends(obtener_usuario_actual)
):
    # Administrador y empleado pueden responder
    if usuario_actual.rol_id not in [1, 3]:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para responder una PQR."
        )

    pqr = (
        db.query(PQR)
        .filter(PQR.id == pqr_id)
        .first()
    )

    if not pqr:
        raise HTTPException(
            status_code=404,
            detail="La PQR no existe."
        )

    # Guardar respuesta
    pqr.respuesta = datos.respuesta

    # Guardar quién respondió
    pqr.respondido_por = usuario_actual.id

    # Actualizar estado
    pqr.estado = datos.estado

    db.commit()
    db.refresh(pqr)

    # IMPORTANTE:
    # Ya no devolvemos directamente "pqr".
    # Construimos la respuesta incluyendo nombre y correo.
    return construir_pqr_response(
        db,
        pqr
    )