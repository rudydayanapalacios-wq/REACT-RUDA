from datetime import datetime

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    ConfigDict,
    field_validator,
)


# ==========================================================
# VALIDACIONES
# ==========================================================

def validar_nombre(valor: str) -> str:
    valor = valor.strip()

    if not valor:
        raise ValueError("Este campo es obligatorio.")

    if not all(
        caracter.isalpha() or caracter.isspace()
        for caracter in valor
    ):
        raise ValueError(
            "Este campo solo puede contener letras y espacios."
        )

    return valor


def validar_numero_documento(valor: str) -> str:
    valor = valor.strip()

    if not valor:
        raise ValueError(
            "El número de documento es obligatorio."
        )

    if not valor.isdigit():
        raise ValueError(
            "El número de documento solo puede contener números."
        )

    return valor


def validar_telefono(valor: str | None) -> str | None:
    if valor is None:
        return None

    valor = valor.strip()

    if valor and not valor.isdigit():
        raise ValueError(
            "El teléfono solo puede contener números."
        )

    return valor


# ==========================================================
# USUARIOS - CREAR
# ==========================================================

class UsuarioCreate(BaseModel):
    rol_id: int

    nombres: str = Field(
        min_length=2,
        max_length=100
    )

    apellidos: str = Field(
        min_length=2,
        max_length=100
    )

    tipo_documento: str = Field(
        max_length=30
    )

    numero_documento: str = Field(
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

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=72
    )

    @field_validator("nombres", "apellidos")
    @classmethod
    def validar_nombres_apellidos(cls, valor):
        return validar_nombre(valor)

    @field_validator("numero_documento")
    @classmethod
    def validar_documento(cls, valor):
        return validar_numero_documento(valor)

    @field_validator("telefono")
    @classmethod
    def validar_telefono_usuario(cls, valor):
        return validar_telefono(valor)

    @field_validator("direccion")
    @classmethod
    def validar_direccion(cls, valor):
        if valor is not None:
            valor = valor.strip()

        return valor


# ==========================================================
# USUARIOS - RESPUESTA
# ==========================================================

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

    password: str = Field(
        min_length=8,
        max_length=72
    )


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

    @field_validator("nombres", "apellidos")
    @classmethod
    def validar_nombres_apellidos(cls, valor):
        if valor is None:
            return valor

        return validar_nombre(valor)

    @field_validator("numero_documento")
    @classmethod
    def validar_documento(cls, valor):
        if valor is None:
            return valor

        return validar_numero_documento(valor)

    @field_validator("telefono")
    @classmethod
    def validar_telefono_usuario(cls, valor):
        return validar_telefono(valor)

    @field_validator("direccion")
    @classmethod
    def validar_direccion(cls, valor):
        if valor is not None:
            valor = valor.strip()

        return valor


# ==========================================================
# CAMBIAR ESTADO DE USUARIO
# ==========================================================

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

    @field_validator("nombres", "apellidos")
    @classmethod
    def validar_nombres_apellidos(cls, valor):
        return validar_nombre(valor)

    @field_validator("telefono")
    @classmethod
    def validar_telefono_perfil(cls, valor):
        return validar_telefono(valor)

    @field_validator("direccion")
    @classmethod
    def validar_direccion_perfil(cls, valor):
        if valor is not None:
            valor = valor.strip()

        return valor


# ==========================================================
# PRODUCTOS - CREAR
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

    precio: float = Field(
        gt=0
    )

    stock: int = Field(
        ge=0
    )

    imagen: str | None = Field(
        default=None,
        max_length=255
    )

    @field_validator("nombre")
    @classmethod
    def validar_nombre_producto(cls, valor):
        valor = valor.strip()

        if not valor:
            raise ValueError(
                "El nombre del producto es obligatorio."
            )

        return valor

    @field_validator("descripcion")
    @classmethod
    def validar_descripcion_producto(cls, valor):
        if valor is not None:
            valor = valor.strip()

        return valor


# ==========================================================
# PRODUCTOS - ACTUALIZAR
# ==========================================================

class ProductoUpdate(BaseModel):
    nombre: str = Field(
        min_length=2,
        max_length=150
    )

    descripcion: str | None = Field(
        default=None,
        max_length=255
    )

    precio: float = Field(
        gt=0
    )

    stock: int = Field(
        ge=0
    )

    imagen: str | None = Field(
        default=None,
        max_length=255
    )

    estado: bool = True

    @field_validator("nombre")
    @classmethod
    def validar_nombre_producto(cls, valor):
        valor = valor.strip()

        if not valor:
            raise ValueError(
                "El nombre del producto es obligatorio."
            )

        return valor

    @field_validator("descripcion")
    @classmethod
    def validar_descripcion_producto(cls, valor):
        if valor is not None:
            valor = valor.strip()

        return valor


# ==========================================================
# PRODUCTOS - RESPUESTA
# ==========================================================

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
    producto_id: int = Field(
        gt=0
    )

    cantidad: int = Field(
        gt=0
    )


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


# ==========================================================
# PQR
# ==========================================================

class PQRCreate(BaseModel):
    tipo: str = Field(
        min_length=3,
        max_length=30
    )

    asunto: str = Field(
        min_length=3,
        max_length=150
    )

    descripcion: str = Field(
        min_length=5,
        max_length=500
    )

    @field_validator("tipo", "asunto", "descripcion")
    @classmethod
    def validar_textos_pqr(cls, valor):
        valor = valor.strip()

        if not valor:
            raise ValueError(
                "Este campo es obligatorio."
            )

        return valor


class PQREstadoUpdate(BaseModel):
    estado: str = Field(
        min_length=3,
        max_length=30
    )

    @field_validator("estado")
    @classmethod
    def validar_estado_pqr(cls, valor):
        valor = valor.strip().lower()

        estados_permitidos = {
            "pendiente",
            "en proceso",
            "resuelta",
            "cerrada"
        }

        if valor not in estados_permitidos:
            raise ValueError(
                "El estado debe ser: pendiente, en proceso, resuelta o cerrada."
            )

        return valor


class PQRRespuestaUpdate(BaseModel):
    respuesta: str = Field(
        min_length=3,
        max_length=500
    )

    estado: str = Field(
        min_length=3,
        max_length=30
    )

    @field_validator("respuesta")
    @classmethod
    def validar_respuesta_pqr(cls, valor):
        valor = valor.strip()

        if not valor:
            raise ValueError(
                "La respuesta es obligatoria."
            )

        return valor

    @field_validator("estado")
    @classmethod
    def validar_estado_respuesta_pqr(cls, valor):
        valor = valor.strip().lower()

        estados_permitidos = {
            "pendiente",
            "en proceso",
            "resuelta",
            "cerrada"
        }

        if valor not in estados_permitidos:
            raise ValueError(
                "El estado debe ser: pendiente, en proceso, resuelta o cerrada."
            )

        return valor


class PQRResponse(BaseModel):
    id: int
    usuario_id: int
    nombre_cliente: str | None
    correo_cliente: str | None
    tipo: str
    asunto: str
    descripcion: str
    respuesta: str | None
    respondido_por: int | None
    estado: str
    fecha: datetime

    model_config = ConfigDict(
        from_attributes=True
    )
