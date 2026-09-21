from decimal import Decimal
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import obtener_usuario_actual
from ..models import Producto, Usuario, Venta, VentaDetalle
from ..schemas import VentaCreate


router = APIRouter(
    prefix="/ventas",
    tags=["Ventas"]
)


@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_venta(
    datos: VentaCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    venta = Venta(
        numero_factura=f"FAC-{datetime.now():%Y%m%d}-{uuid4().hex[:8].upper()}",
        usuario_id=usuario.id,
        subtotal=Decimal("0"),
        descuento=Decimal("0"),
        impuesto=Decimal("0"),
        total=Decimal("0")
    )

    db.add(venta)
    db.flush()

    subtotal_venta = Decimal("0")
    detalles = []

    for detalle in datos.detalles:
        producto = db.query(Producto).filter(
            Producto.id == detalle.producto_id,
            Producto.estado == True
        ).first()

        if not producto:
            raise HTTPException(
                status_code=404,
                detail="Producto no encontrado"
            )

        if producto.stock < detalle.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para {producto.nombre}"
            )

        precio = Decimal(str(producto.precio))
        subtotal = precio * detalle.cantidad

        producto.stock -= detalle.cantidad
        subtotal_venta += subtotal

        detalles.append(
            VentaDetalle(
                venta_id=venta.id,
                producto_id=producto.id,
                cantidad=detalle.cantidad,
                precio_unitario=producto.precio,
                subtotal=subtotal
            )
        )

    descuento = Decimal("0")
    impuesto = Decimal("0")
    total = subtotal_venta - descuento + impuesto

    venta.subtotal = subtotal_venta
    venta.descuento = descuento
    venta.impuesto = impuesto
    venta.total = total

    db.add_all(detalles)
    db.commit()
    db.refresh(venta)

    return {
        "id": venta.id,
        "numero_factura": venta.numero_factura,
        "usuario_id": venta.usuario_id,
        "fecha": venta.fecha,
        "subtotal": float(venta.subtotal),
        "descuento": float(venta.descuento),
        "impuesto": float(venta.impuesto),
        "total": float(venta.total),
        "estado": venta.estado,
        "detalles": [
            {
                "producto_id": detalle.producto_id,
                "cantidad": detalle.cantidad,
                "precio_unitario": float(detalle.precio_unitario),
                "subtotal": float(detalle.subtotal),
            }
            for detalle in detalles
        ],
    }


@router.get("/")
def listar_ventas(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    consulta = db.query(Venta).order_by(Venta.id.desc())

    if usuario.rol_id == 2:
        consulta = consulta.filter(Venta.usuario_id == usuario.id)

    elif usuario.rol_id not in (1, 3):
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos"
        )

    ventas = consulta.all()
    resultado = []

    for venta in ventas:
        usuario_venta = db.query(Usuario).filter(
            Usuario.id == venta.usuario_id
        ).first()

        detalles = db.query(
            VentaDetalle,
            Producto
        ).join(
            Producto,
            Producto.id == VentaDetalle.producto_id
        ).filter(
            VentaDetalle.venta_id == venta.id
        ).all()

        resultado.append({
            "id": venta.id,
            "numero_factura": venta.numero_factura,
            "usuario_id": venta.usuario_id,

            "cliente": (
                f"{usuario_venta.nombres} {usuario_venta.apellidos}"
                if usuario_venta
                else "Cliente"
            ),

            "email": (
                usuario_venta.email
                if usuario_venta
                else None
            ),

            "fecha": venta.fecha,
            "subtotal": float(venta.subtotal),
            "descuento": float(venta.descuento),
            "impuesto": float(venta.impuesto),
            "total": float(venta.total),
            "estado": venta.estado,

            "detalles": [
                {
                    "producto_id": detalle.producto_id,
                    "producto": producto.nombre,
                    "cantidad": detalle.cantidad,
                    "precio_unitario": float(
                        detalle.precio_unitario
                    ),
                    "subtotal": float(detalle.subtotal),
                }
                for detalle, producto in detalles
            ],
        })

    return resultado


@router.get("/{venta_id}")
def obtener_factura(
    venta_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    venta = db.query(Venta).filter(
        Venta.id == venta_id
    ).first()

    if not venta:
        raise HTTPException(
            status_code=404,
            detail="Venta no encontrada"
        )

    if usuario.rol_id == 2 and venta.usuario_id != usuario.id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos"
        )

    if usuario.rol_id not in (1, 2, 3):
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos"
        )

    # =========================================================
    # DATOS DEL CLIENTE
    # =========================================================

    cliente = db.query(Usuario).filter(
        Usuario.id == venta.usuario_id
    ).first()

    if cliente:
        nombre_cliente = (
            f"{cliente.nombres} {cliente.apellidos}"
        ).strip()

        datos_cliente = {
            "id": cliente.id,
            "nombre": nombre_cliente,
            "nombres": cliente.nombres,
            "apellidos": cliente.apellidos,
            "tipo_documento": cliente.tipo_documento,
            "numero_documento": cliente.numero_documento,
            "email": cliente.email,
            "telefono": cliente.telefono,
            "direccion": cliente.direccion,
        }
    else:
        datos_cliente = {
            "id": None,
            "nombre": "Cliente",
            "nombres": None,
            "apellidos": None,
            "tipo_documento": None,
            "numero_documento": None,
            "email": None,
            "telefono": None,
            "direccion": None,
        }

    # =========================================================
    # DETALLES DE LA VENTA
    # =========================================================

    detalles = db.query(
        VentaDetalle,
        Producto
    ).join(
        Producto,
        Producto.id == VentaDetalle.producto_id
    ).filter(
        VentaDetalle.venta_id == venta.id
    ).all()

    # =========================================================
    # RESPUESTA DE LA FACTURA
    # =========================================================

    return {
        "id": venta.id,
        "numero_factura": venta.numero_factura,
        "usuario_id": venta.usuario_id,
        "fecha": venta.fecha,

        "cliente": datos_cliente,

        "subtotal": float(venta.subtotal),
        "descuento": float(venta.descuento),
        "impuesto": float(venta.impuesto),
        "total": float(venta.total),

        "estado": venta.estado,

        "detalles": [
            {
                "producto_id": detalle.producto_id,
                "producto": producto.nombre,
                "cantidad": detalle.cantidad,
                "precio_unitario": float(
                    detalle.precio_unitario
                ),
                "subtotal": float(detalle.subtotal),
            }
            for detalle, producto in detalles
        ],
    }
