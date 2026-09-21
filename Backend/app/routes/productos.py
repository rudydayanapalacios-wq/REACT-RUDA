from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import obtener_usuario_actual
from ..models import Producto, Usuario
from ..schemas import (
    ProductoCreate,
    ProductoResponse,
    ProductoUpdate,
)

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)


def verificar_administrador(usuario: Usuario):
    if usuario.rol_id != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden realizar esta operación"
        )


@router.get(
    "/",
    response_model=list[ProductoResponse]
)
def listar_productos(
    db: Session = Depends(get_db)
):
    return db.query(Producto).filter(
        Producto.estado == True
    ).all()


@router.post(
    "/",
    response_model=ProductoResponse,
    status_code=status.HTTP_201_CREATED
)
def crear_producto(
    producto: ProductoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    verificar_administrador(usuario)

    nuevo_producto = Producto(
        **producto.model_dump(),
        estado=True
    )

    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)

    return nuevo_producto


@router.get(
    "/{producto_id}",
    response_model=ProductoResponse
)
def obtener_producto(
    producto_id: int,
    db: Session = Depends(get_db)
):
    producto = db.query(Producto).filter(
        Producto.id == producto_id,
        Producto.estado == True
    ).first()

    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )

    return producto


@router.put(
    "/{producto_id}",
    response_model=ProductoResponse
)
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    verificar_administrador(usuario)

    producto = db.query(Producto).filter(
        Producto.id == producto_id
    ).first()

    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )

    for campo, valor in datos.model_dump().items():
        setattr(producto, campo, valor)

    db.commit()
    db.refresh(producto)

    return producto


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_200_OK
)
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    verificar_administrador(usuario)

    producto = db.query(Producto).filter(
        Producto.id == producto_id
    ).first()

    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )

    # Eliminación lógica para conservar el historial de ventas
    producto.estado = False

    db.commit()
    db.refresh(producto)

    return {
        "success": True,
        "message": "Producto eliminado correctamente"
    }