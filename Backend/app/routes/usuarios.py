from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Usuario, Rol, Venta
from ..schemas import (
    UsuarioCreate,
    UsuarioEstado,
    UsuarioResponse,
    UsuarioUpdate,
)
from ..auth import hash_password
from ..dependencies import obtener_usuario_actual


router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


# ============================================================
# CREAR USUARIO
# ============================================================

@router.post(
    "/",
    response_model=UsuarioResponse,
    status_code=201
)
def crear_usuario(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db)
):
    usuario_existente = db.query(Usuario).filter(
        Usuario.email == usuario.email
    ).first()

    if usuario_existente:
        raise HTTPException(
            status_code=400,
            detail="El correo ya está registrado"
        )

    documento_existente = db.query(Usuario).filter(
        Usuario.numero_documento == usuario.numero_documento
    ).first()

    if documento_existente:
        raise HTTPException(
            status_code=400,
            detail="El número de documento ya está registrado"
        )

    rol_cliente = db.query(Rol).filter(
        Rol.nombre == "Cliente",
        Rol.estado == True
    ).first()

    if not rol_cliente:
        raise HTTPException(
            status_code=500,
            detail="El rol cliente no existe o se encuentra inactivo"
        )

    try:
        password_hash = hash_password(usuario.password)

        nuevo_usuario = Usuario(
            rol_id=rol_cliente.id,
            nombres=usuario.nombres,
            apellidos=usuario.apellidos,
            tipo_documento=usuario.tipo_documento,
            numero_documento=usuario.numero_documento,
            direccion=usuario.direccion,
            telefono=usuario.telefono,
            email=usuario.email,
            password=password_hash,
            estado=True
        )

        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)

        return nuevo_usuario

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="No fue posible registrar el usuario"
        )


# ============================================================
# VERIFICAR ADMINISTRADOR
# ============================================================

def verificar_administrador(usuario: Usuario):
    if usuario.rol_id != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden gestionar usuarios"
        )


# ============================================================
# LISTAR USUARIOS
# ============================================================

@router.get(
    "/",
    response_model=list[UsuarioResponse]
)
def listar_usuarios(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    verificar_administrador(usuario_actual)

    return db.query(Usuario).all()


# ============================================================
# OBTENER USUARIO
# ============================================================

@router.get(
    "/{usuario_id}",
    response_model=UsuarioResponse
)
def obtener_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    verificar_administrador(usuario_actual)

    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    return usuario


# ============================================================
# ACTUALIZAR USUARIO
# ============================================================

@router.put(
    "/{usuario_id}",
    response_model=UsuarioResponse
)
def actualizar_usuario(
    usuario_id: int,
    datos: UsuarioUpdate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    verificar_administrador(usuario_actual)

    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    valores = datos.model_dump(exclude_unset=True)

    if "password" in valores:
        valores["password"] = hash_password(valores["password"])

    for campo, valor in valores.items():
        setattr(usuario, campo, valor)

    try:
        db.commit()
        db.refresh(usuario)

        return usuario

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="No fue posible actualizar el usuario"
        )


# ============================================================
# CAMBIAR ESTADO DEL USUARIO
# ============================================================

@router.patch(
    "/{usuario_id}/estado",
    response_model=UsuarioResponse
)
def cambiar_estado_usuario(
    usuario_id: int,
    datos: UsuarioEstado,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    verificar_administrador(usuario_actual)

    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    usuario.estado = datos.estado

    try:
        db.commit()
        db.refresh(usuario)

        return usuario

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="No fue posible cambiar el estado del usuario"
        )


# ============================================================
# ELIMINAR USUARIO
# ============================================================

@router.delete(
    "/{usuario_id}",
    responses={
        400: {
            "description": (
                "El usuario no puede eliminarse porque "
                "tiene ventas registradas."
            ),
            "content": {
                "application/json": {
                    "example": {
                        "detail": (
                            "No se puede eliminar este usuario porque "
                            "tiene ventas registradas. Puedes cambiar "
                            "su estado a inactivo."
                        )
                    }
                }
            }
        },
        404: {
            "description": "Usuario no encontrado",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Usuario no encontrado"
                    }
                }
            }
        },
        403: {
            "description": "El usuario actual no es administrador",
            "content": {
                "application/json": {
                    "example": {
                        "detail": (
                            "Solo los administradores pueden "
                            "gestionar usuarios"
                        )
                    }
                }
            }
        }
    }
)
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    verificar_administrador(usuario_actual)

    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    # ========================================================
    # VERIFICAR SI EL USUARIO TIENE VENTAS
    # ========================================================

    tiene_ventas = db.query(Venta).filter(
        Venta.usuario_id == usuario_id
    ).first()

    if tiene_ventas:
        raise HTTPException(
            status_code=400,
            detail=(
                "No se puede eliminar este usuario porque "
                "tiene ventas registradas. Puedes cambiar "
                "su estado a inactivo."
            )
        )

    # ========================================================
    # ELIMINAR USUARIO
    # ========================================================

    try:
        db.delete(usuario)
        db.commit()

        return {
            "success": True,
            "message": "Usuario eliminado correctamente"
        }

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="No fue posible eliminar el usuario"
        )