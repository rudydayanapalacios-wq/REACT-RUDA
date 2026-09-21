from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, DECIMAL
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base


class Rol(Base):
    __tablename__ = "roles"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    nombre = Column(
        String(50),
        unique=True,
        nullable=False
    )

    descripcion = Column(
        String(255),
        nullable=True
    )

    estado = Column(
        Boolean,
        default=True
    )


class Permiso(Base):
    __tablename__ = "permisos"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    nombre = Column(
        String(100),
        unique=True,
        nullable=False
    )

    descripcion = Column(
        String(255),
        nullable=True
    )


class RolPermiso(Base):
    __tablename__ = "roles_permisos"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    rol_id = Column(
        Integer,
        ForeignKey("roles.id"),
        nullable=False
    )

    permiso_id = Column(
        Integer,
        ForeignKey("permisos.id"),
        nullable=False
    )


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    rol_id = Column(
        Integer,
        ForeignKey("roles.id"),
        nullable=True
    )

    nombres = Column(
        String(100),
        nullable=False
    )

    apellidos = Column(
        String(100),
        nullable=False
    )

    tipo_documento = Column(
        String(20),
        nullable=False
    )

    numero_documento = Column(
        String(30),
        unique=True,
        nullable=False
    )

    direccion = Column(
        String(200),
        nullable=True
    )

    telefono = Column(
        String(30),
        nullable=True
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False
    )

    password = Column(
        String(255),
        nullable=False
    )

    foto = Column(
        String(255),
        nullable=True
    )

    estado = Column(
        Boolean,
        default=True
    )

    ultimo_acceso = Column(
        DateTime,
        nullable=True
    )

    fecha_registro = Column(
        DateTime,
        nullable=True
    )

    fecha_actualizacion = Column(
        DateTime,
        nullable=True
    )


class Producto(Base):
    __tablename__ = "productos"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    nombre = Column(
        String(150),
        nullable=False
    )

    descripcion = Column(
        String(255),
        nullable=True
    )

    precio = Column(
        DECIMAL(10, 2),
        nullable=False
    )

    stock = Column(
        Integer,
        nullable=False,
        default=0
    )

    imagen = Column(
        String(255),
        nullable=True
    )

    estado = Column(
        Boolean,
        default=True
    )


class HistorialAcceso(Base):
    __tablename__ = "historial_accesos"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    fecha_acceso = Column(
        DateTime,
        nullable=True
    )

    ip = Column(
        String(50),
        nullable=True
    )


class Venta(Base):
    __tablename__ = "ventas"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    numero_factura = Column(
        String(40),
        unique=True,
        nullable=False
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    fecha = Column(
        DateTime,
        server_default=func.getdate(),
        nullable=False
    )

    subtotal = Column(
        DECIMAL(12, 2),
        nullable=False,
        default=0
    )

    descuento = Column(
        DECIMAL(12, 2),
        nullable=False,
        default=0
    )

    impuesto = Column(
        DECIMAL(12, 2),
        nullable=False,
        default=0
    )

    total = Column(
        DECIMAL(12, 2),
        nullable=False,
        default=0
    )

    estado = Column(
        String(30),
        nullable=False,
        default="confirmada"
    )


class VentaDetalle(Base):
    __tablename__ = "ventas_detalle"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    venta_id = Column(
        Integer,
        ForeignKey("ventas.id"),
        nullable=False
    )

    producto_id = Column(
        Integer,
        ForeignKey("productos.id"),
        nullable=False
    )

    cantidad = Column(
        Integer,
        nullable=False
    )

    precio_unitario = Column(
        DECIMAL(12, 2),
        nullable=False
    )

    subtotal = Column(
        DECIMAL(12, 2),
        nullable=False
    )


class PQR(Base):
    __tablename__ = "pqr"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    tipo = Column(
        String(30),
        nullable=False
    )

    asunto = Column(
        String(150),
        nullable=False
    )

    descripcion = Column(
        String(500),
        nullable=False
    )

    respuesta = Column(
        String(500),
        nullable=True
    )

    respondido_por = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=True
    )

    estado = Column(
        String(30),
        nullable=False,
        default="pendiente"
    )

    fecha = Column(
        DateTime,
        server_default=func.getdate(),
        nullable=False
    )