from datetime import datetime

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    ConfigDict
)


# ==========================================================
# USUARIOS
# ==========================================================

class UsuarioCreate(BaseModel):
    rol_id: int
    nombres: str = Field(min_length=2, max_length=100)
    apellidos: str = Field(min_length=2, max_length=100)
    tipo_documento: str = Field(max_length=30)
    numero_documento: str = Field(min_length=5, max_length=30)
    direccion: str | None = Field(default=None, max_length=200)
    telefono: str | None = Field(default=None, max_length=30)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class UsuarioResponse(BaseModel):
    id: int
    rol_id: int
    nombres: str
    apellidos: str
    tipo_documento: str
    numero_documento: str
    direccion: str | None
    telefono: str | None
    email: EmailStr
    foto: str | None
    estado: bool
    ultimo_acceso: datetime | None
    fecha_registro: datetime | None
    fecha_actualizacion: datetime | None

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================================
# LOGIN
# ==========================================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class LoginResponse(BaseModel):
    success: bool
    token: str
    usuario: UsuarioResponse


# ==========================================================
# ACTUALIZACIÓN DE USUARIO
# ==========================================================

class UsuarioUpdate(BaseModel):
    rol_id: int | None = None

    nombres: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    apellidos: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    tipo_documento: str | None = Field(
        default=None,
        max_length=30
    )

    numero_documento: str | None = Field(
        default=None,
        min_length=5,
        max_length=30
    )

    direccion: str | None = Field(
        default=None,
        max_length=200
    )

    telefono: str | None = Field(
        default=None,
        max_length=30
    )

    email: EmailStr | None = None

    password: str | None = Field(
        default=None,
        min_length=8,
        max_length=72
    )


class UsuarioEstado(BaseModel):
    estado: bool


# ==========================================================
# PERFIL DEL USUARIO
# ==========================================================

class UsuarioPerfilUpdate(BaseModel):
    nombres: str = Field(
        min_length=2,
        max_length=100
    )

    apellidos: str = Field(
        min_length=2,
        max_length=100
    )

    direccion: str | None = Field(
        default=None,
        max_length=200
    )

    telefono: str | None = Field(
        default=None,
        max_length=30
    )

    email: EmailStr

    password: str | None = Field(
        default=None,
        min_length=8,
        max_length=72
    )


# ==========================================================
# PRODUCTOS
# ==========================================================

class ProductoCreate(BaseModel):
    nombre: str = Field(
        min_length=2,
        max_length=150
    )

    descripcion: str | None = Field(
        default=None,
        max_length=255
    )

    precio: float = Field(gt=0)

    stock: int = Field(ge=0)

    imagen: str | None = Field(
        default=None,
        max_length=255
    )


class ProductoUpdate(BaseModel):
    nombre: str = Field(
        min_length=2,
        max_length=150
    )

    descripcion: str | None = Field(
        default=None,
        max_length=255
    )

    precio: float = Field(gt=0)

    stock: int = Field(ge=0)

    imagen: str | None = Field(
        default=None,
        max_length=255
    )

    estado: bool = True


class ProductoResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str | None
    precio: float
    stock: int
    imagen: str | None
    estado: bool

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================================
# VENTAS
# ==========================================================

class VentaDetalleCreate(BaseModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(gt=0)


class VentaCreate(BaseModel):
    detalles: list[VentaDetalleCreate] = Field(
        min_length=1
    )


# ==========================================================
# RECUPERACIÓN DE CONTRASEÑA
# ==========================================================

class RecuperarContrasenaRequest(BaseModel):
    email: EmailStr


class RestablecerContrasenaRequest(BaseModel):
    token: str

    nueva_password: str = Field(
        min_length=8,
        max_length=72
    )
