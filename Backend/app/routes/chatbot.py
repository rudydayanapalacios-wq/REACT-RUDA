from fastapi import APIRouter
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv

from sqlalchemy.orm import Session
from sqlalchemy import or_

import os
import re
import unicodedata
from decimal import Decimal

from ..database import SessionLocal
from ..models import Producto


# ==========================================================
# CONFIGURACIÓN
# ==========================================================

load_dotenv()

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"]
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = None

if OPENAI_API_KEY:
    client = OpenAI(api_key=OPENAI_API_KEY)


# ==========================================================
# MODELOS
# ==========================================================

class ChatbotRequest(BaseModel):
    mensaje: str = Field(
        min_length=1,
        max_length=500
    )


class ChatbotResponse(BaseModel):
    respuesta: str


# ==========================================================
# FUNCIONES AUXILIARES
# ==========================================================

def normalizar_texto(texto: str) -> str:
    """
    Convierte el texto a minúsculas, elimina tildes
    y caracteres innecesarios.
    """

    texto = texto.lower().strip()

    texto = unicodedata.normalize(
        "NFD",
        texto
    )

    texto = "".join(
        caracter
        for caracter in texto
        if unicodedata.category(caracter) != "Mn"
    )

    texto = re.sub(
        r"[^a-z0-9\s]",
        " ",
        texto
    )

    return re.sub(
        r"\s+",
        " ",
        texto
    ).strip()


def contiene_alguna(texto: str, palabras: list[str]) -> bool:
    """
    Comprueba si alguna palabra o expresión está presente.
    """

    return any(
        palabra in texto
        for palabra in palabras
    )


def formatear_precio(precio) -> str:
    """
    Convierte el precio de la BD a formato colombiano.
    Ejemplo: 65000 -> $65.000
    """

    try:
        valor = int(Decimal(str(precio)))
        return f"${valor:,.0f}".replace(",", ".")
    except Exception:
        return str(precio)


# ==========================================================
# DETECTAR SI LA PREGUNTA HABLA DE PRODUCTOS
# ==========================================================

def es_pregunta_producto(texto: str) -> bool:

    palabras_producto = [
        "producto",
        "productos",
        "catalogo",
        "catalog",
        "articulo",
        "articulos",
        "accesorio",
        "accesorios",
        "collar",
        "collares",
        "pulsera",
        "pulseras",
        "anillo",
        "anillos",
        "arete",
        "aretes",
        "katana",
        "joya",
        "joyas",
        "stock",
        "disponible",
        "disponibilidad",
        "unidades",
        "cuesta",
        "cuanto vale",
        "precio",
        "precios",
        "barato",
        "economico",
        "economicos"
    ]

    return contiene_alguna(
        texto,
        palabras_producto
    )


# ==========================================================
# CONSULTAR PRODUCTOS EN LA BASE DE DATOS
# ==========================================================

def obtener_productos_activos(db: Session):
    """
    Obtiene únicamente productos activos.
    """

    return (
        db.query(Producto)
        .filter(Producto.estado == True)
        .order_by(Producto.nombre.asc())
        .all()
    )


def buscar_productos(
    db: Session,
    texto: str
):
    """
    Busca productos activos utilizando palabras relevantes
    de la pregunta.
    """

    productos = obtener_productos_activos(db)

    palabras = [
        palabra
        for palabra in texto.split()
        if len(palabra) >= 3
    ]

    resultados = []

    for producto in productos:

        nombre = normalizar_texto(
            producto.nombre or ""
        )

        descripcion = normalizar_texto(
            producto.descripcion or ""
        )

        coincidencias = 0

        for palabra in palabras:

            if palabra in nombre:
                coincidencias += 3

            elif palabra in descripcion:
                coincidencias += 1

        if coincidencias > 0:
            resultados.append(
                (
                    coincidencias,
                    producto
                )
            )

    resultados.sort(
        key=lambda item: (
            -item[0],
            normalizar_texto(
                item[1].nombre or ""
            )
        )
    )

    return [
        producto
        for _, producto in resultados
    ]


# ==========================================================
# DETECTAR PRODUCTO ESPECÍFICO
# ==========================================================

def buscar_producto_por_nombre(
    db: Session,
    texto: str
):
    """
    Intenta encontrar un producto específico dentro
    de la pregunta.
    """

    productos = obtener_productos_activos(db)

    texto_normalizado = normalizar_texto(texto)

    coincidencias = []

    for producto in productos:

        nombre = normalizar_texto(
            producto.nombre or ""
        )

        if not nombre:
            continue

        if nombre in texto_normalizado:
            coincidencias.append(producto)

    if len(coincidencias) == 1:
        return coincidencias[0]

    if len(coincidencias) > 1:
        return coincidencias[0]

    return None


# ==========================================================
# RESPUESTA SOBRE PRODUCTOS
# ==========================================================

def respuesta_productos(
    mensaje: str,
    db: Session
) -> str | None:

    texto = normalizar_texto(mensaje)

    if not es_pregunta_producto(texto):
        return None

    # ------------------------------------------------------
    # LISTAR TODOS LOS PRODUCTOS
    # ------------------------------------------------------

    quiere_listar = contiene_alguna(
        texto,
        [
            "que productos tienen",
            "que productos venden",
            "que tienen",
            "que venden",
            "catalogo",
            "catalog",
            "lista de productos",
            "productos disponibles",
            "productos tienen disponibles",
            "que accesorios tienen"
        ]
    )

    if quiere_listar:

        productos = obtener_productos_activos(db)

        if not productos:
            return (
                "Actualmente no hay productos activos "
                "disponibles en el catálogo."
            )

        lineas = []

        for producto in productos[:15]:

            disponibilidad = (
                f"{producto.stock} unidades"
                if producto.stock > 0
                else "agotado"
            )

            lineas.append(
                f"• {producto.nombre} — "
                f"{formatear_precio(producto.precio)} "
                f"({disponibilidad})"
            )

        respuesta = (
            "Estos son algunos de los productos disponibles "
            "actualmente en MUGI STORE:\n\n"
            + "\n".join(lineas)
        )

        if len(productos) > 15:
            respuesta += (
                "\n\nHay más productos en el catálogo. "
                "Puedes consultar la sección Productos para "
                "verlos todos."
            )

        return respuesta

    # ------------------------------------------------------
    # BUSCAR PRODUCTO ESPECÍFICO
    # ------------------------------------------------------

    producto = buscar_producto_por_nombre(
        db,
        texto
    )

    # ------------------------------------------------------
    # SI NO ENCONTRÓ NOMBRE EXACTO, BUSCAR POR PALABRAS
    # ------------------------------------------------------

    resultados = []

    if not producto:
        resultados = buscar_productos(
            db,
            texto
        )

    # ------------------------------------------------------
    # PREGUNTAS SOBRE PRECIO
    # ------------------------------------------------------

    pregunta_precio = contiene_alguna(
        texto,
        [
            "precio",
            "precios",
            "cuanto cuesta",
            "cuanto vale",
            "cuanto valen",
            "valor",
            "cuesta",
            "vale"
        ]
    )

    if pregunta_precio:

        if producto:

            return (
                f"El {producto.nombre} tiene un precio de "
                f"{formatear_precio(producto.precio)}."
            )

        if len(resultados) == 1:

            producto = resultados[0]

            return (
                f"El {producto.nombre} tiene un precio de "
                f"{formatear_precio(producto.precio)}."
            )

        if len(resultados) > 1:

            nombres = [
                producto.nombre
                for producto in resultados[:5]
            ]

            return (
                "Encontré varios productos que podrían "
                "corresponder a tu pregunta:\n\n"
                + "\n".join(
                    f"• {nombre}"
                    for nombre in nombres
                )
                + "\n\nDime el nombre del producto "
                  "que quieres consultar."
            )

        return (
            "No encontré un producto específico relacionado "
            "con tu pregunta. Dime el nombre del producto "
            "y puedo consultar su precio actual."
        )

    # ------------------------------------------------------
    # PREGUNTAS SOBRE STOCK
    # ------------------------------------------------------

    pregunta_stock = contiene_alguna(
        texto,
        [
            "stock",
            "disponible",
            "disponibilidad",
            "hay unidades",
            "cuantas unidades",
            "cuantas quedan",
            "cuanto queda",
            "queda",
            "tienen unidades"
        ]
    )

    if pregunta_stock:

        if producto:

            if producto.stock > 0:

                return (
                    f"Sí. {producto.nombre} está disponible "
                    f"actualmente y quedan "
                    f"{producto.stock} unidades."
                )

            return (
                f"{producto.nombre} está actualmente agotado."
            )

        if len(resultados) == 1:

            producto = resultados[0]

            if producto.stock > 0:

                return (
                    f"Sí. {producto.nombre} está disponible "
                    f"actualmente y quedan "
                    f"{producto.stock} unidades."
                )

            return (
                f"{producto.nombre} está actualmente agotado."
            )

        if len(resultados) > 1:

            nombres = [
                producto.nombre
                for producto in resultados[:5]
            ]

            return (
                "Encontré varios productos relacionados:\n\n"
                + "\n".join(
                    f"• {nombre}"
                    for nombre in nombres
                )
                + "\n\nDime cuál quieres consultar "
                  "y te indico su disponibilidad."
            )

        return (
            "No encontré un producto específico para "
            "consultar su disponibilidad. Dime el nombre "
            "del producto que buscas."
        )

    # ------------------------------------------------------
    # PRODUCTO ESPECÍFICO SIN PREGUNTA DE PRECIO/STOCK
    # ------------------------------------------------------

    if producto:

        descripcion = (
            producto.descripcion
            if producto.descripcion
            else "No hay una descripción registrada."
        )

        disponibilidad = (
            f"{producto.stock} unidades disponibles"
            if producto.stock > 0
            else "actualmente agotado"
        )

        return (
            f"Encontré este producto en MUGI STORE:\n\n"
            f"🛍️ {producto.nombre}\n"
            f"💰 Precio: {formatear_precio(producto.precio)}\n"
            f"📦 Disponibilidad: {disponibilidad}\n"
            f"📝 {descripcion}"
        )

    # ------------------------------------------------------
    # RECOMENDACIONES
    # ------------------------------------------------------

    pregunta_recomendacion = contiene_alguna(
        texto,
        [
            "recomiendame",
            "que me recomiendas",
            "cual me recomiendas",
            "que producto compro",
            "que producto elegir",
            "ayudame a elegir",
            "quiero un regalo",
            "busco un regalo"
        ]
    )

    if pregunta_recomendacion:

        productos = obtener_productos_activos(db)

        disponibles = [
            producto
            for producto in productos
            if producto.stock > 0
        ]

        if not disponibles:
            return (
                "Actualmente no encuentro productos con "
                "stock disponible para recomendarte."
            )

        opciones = disponibles[:5]

        return (
            "Claro. Estas son algunas opciones disponibles "
            "actualmente:\n\n"
            + "\n".join(
                f"• {producto.nombre} — "
                f"{formatear_precio(producto.precio)}"
                for producto in opciones
            )
            + "\n\nSi me dices tu presupuesto o el tipo "
              "de accesorio que buscas, puedo orientarte mejor."
        )

    # ------------------------------------------------------
    # PREGUNTA POR PRODUCTO BARATO
    # ------------------------------------------------------

    pregunta_barato = contiene_alguna(
        texto,
        [
            "mas barato",
            "mas economico",
            "mas barata",
            "mas economica",
            "producto barato",
            "producto economico",
            "menor precio",
            "precio mas bajo"
        ]
    )

    if pregunta_barato:

        productos = [
            producto
            for producto in obtener_productos_activos(db)
            if producto.stock > 0
        ]

        if not productos:
            return (
                "No encuentro productos disponibles "
                "para comparar en este momento."
            )

        producto_mas_barato = min(
            productos,
            key=lambda producto: Decimal(
                str(producto.precio)
            )
        )

        return (
            f"El producto disponible con menor precio "
            f"actualmente es {producto_mas_barato.nombre}, "
            f"con un valor de "
            f"{formatear_precio(producto_mas_barato.precio)}."
        )

    return None


# ==========================================================
# FAQ MUGI
# ==========================================================

def respuesta_faq(mensaje: str) -> str:

    texto = normalizar_texto(mensaje)

    # ======================================================
    # SALUDOS
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "hola",
            "holi",
            "hello",
            "buenas",
            "buenos dias",
            "buenas tardes",
            "buenas noches",
            "hey"
        ]
    ):
        return (
            "¡Hola! 👋 Soy MUGI IA, el asistente virtual "
            "de MUGI STORE. Puedo ayudarte con productos, "
            "compras, carrito, facturas, PQR y el funcionamiento "
            "de la plataforma. ¿Qué necesitas?"
        )

    # ======================================================
    # DESPEDIDAS
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "adios",
            "hasta luego",
            "nos vemos",
            "chao",
            "bye"
        ]
    ):
        return (
            "¡Hasta luego! 👋 Gracias por visitar MUGI STORE."
        )

    # ======================================================
    # AGRADECIMIENTOS
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "gracias",
            "muchas gracias",
            "te agradezco"
        ]
    ):
        return (
            "¡Con mucho gusto! 😊 Si tienes otra pregunta "
            "sobre MUGI STORE, puedes escribirme."
        )

    # ======================================================
    # IDENTIDAD
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "quien eres",
            "que eres",
            "eres una ia",
            "eres un robot",
            "como te llamas"
        ]
    ):
        return (
            "Soy MUGI IA 🤖, el asistente virtual de "
            "MUGI STORE. Estoy integrado en la plataforma "
            "para orientar a los usuarios."
        )

    # ======================================================
    # HISTORIA DE MUGI
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "historia de mugi",
            "historia de mugi store",
            "origen de mugi",
            "como nacio mugi",
            "cuando se fundo mugi",
            "por que se llama mugi"
        ]
    ):
        return (
            "MUGI STORE nació como una propuesta para "
            "convertir la pasión por las aventuras y los "
            "accesorios inspirados en One Piece en una "
            "experiencia de compra cercana para los fans. "
            "Su nombre hace referencia a los Mugiwara, "
            "la tripulación del sombrero de paja."
        )

    # ======================================================
    # INFORMACIÓN GENERAL DE MUGI
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "que es mugi",
            "que es mugi store",
            "sobre mugi",
            "informacion de mugi",
            "informacion sobre mugi"
        ]
    ):
        return (
            "MUGI STORE es una tienda de accesorios y "
            "joyería. La plataforma permite consultar "
            "productos, agregarlos al carrito, realizar "
            "compras, consultar facturación y gestionar PQR."
        )

    # ======================================================
    # COMPRAS
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "como compro",
            "como comprar",
            "quiero comprar",
            "como hago una compra"
        ]
    ):
        return (
            "Para comprar en MUGI STORE, selecciona un "
            "producto, agrégalo al carrito y continúa con "
            "el proceso de compra. Al finalizar, la venta "
            "queda registrada en el sistema."
        )

    # ======================================================
    # CARRITO
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "carrito",
            "carrito de compras",
            "agregar al carrito",
            "añadir al carrito"
        ]
    ):
        return (
            "El carrito te permite guardar los productos "
            "que deseas comprar, modificar cantidades y "
            "revisar el total antes de confirmar la compra. 🛒"
        )

    # ======================================================
    # QUITAR DEL CARRITO
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "quitar del carrito",
            "eliminar del carrito",
            "sacar del carrito",
            "borrar del carrito"
        ]
    ):
        return (
            "Puedes quitar un producto desde el carrito "
            "utilizando la opción de eliminar que aparece "
            "junto al artículo."
        )

    # ======================================================
    # FACTURAS
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "factura",
            "facturas",
            "facturacion",
            "numero de factura"
        ]
    ):
        return (
            "Después de una compra, el sistema registra "
            "la venta y genera la información de facturación "
            "correspondiente. Para consultar información "
            "específica de una factura debes iniciar sesión."
        )

    # ======================================================
    # ESTADO DE COMPRA
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "estado de mi compra",
            "estado de mi venta",
            "como va mi compra",
            "donde esta mi pedido",
            "seguimiento de mi pedido"
        ]
    ):
        return (
            "Para consultar el estado de una compra específica, "
            "inicia sesión y revisa la información disponible "
            "en tu panel de cliente."
        )

    # ======================================================
    # PQR
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "crear pqr",
            "hacer pqr",
            "poner una pqr",
            "registrar una pqr",
            "enviar una pqr"
        ]
    ):
        return (
            "Para crear una PQR, inicia sesión, entra a la "
            "sección PQR y completa el tipo, asunto y "
            "descripción de tu solicitud."
        )

    if texto == "pqr" or contiene_alguna(
        texto,
        [
            "que es una pqr",
            "para que sirve una pqr",
            "como funciona una pqr"
        ]
    ):
        return (
            "Una PQR permite registrar peticiones, quejas, "
            "reclamos o solicitudes para que sean atendidas "
            "por el equipo de MUGI STORE."
        )

    # ======================================================
    # PQR ESPECÍFICA
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "respuesta de mi pqr",
            "respondieron mi pqr",
            "estado de mi pqr"
        ]
    ):
        return (
            "Para consultar el estado o respuesta de una PQR "
            "específica debes iniciar sesión y revisar tus "
            "solicitudes registradas."
        )

    # ======================================================
    # PRODUCTO DAÑADO
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "producto danado",
            "llego danado",
            "producto defectuoso"
        ]
    ):
        return (
            "Si recibiste un producto dañado o defectuoso, "
            "puedes registrar una PQR describiendo lo ocurrido "
            "para que el equipo revise tu caso."
        )

    # ======================================================
    # REGISTRO
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "registrarme",
            "crear cuenta",
            "crear una cuenta",
            "como me registro"
        ]
    ):
        return (
            "Puedes utilizar la opción de registro disponible "
            "en MUGI STORE y completar los datos solicitados."
        )

    # ======================================================
    # LOGIN
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "iniciar sesion",
            "login",
            "entrar a mi cuenta"
        ]
    ):
        return (
            "Para acceder a las funciones privadas de "
            "MUGI STORE debes iniciar sesión con tus "
            "credenciales registradas."
        )

    # ======================================================
    # CONTRASEÑA
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "olvide mi contrasena",
            "olvide la contrasena",
            "cambiar contrasena",
            "recuperar contrasena"
        ]
    ):
        return (
            "Si olvidaste tu contraseña, utiliza la opción "
            "de recuperación de contraseña disponible en "
            "la pantalla de inicio de sesión."
        )

    # ======================================================
    # PAGOS
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "formas de pago",
            "metodo de pago",
            "como pago",
            "medios de pago"
        ]
    ):
        return (
            "Las opciones de pago dependen de la configuración "
            "actual del proceso de compra de MUGI STORE. "
            "Puedes consultar las opciones disponibles al "
            "realizar la compra."
        )

    # ======================================================
    # ENVÍOS
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "envio",
            "envio a domicilio",
            "domicilio",
            "entrega"
        ]
    ):
        return (
            "La información de entrega depende de las "
            "condiciones configuradas para la tienda. "
            "Puedes consultar la información disponible "
            "durante el proceso de compra."
        )

    # ======================================================
    # DEVOLUCIONES
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "devolucion",
            "devolver",
            "cambio de producto",
            "cambiar producto"
        ]
    ):
        return (
            "Si necesitas solicitar un cambio o devolución, "
            "puedes registrar una PQR explicando tu situación "
            "para que el equipo correspondiente pueda revisarla."
        )

    # ======================================================
    # CONTACTO
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "contacto",
            "contactar",
            "comunicarme",
            "correo",
            "telefono"
        ]
    ):
        return (
            "Puedes utilizar la sección Contacto de MUGI STORE "
            "para consultar los canales de comunicación disponibles."
        )

    # ======================================================
    # HORARIOS
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "horario",
            "horarios",
            "a que hora",
            "cuando atienden"
        ]
    ):
        return (
            "Para conocer los horarios de atención actualizados, "
            "consulta la información disponible en la sección "
            "Contacto de MUGI STORE."
        )

    # ======================================================
    # ROLES
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "roles del sistema",
            "que roles tienen",
            "tipos de usuario",
            "administrador empleado cliente"
        ]
    ):
        return (
            "MUGI STORE utiliza tres roles principales: "
            "Administrador, Empleado y Cliente. Cada uno "
            "tiene permisos y funciones diferentes dentro "
            "de la plataforma."
        )

    # ======================================================
    # SEGURIDAD
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "seguridad",
            "datos seguros",
            "privacidad"
        ]
    ):
        return (
            "MUGI STORE utiliza autenticación y control de "
            "acceso para proteger las funciones privadas "
            "del sistema. La información privada de una "
            "cuenta requiere autenticación."
        )

    return None


# ==========================================================
# INSTRUCCIONES PARA OPENAI
# ==========================================================

INSTRUCCIONES_MUGI = """
Eres MUGI IA, el asistente virtual de MUGI STORE.

MUGI STORE es una tienda de accesorios y joyería.

Tu función es brindar atención inicial y ayudar al usuario
a comprender y utilizar la plataforma.

PUEDES AYUDAR CON:

- Información general de MUGI STORE.
- Productos.
- Compras.
- Carrito.
- Facturas.
- Ventas.
- PQR.
- Registro.
- Inicio de sesión.
- Recuperación de contraseña.
- Funcionamiento general de la plataforma.

REGLAS IMPORTANTES:

1. Responde siempre en español.

2. Sé claro, natural y breve.

3. Analiza primero qué está preguntando realmente el usuario.

4. RESPONDE DIRECTAMENTE A LA PREGUNTA.
No cambies el tema hacia productos si la pregunta no habla
de productos.

5. No inventes productos.

6. No inventes precios.

7. No inventes stock.

8. No inventes datos personales.

9. No inventes información privada de usuarios.

10. Si la pregunta necesita información real del catálogo,
utiliza únicamente los datos que se proporcionen en el
mensaje.

11. Si no tienes un dato específico, dilo claramente.

12. Si una pregunta está fuera de las funciones de MUGI STORE,
indica amablemente que tu función está enfocada en ayudar
con la plataforma MUGI STORE.

13. Si preguntan por una venta, factura o PQR específica,
indica que deben iniciar sesión para consultar información
privada.

14. Nunca solicites contraseñas ni claves privadas.

15. No afirmes que realizaste una acción si realmente no
la realizaste.

16. No digas que consultaste la base de datos si no se te
proporcionaron datos de ella.

17. No respondas con frases genéricas como
"hay muchos productos" cuando la pregunta no sea sobre
productos.

18. Si la pregunta es "¿puedes ayudarme con X?", responde
sobre X si está relacionado con MUGI STORE.

19. Puedes utilizar emojis moderadamente.

20. Si no puedes responder una pregunta concreta, explica
brevemente qué información sí puedes proporcionar.

EJEMPLOS:

Usuario:
"¿Por qué se llama MUGI?"

Debes responder sobre el significado de MUGI.

Usuario:
"¿Cómo recupero mi contraseña?"

Debes explicar el proceso general de recuperación.

Usuario:
"¿Qué es JWT?"

Puedes explicar qué es JWT de forma sencilla, pero aclara
que es una explicación técnica general si no forma parte
de una función visible para el usuario.

Usuario:
"¿Qué opinas de MUGI?"

Puedes dar una descripción neutral de la plataforma,
sin inventar características.

Usuario:
"¿Hay un producto llamado X?"

No inventes. Si no tienes datos del catálogo proporcionados,
indica que no puedes confirmar su existencia.
"""


# ==========================================================
# ENDPOINT CHATBOT
# ==========================================================

@router.post(
    "/",
    response_model=ChatbotResponse
)
def conversar(datos: ChatbotRequest):

    mensaje = datos.mensaje.strip()

    if not mensaje:
        return {
            "respuesta": "Escribe una pregunta para poder ayudarte."
        }

    db = SessionLocal()

    try:

        # ==================================================
        # 1. PRODUCTOS REALES DE LA BASE DE DATOS
        # ==================================================

        respuesta_producto = respuesta_productos(
            mensaje,
            db
        )

        if respuesta_producto:
            return {
                "respuesta": respuesta_producto
            }

        # ==================================================
        # 2. FAQ LOCAL
        # ==================================================

        respuesta_local = respuesta_faq(
            mensaje
        )

        if respuesta_local:
            return {
                "respuesta": respuesta_local
            }

    except Exception as error:

        print(
            "⚠️ ERROR CONSULTANDO PRODUCTOS:"
        )

        print(error)

        respuesta_local = None

    finally:

        db.close()

    # ======================================================
    # 3. OPENAI PARA PREGUNTAS MÁS ABIERTAS
    # ======================================================

    if client:

        try:

            respuesta = client.responses.create(
                model="gpt-5",
                instructions=INSTRUCCIONES_MUGI,
                input=(
                    f"Pregunta del usuario:\n{mensaje}\n\n"
                    "Responde directamente a la pregunta. "
                    "No cambies el tema. "
                    "Si no tienes información suficiente, "
                    "dilo claramente."
                )
            )

            respuesta_ia = respuesta.output_text

            if respuesta_ia and respuesta_ia.strip():

                return {
                    "respuesta": respuesta_ia.strip()
                }

        except Exception as error:

            print(
                "⚠️ OPENAI NO DISPONIBLE:"
            )

            print(error)

    # ======================================================
    # 4. FALLBACK FINAL
    # ======================================================

    return {
        "respuesta": (
            "No tengo suficiente información para responder "
            "esa pregunta con precisión. Puedo ayudarte con "
            "productos, compras, carrito, facturas, PQR y "
            "el funcionamiento de MUGI STORE."
        )
    }