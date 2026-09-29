import os

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import (
    crear_token_acceso,
    crear_token_recuperacion,
    crear_token_restablecimiento,
    hash_password,
    obtener_datos_token_restablecimiento,
    verificar_codigo_recuperacion,
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
    VerificarCodigoRecuperacionRequest,
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

    email = credenciales.email.strip().lower()

    print("====================================")
    print("PRUEBA DE LOGIN")
    print("EMAIL RECIBIDO:", email)
    print(
        "LONGITUD PASSWORD:",
        len(credenciales.password)
    )

    usuario = db.query(Usuario).filter(
        Usuario.email == email
    ).first()

    print(
        "USUARIO ENCONTRADO:",
        usuario is not None
    )

    if not usuario:

        print("RESULTADO: USUARIO NO ENCONTRADO")
        print("====================================")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El correo o la contraseña son incorrectos"
        )

    print("ID USUARIO:", usuario.id)
    print("ROL ID:", usuario.rol_id)
    print("ESTADO:", usuario.estado)

    # ------------------------------------------------------
    # DIAGNÓSTICO DEL HASH
    # ------------------------------------------------------

    print(
        "HASH EXISTE:",
        bool(usuario.password)
    )

    print(
        "LONGITUD HASH:",
        len(usuario.password)
    )

    # ------------------------------------------------------
    # VERIFICAR CONTRASEÑA
    # ------------------------------------------------------

    try:

        contraseña_correcta = verify_password(
            credenciales.password,
            usuario.password
        )

        print(
            "VERIFICACIÓN BCRYPT:",
            contraseña_correcta
        )

    except Exception as error:

        print(
            "ERROR EN VERIFY_PASSWORD:",
            repr(error)
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al verificar la contraseña"
        )

    # ------------------------------------------------------
    # CONTRASEÑA INCORRECTA
    # ------------------------------------------------------

    if not contraseña_correcta:

        print(
            "RESULTADO: CONTRASEÑA INCORRECTA"
        )

        print("====================================")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El correo o la contraseña son incorrectos"
        )

    # ------------------------------------------------------
    # USUARIO INACTIVO
    # ------------------------------------------------------

    if not usuario.estado:

        print(
            "RESULTADO: USUARIO INACTIVO"
        )

        print("====================================")

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario se encuentra inactivo"
        )

    # ------------------------------------------------------
    # LOGIN CORRECTO
    # ------------------------------------------------------

    print(
        "RESULTADO: LOGIN CORRECTO"
    )

    print("====================================")

    return {
        "success": True,

        "token": crear_token_acceso(
            usuario.id,
            usuario.rol_id
        ),

        "usuario": usuario,
    }


# ==========================================================
# SOLICITAR RECUPERACIÓN
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
    # NORMALIZAR CORREO
    # ------------------------------------------------------

    email = datos.email.strip().lower()

    # ------------------------------------------------------
    # BUSCAR USUARIO
    # ------------------------------------------------------

    usuario = db.query(Usuario).filter(
        Usuario.email == email
    ).first()

    print(
        "USUARIO ENCONTRADO:",
        usuario is not None
    )

    mensaje = (
        "Si el correo está registrado, "
        "recibirás un código para recuperar "
        "tu contraseña."
    )

    # ------------------------------------------------------
    # USUARIO NO ENCONTRADO O INACTIVO
    # ------------------------------------------------------

    if not usuario or not usuario.estado:

        print(
            "NO SE ENCONTRÓ EL USUARIO "
            "O ESTÁ INACTIVO"
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
    # GENERAR CÓDIGO
    # ------------------------------------------------------

    from ..auth import generar_codigo_recuperacion

    codigo = generar_codigo_recuperacion()

    print("CÓDIGO GENERADO CORRECTAMENTE")

    # ------------------------------------------------------
    # CREAR TOKEN TEMPORAL
    # ------------------------------------------------------

    try:

        token = crear_token_recuperacion(
            usuario.id,
            codigo
        )

        print(
            "TOKEN TEMPORAL DE RECUPERACIÓN GENERADO"
        )

    except Exception as error:

        print(
            "ERROR CREANDO TOKEN:",
            repr(error)
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "No fue posible generar "
                "el código de recuperación."
            )
        )

    # ------------------------------------------------------
    # ENVÍO DEL CORREO
    # ------------------------------------------------------

    try:

        print("====================================")
        print("INICIANDO ENVÍO DEL CORREO")
        print("DESTINO:", email)

        await enviar_correo_recuperacion(
            email,
            codigo
        )

        print(
            "CORREO CON CÓDIGO ENVIADO CORRECTAMENTE"
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

        # Este token NO contiene la contraseña.
        # React lo conservará temporalmente para
        # verificar el código.
        "token": token
    }


# ==========================================================
# VERIFICAR CÓDIGO
# ==========================================================

@router.post("/verificar-codigo")
def verificar_codigo(
    datos: VerificarCodigoRecuperacionRequest
):

    print("====================================")
    print("VERIFICACIÓN DE CÓDIGO")
    print("CÓDIGO RECIBIDO:", datos.codigo)

    # ------------------------------------------------------
    # VERIFICAR TOKEN Y CÓDIGO
    # ------------------------------------------------------

    try:

        datos_token = verificar_codigo_recuperacion(
            datos.token,
            datos.codigo
        )

    except ValueError as error:

        print(
            "ERROR VERIFICANDO CÓDIGO:",
            str(error)
        )

        print("====================================")

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )

    # ------------------------------------------------------
    # OBTENER USUARIO
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

    print(
        "CÓDIGO VERIFICADO CORRECTAMENTE"
    )

    print(
        "ID USUARIO:",
        usuario_id
    )

    # ------------------------------------------------------
    # CREAR TOKEN DE RESTABLECIMIENTO
    # ------------------------------------------------------

    try:

        token_restablecimiento = (
            crear_token_restablecimiento(
                usuario_id
            )
        )

    except Exception as error:

        print(
            "ERROR CREANDO TOKEN DE RESTABLECIMIENTO:",
            repr(error)
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "No fue posible continuar "
                "con el restablecimiento."
            )
        )

    print("====================================")

    return {
        "success": True,

        "message": (
            "Código verificado correctamente."
        ),

        "token": token_restablecimiento
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
    # VALIDAR TOKEN DE RESTABLECIMIENTO
    # ------------------------------------------------------

    try:

        datos_token = (
            obtener_datos_token_restablecimiento(
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
            detail="Token de restablecimiento inválido"
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

    nueva_password_hash = hash_password(
        datos.nueva_password
    )

    print("====================================")
    print("RESTABLECIMIENTO DE CONTRASEÑA")
    print("ID USUARIO:", usuario.id)

    print(
        "LONGITUD NUEVA PASSWORD:",
        len(datos.nueva_password)
    )

    print(
        "LONGITUD HASH GENERADO:",
        len(nueva_password_hash)
    )

    print("====================================")

    usuario.password = nueva_password_hash

    db.commit()

    db.refresh(usuario)

    return {
        "success": True,
        "message": (
            "Contraseña actualizada correctamente."
        ),
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