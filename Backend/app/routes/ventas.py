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
        total=Decimal("0")
    )
    db.add(venta)
    db.flush()

    total = Decimal("0")
    detalles = []
    for detalle in datos.detalles:
        producto = db.query(Producto).filter(
            Producto.id == detalle.producto_id,
            Producto.estado == True
        ).first()
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        if producto.stock < detalle.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para {producto.nombre}"
            )

        subtotal = Decimal(str(producto.precio)) * detalle.cantidad
        producto.stock -= detalle.cantidad
        total += subtotal
        detalles.append(VentaDetalle(
            venta_id=venta.id,
            producto_id=producto.id,
            cantidad=detalle.cantidad,
            precio_unitario=producto.precio,
            subtotal=subtotal
        ))

    venta.total = total
    db.add_all(detalles)
    db.commit()
    db.refresh(venta)

    return {
        "id": venta.id,
        "numero_factura": venta.numero_factura,
        "usuario_id": venta.usuario_id,
        "fecha": venta.fecha,
        "total": float(venta.total),
        "estado": venta.estado,
        "detalles": detalles,
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
        raise HTTPException(status_code=403, detail="No tienes permisos")
    return consulta.all()


@router.get("/{venta_id}")
def obtener_factura(
    venta_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    if usuario.rol_id == 2 and venta.usuario_id != usuario.id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    if usuario.rol_id not in (1, 2, 3):
        raise HTTPException(status_code=403, detail="No tienes permisos")

    detalles = db.query(VentaDetalle, Producto).join(
        Producto, Producto.id == VentaDetalle.producto_id
    ).filter(VentaDetalle.venta_id == venta.id).all()

    return {
        "id": venta.id,
        "numero_factura": venta.numero_factura,
        "usuario_id": venta.usuario_id,
        "fecha": venta.fecha,
        "total": float(venta.total),
        "estado": venta.estado,
        "detalles": [
            {
                "producto": producto.nombre,
                "cantidad": detalle.cantidad,
                "precio_unitario": float(detalle.precio_unitario),
                "subtotal": float(detalle.subtotal),
            }
            for detalle, producto in detalles
        ],
    }
