import os

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import (
    crear_token_acceso,
    crear_token_recuperacion,
    hash_password,
    obtener_datos_token_recuperacion,
    verify_password,
)

from ..correo import enviar_correo_recuperacion
from ..database import get_db
from ..dependencies import obtener_usuario_actual
from ..models import Usuario

from ..schemas import (
    LoginRequest,
    LoginResponse,
    RecuperarContrasenaRequest,
    RestablecerContrasenaRequest,
    UsuarioPerfilUpdate,
    UsuarioResponse,
)


router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)


# ==========================================================
# LOGIN
# ==========================================================

@router.post(
    "/login",
    response_model=LoginResponse
)
def iniciar_sesion(
    credenciales: LoginRequest,
    db: Session = Depends(get_db)
):

    usuario = db.query(Usuario).filter(
        Usuario.email == credenciales.email
    ).first()

    if not usuario or not verify_password(
        credenciales.password,
        usuario.password
    ):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El correo o la contraseña son incorrectos"
        )

    if not usuario.estado:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario se encuentra inactivo"
        )

    return {
        "success": True,
        "token": crear_token_acceso(
            usuario.id,
            usuario.rol_id
        ),
        "usuario": usuario,
    }


# ==========================================================
# RECUPERAR CONTRASEÑA
# ==========================================================

@router.post("/recuperar")
async def solicitar_recuperacion(
    datos: RecuperarContrasenaRequest,
    db: Session = Depends(get_db)
):

    print("====================================")
    print("SOLICITUD DE RECUPERACIÓN")
    print("CORREO RECIBIDO:", datos.email)

    # ------------------------------------------------------
    # BUSCAR USUARIO
    # ------------------------------------------------------

    usuario = db.query(Usuario).filter(
        Usuario.email == datos.email
    ).first()

    print("USUARIO ENCONTRADO:", usuario)

    mensaje = (
        "Si el correo está registrado, "
        "recibirás un enlace para recuperar tu contraseña."
    )

    # ------------------------------------------------------
    # USUARIO NO ENCONTRADO O INACTIVO
    # ------------------------------------------------------

    if not usuario or not usuario.estado:

        print(
            "NO SE ENCONTRO EL USUARIO "
            "O ESTA INACTIVO"
        )

        print("====================================")

        return {
            "success": True,
            "message": mensaje,
        }

    # ------------------------------------------------------
    # USUARIO ENCONTRADO
    # ------------------------------------------------------

    print("USUARIO CORRECTO")
    print("ID DEL USUARIO:", usuario.id)

    # ------------------------------------------------------
    # CREAR TOKEN DE RECUPERACIÓN
    # ------------------------------------------------------

    try:

        token = crear_token_recuperacion(
            usuario.id
        )

        print("TOKEN GENERADO CORRECTAMENTE")

    except Exception as error:

        print(
            "ERROR CREANDO TOKEN:",
            repr(error)
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "No fue posible generar "
                "el token de recuperación."
            )
        )

    # ------------------------------------------------------
    # TOKEN SOLO PARA PRUEBAS LOCALES
    # ------------------------------------------------------

    print("====================================")
    print("TOKEN DE RECUPERACIÓN:")
    print(token)
    print("====================================")

    # ------------------------------------------------------
    # OBTENER URL DEL FRONTEND
    # ------------------------------------------------------

    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    ).rstrip("/")

    # ------------------------------------------------------
    # CREAR ENLACE
    # ------------------------------------------------------

    enlace = (
        f"{frontend_url}"
        f"/restablecer-contrasena"
        f"?token={token}"
    )

    print("ENLACE DE RECUPERACIÓN:")
    print(enlace)
    print("====================================")

    # ------------------------------------------------------
    # ENVIAR CORREO
    # ------------------------------------------------------

    try:

        print("INICIANDO ENVÍO DEL CORREO")
        print("DESTINO:", datos.email)

        await enviar_correo_recuperacion(
            datos.email,
            enlace
        )

        print(
            "CORREO DE RECUPERACIÓN ENVIADO"
        )

    except Exception as error:

        print("====================================")
        print(
            "ERROR ENVIANDO CORREO "
            "DE RECUPERACIÓN"
        )
        print(
            "TIPO:",
            type(error).__name__
        )
        print(
            "ERROR:",
            repr(error)
        )
        print("====================================")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "No fue posible enviar el correo "
                "de recuperación."
            )
        )

    # ------------------------------------------------------
    # FINALIZAR
    # ------------------------------------------------------

    print(
        "SOLICITUD DE RECUPERACIÓN TERMINADA"
    )

    print("====================================")

    return {
        "success": True,
        "message": mensaje,
        "token": token
    }


# ==========================================================
# RESTABLECER CONTRASEÑA
# ==========================================================

@router.post("/restablecer")
def restablecer_contrasena(
    datos: RestablecerContrasenaRequest,
    db: Session = Depends(get_db)
):

    # ------------------------------------------------------
    # VALIDAR TOKEN
    # ------------------------------------------------------

    try:

        datos_token = (
            obtener_datos_token_recuperacion(
                datos.token
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )

    # ------------------------------------------------------
    # OBTENER ID DEL USUARIO
    # ------------------------------------------------------

    try:

        usuario_id = int(
            datos_token.get("sub")
        )

    except (TypeError, ValueError):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de recuperación inválido"
        )

    # ------------------------------------------------------
    # BUSCAR USUARIO
    # ------------------------------------------------------

    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if not usuario or not usuario.estado:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario no está disponible"
        )

    # ------------------------------------------------------
    # ACTUALIZAR CONTRASEÑA
    # ------------------------------------------------------

    usuario.password = hash_password(
        datos.nueva_password
    )

    db.commit()
    db.refresh(usuario)

    return {
        "success": True,
        "message": "Contraseña actualizada correctamente.",
    }


# ==========================================================
# OBTENER PERFIL ACTUAL
# ==========================================================

@router.get(
    "/me",
    response_model=UsuarioResponse
)
def obtener_perfil_actual(
    usuario: Usuario = Depends(
        obtener_usuario_actual
    )
):

    return usuario


# ==========================================================
# ACTUALIZAR PERFIL
# ==========================================================

@router.put(
    "/me",
    response_model=UsuarioResponse
)
def actualizar_perfil(
    datos: UsuarioPerfilUpdate,
    usuario: Usuario = Depends(
        obtener_usuario_actual
    ),
    db: Session = Depends(get_db)
):

    # ------------------------------------------------------
    # COMPROBAR CORREO
    # ------------------------------------------------------

    otro_usuario = db.query(Usuario).filter(
        Usuario.email == datos.email,
        Usuario.id != usuario.id
    ).first()

    if otro_usuario:

        raise HTTPException(
            status_code=400,
            detail="El correo ya está registrado"
        )

    # ------------------------------------------------------
    # OBTENER CAMPOS
    # ------------------------------------------------------

    valores = datos.model_dump(
        exclude_unset=True
    )

    # ------------------------------------------------------
    # ENCRIPTAR CONTRASEÑA
    # ------------------------------------------------------

    if valores.get("password"):

        valores["password"] = hash_password(
            valores["password"]
        )

    else:

        valores.pop(
            "password",
            None
        )

    # ------------------------------------------------------
    # ACTUALIZAR USUARIO
    # ------------------------------------------------------

    for campo, valor in valores.items():

        setattr(
            usuario,
            campo,
            valor
        )

    db.commit()
    db.refresh(usuario)

    return usuario