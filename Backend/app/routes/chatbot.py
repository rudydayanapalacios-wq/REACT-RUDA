from fastapi import APIRouter
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv
import os
import re
import unicodedata


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
    Convierte el texto a minúsculas y elimina tildes.
    Esto permite detectar preguntas como:
    ¿Qué productos tienen?
    que productos tienen
    QUE PRODUCTOS TIENEN
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

    texto = re.sub(r"[^a-z0-9\s]", " ", texto)
    return re.sub(r"\s+", " ", texto).strip()


def contiene_alguna(texto: str, palabras: list[str]) -> bool:
    """
    Comprueba si alguna palabra o expresión está presente.
    """

    return any(
        palabra in texto
        for palabra in palabras
    )


def respuesta_intencion_especifica(texto: str) -> str | None:
    """Resuelve primero preguntas que podrían coincidir con categorías amplias."""

    if contiene_alguna(
        texto,
        [
            "historia de mugi",
            "historia de mugi store",
            "cuentame la historia",
            "cuentame un poco de la historia",
            "cuentame sobre mugi",
            "origen de mugi",
            "como nacio mugi",
            "cuando se fundo mugi",
            "por que se llama mugi",
        ],
    ):
        return (
            "MUGI STORE nació como una propuesta para convertir la pasión por "
            "las aventuras y los accesorios inspirados en One Piece en una "
            "experiencia de compra cercana para los fans. Su nombre hace "
            "referencia a los Mugiwara, la tripulación del sombrero de paja. "
            "La tienda busca reunir productos con identidad, revisar cada "
            "compra con cuidado y ayudar a que cada cliente lleve consigo una "
            "parte de su propia aventura."
        )

    if contiene_alguna(
        texto,
        [
            "producto barato",
            "productos baratos",
            "mas barato",
            "mas economico",
            "economico",
            "economicos",
            "bajo presupuesto",
            "presupuesto bajo",
            "oferta",
            "ofertas",
            "descuento",
            "descuentos",
        ],
    ):
        return (
            "Si buscas una opción económica, entra a Productos y compara los "
            "precios de los artículos disponibles, empezando por los valores "
            "más bajos. Como el catálogo y el stock pueden cambiar, revisa "
            "siempre el precio actual antes de agregar un producto al carrito. "
            "También puedes decirme qué tipo de accesorio buscas y cuánto "
            "quieres gastar para orientarte mejor."
        )

    if contiene_alguna(
        texto,
        [
            "tengo un presupuesto",
            "mi presupuesto",
            "puedo gastar",
            "presupuesto de",
            "con cuanto dinero",
            "cuanto puedo gastar",
        ],
    ):
        return (
            "Puedo ayudarte a buscar dentro de tu presupuesto. Dime cuánto "
            "quieres gastar y si prefieres un collar, pulsera, anillo u otro "
            "accesorio. Después revisa el catálogo para confirmar el precio y "
            "la disponibilidad actual de cada opción."
        )

    if contiene_alguna(
        texto,
        [
            "regalo",
            "regalar",
            "para mi novia",
            "para mi novio",
            "para una amiga",
            "para un amigo",
            "cumpleanos",
            "cumpleaños",
        ],
    ):
        return (
            "Para elegir un regalo, piensa primero en el estilo de la persona "
            "y en tu presupuesto. Un collar o una pulsera pueden ser opciones "
            "versátiles, mientras que un accesorio temático puede tener un "
            "significado especial para un fan. Revisa las fotos, descripción, "
            "precio y stock en Productos antes de comprar."
        )

    if contiene_alguna(
        texto,
        [
            "de que material",
            "materiales",
            "material del producto",
            "como cuido",
            "como cuidar",
            "cuidado de la joya",
            "cuidar la joya",
            "se oxida",
        ],
    ):
        return (
            "La información del material debe revisarse en la descripción de "
            "cada producto. Para conservar tus accesorios, evita el contacto "
            "con agua, perfumes y productos químicos; guárdalos secos, limpios "
            "y separados para reducir rayones. Si necesitas confirmar un "
            "material específico, revisa la ficha del artículo o contáctanos."
        )

    if contiene_alguna(
        texto,
        [
            "como elegir",
            "que producto elegir",
            "cual producto compro",
            "ayudame a elegir",
            "ayuda para elegir",
        ],
    ):
        return (
            "Para elegir un producto, considera tres cosas: el tipo de "
            "accesorio que prefieres, el presupuesto disponible y el uso que "
            "le darás. En Productos puedes comparar la imagen, descripción, "
            "precio y disponibilidad antes de añadirlo al carrito."
        )

    if contiene_alguna(
        texto,
        [
            "precio",
            "precios",
            "cuanto cuesta",
            "cuanto vale",
            "valor",
            "valen",
        ],
    ):
        return (
            "El precio depende del producto que te interese. 💰 Puedes abrir "
            "la sección Productos para ver el valor actualizado de cada artículo "
            "y agregarlo al carrito."
        )

    if contiene_alguna(
        texto,
        [
            "stock",
            "disponible",
            "disponibilidad",
            "hay unidades",
            "queda",
        ],
    ):
        return (
            "La disponibilidad puede variar por producto. Revisa la sección "
            "Productos para consultar las unidades disponibles antes de comprar."
        )

    if contiene_alguna(
        texto,
        [
            "recomiendame",
            "que me recomiendas",
            "que producto me recomiendas",
            "cual me recomiendas",
        ],
    ):
        return (
            "¡Claro! ✨ Para recomendarte mejor, dime qué tipo de accesorio "
            "buscas o tu presupuesto. También puedes revisar el catálogo "
            "en Productos y comparar precios, descripción y disponibilidad."
        )

    if contiene_alguna(
        texto,
        [
            "estado de mi compra",
            "estado de mi venta",
            "como va mi compra",
            "donde esta mi pedido",
            "seguimiento de mi pedido",
        ],
    ):
        return (
            "Para revisar el estado de una compra, inicia sesión y entra a "
            "tu panel de cliente. Allí podrás consultar las ventas registradas "
            "y la información disponible de tu pedido."
        )

    if contiene_alguna(
        texto,
        [
            "crear pqr",
            "hacer pqr",
            "poner una pqr",
            "registrar una pqr",
            "enviar una pqr",
        ],
    ):
        return (
            "Para crear una PQR, inicia sesión, entra a la sección PQR y "
            "completa el tipo, asunto y descripción. Incluye datos claros "
            "para que el equipo pueda atender tu solicitud."
        )

    if contiene_alguna(
        texto,
        [
            "producto danado",
            "llego danado",
            "producto defectuoso",
        ],
    ):
        return (
            "Si recibiste un producto dañado o defectuoso, registra una PQR "
            "con el número de tu compra y una descripción del inconveniente. "
            "El equipo revisará tu caso."
        )

    return None


def respuesta_faq(mensaje: str) -> str:

    texto = normalizar_texto(mensaje)

    respuesta_prioritaria = respuesta_intencion_especifica(texto)

    if respuesta_prioritaria:
        return respuesta_prioritaria

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
            "hey",
            "que tal"
        ]
    ):
        return (
            "¡Hola! 👋 Soy MUGI IA, el asistente virtual de "
            "MUGI STORE. Puedo ayudarte con productos, "
            "compras, carrito, facturas, PQR y preguntas "
            "frecuentes. ¿Qué necesitas?"
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
            "¡Hasta luego! 👋 Gracias por visitar MUGI STORE. "
            "Cuando necesites ayuda, aquí estaré."
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
            "¡Con mucho gusto! 😊 Me alegra poder ayudarte. "
            "Si tienes otra pregunta sobre MUGI STORE, "
            "puedes escribirme."
        )

    # ======================================================
    # IDENTIDAD DEL CHATBOT
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "quien eres",
            "que eres",
            "eres una ia",
            "eres un robot",
            "eres humano",
            "como te llamas"
        ]
    ):
        return (
            "Soy MUGI IA 🤖, el asistente virtual de "
            "MUGI STORE. Estoy integrado en la plataforma "
            "para brindar atención inicial y orientar a los "
            "clientes."
        )

    # ======================================================
    # INFORMACIÓN DE MUGI
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
            "MUGI STORE es una tienda de accesorios y joyería. "
            "En nuestra plataforma puedes consultar productos, "
            "agregarlos al carrito, realizar compras, consultar "
            "facturas y gestionar solicitudes PQR."
        )

    # ======================================================
    # PRODUCTOS
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "productos",
            "producto",
            "que venden",
            "que tienen",
            "catalogo",
            "catalog",
            "accesorios"
        ]
    ):
        return (
            "MUGI STORE ofrece accesorios y productos de "
            "joyería. 💎 Puedes consultar el catálogo desde "
            "la sección de Productos para conocer los artículos "
            "disponibles, sus precios y su información."
        )

    # ======================================================
    # COLLARES
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "collar",
            "collares"
        ]
    ):
        return (
            "Sí, MUGI STORE puede ofrecer collares y otros "
            "accesorios. 💎 Para conocer los modelos disponibles "
            "y sus precios actuales, revisa la sección Productos."
        )

    # ======================================================
    # PULSERAS
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "pulsera",
            "pulseras"
        ]
    ):
        return (
            "Puedes consultar las pulseras disponibles en la "
            "sección Productos de MUGI STORE. Allí encontrarás "
            "la información correspondiente a cada producto."
        )

    # ======================================================
    # ANILLOS
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "anillo",
            "anillos"
        ]
    ):
        return (
            "Puedes consultar los anillos disponibles desde "
            "la sección Productos. El catálogo muestra la "
            "información disponible de cada artículo."
        )

    # ======================================================
    # PRECIO
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "precio",
            "precios",
            "cuanto cuesta",
            "cuanto vale",
            "valor",
            "valen"
        ]
    ):
        return (
            "Los precios dependen del producto que quieras "
            "comprar. 💰 Puedes consultar el precio actualizado "
            "directamente en la sección Productos de MUGI STORE."
        )

    # ======================================================
    # STOCK
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "stock",
            "disponible",
            "disponibilidad",
            "hay unidades",
            "queda"
        ]
    ):
        return (
            "La disponibilidad depende de cada producto. "
            "Te recomiendo revisar el catálogo para consultar "
            "el stock disponible."
        )

    # ======================================================
    # BUSCAR PRODUCTOS
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "buscar producto",
            "busco un producto",
            "estoy buscando",
            "quiero buscar",
            "como busco"
        ]
    ):
        return (
            "Puedes ingresar a la sección Productos y utilizar "
            "las opciones de búsqueda o filtros para encontrar "
            "el artículo que estás buscando."
        )

    # ======================================================
    # COMPRAS
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "comprar",
            "compra",
            "quiero comprar",
            "como compro",
            "como comprar"
        ]
    ):
        return (
            "Para comprar en MUGI STORE, primero selecciona "
            "el producto que deseas, agrégalo al carrito y "
            "continúa con el proceso de compra. Al finalizar "
            "se genera la información correspondiente a la venta."
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
            "El carrito de compras te permite guardar los "
            "productos que deseas comprar. 🛒 Puedes agregar "
            "productos, modificar cantidades y revisar el "
            "total antes de confirmar la compra."
        )

    # ======================================================
    # QUITAR PRODUCTOS DEL CARRITO
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
            "Puedes quitar un producto desde el carrito de "
            "compras utilizando la opción de eliminar que "
            "aparece junto al producto."
        )

    # ======================================================
    # CANTIDADES
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "cantidad",
            "cuantas unidades",
            "mas unidades",
            "menos unidades"
        ]
    ):
        return (
            "Desde el carrito puedes modificar la cantidad "
            "de unidades de los productos antes de confirmar "
            "la compra."
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
            "Después de realizar una compra, el sistema "
            "registra la venta y genera la información de "
            "facturación correspondiente. Si necesitas "
            "consultar una factura específica, inicia sesión "
            "en tu cuenta."
        )

    # ======================================================
    # VENTAS
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "venta",
            "ventas",
            "pedido",
            "pedidos"
        ]
    ):
        return (
            "Las compras realizadas quedan registradas como "
            "ventas dentro del sistema. Los usuarios autorizados "
            "pueden consultar la información correspondiente "
            "desde los paneles de gestión."
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
            "donde esta mi pedido"
        ]
    ):
        return (
            "Para consultar información específica sobre una "
            "compra debes ingresar a tu cuenta. Allí podrás "
            "consultar la información disponible de tus ventas."
        )

    # ======================================================
    # PQR
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "pqr",
            "peticion",
            "queja",
            "reclamo",
            "solicitud"
        ]
    ):
        return (
            "MUGI STORE cuenta con un sistema de PQR para "
            "registrar peticiones, quejas, reclamos y solicitudes. "
            "Puedes ingresar a la sección PQR para crear una "
            "solicitud y consultar su estado."
        )

    # ======================================================
    # CREAR PQR
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
            "Para registrar una PQR, ingresa a la sección "
            "correspondiente y completa el tipo, asunto y "
            "descripción de tu solicitud. El sistema registrará "
            "la PQR para su posterior atención."
        )

    # ======================================================
    # RESPUESTA PQR
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "respuesta de mi pqr",
            "respondieron mi pqr",
            "respuesta pqr",
            "estado pqr"
        ]
    ):
        return (
            "Para consultar la respuesta o el estado de una "
            "PQR específica debes ingresar a tu cuenta y "
            "consultar tus solicitudes registradas."
        )

    # ======================================================
    # CUENTA
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "cuenta",
            "mi cuenta",
            "perfil"
        ]
    ):
        return (
            "Desde tu cuenta puedes consultar y gestionar "
            "la información disponible de tu perfil. Para "
            "información privada debes iniciar sesión."
        )

    # ======================================================
    # REGISTRO
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "registrarme",
            "registro",
            "crear cuenta",
            "crear una cuenta",
            "como me registro"
        ]
    ):
        return (
            "Si todavía no tienes una cuenta, puedes utilizar "
            "la opción de registro disponible en MUGI STORE "
            "y completar los datos solicitados."
        )

    # ======================================================
    # LOGIN
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "iniciar sesion",
            "iniciar sesión",
            "login",
            "entrar a mi cuenta",
            "ingresar"
        ]
    ):
        return (
            "Para acceder a las funciones privadas de MUGI "
            "STORE debes iniciar sesión utilizando tus "
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
            "cambiar contraseña",
            "contrasena"
        ]
    ):
        return (
            "Si tienes problemas con tu contraseña, utiliza "
            "las opciones disponibles en el sistema para "
            "gestionar el acceso a tu cuenta."
        )

    # ======================================================
    # PAGOS
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "pago",
            "pagos",
            "como pago",
            "formas de pago",
            "metodo de pago"
        ]
    ):
        return (
            "Las opciones de pago disponibles dependen de "
            "la configuración actual de MUGI STORE. Consulta "
            "el proceso de compra para conocer las opciones "
            "disponibles."
        )

    # ======================================================
    # ENVÍOS
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "envio",
            "envíos",
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
            "devolución",
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
    # PRODUCTO DAÑADO
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "producto danado",
            "producto dañado",
            "llego danado",
            "llego dañado",
            "producto defectuoso"
        ]
    ):
        return (
            "Si recibiste un producto con algún inconveniente, "
            "puedes registrar una PQR describiendo lo sucedido "
            "para solicitar atención sobre tu caso."
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
            "para consultar los canales de comunicación "
            "disponibles."
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
            "rol",
            "roles",
            "administrador",
            "empleado",
            "cliente"
        ]
    ):
        return (
            "MUGI STORE utiliza diferentes roles dentro del "
            "sistema, como Administrador, Empleado y Cliente. "
            "Cada rol tiene permisos y funciones diferentes."
        )

    # ======================================================
    # SEGURIDAD
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "seguridad",
            "datos seguros",
            "mis datos",
            "privacidad"
        ]
    ):
        return (
            "MUGI STORE utiliza autenticación y control de "
            "acceso para proteger las funciones privadas del "
            "sistema. La información específica de una cuenta "
            "solo debe consultarse después de iniciar sesión."
        )

    # ======================================================
    # RECOMENDACIONES
    # ======================================================

    if contiene_alguna(
        texto,
        [
            "recomiendame",
            "recomiendame algo",
            "que me recomiendas",
            "que producto me recomiendas",
            "cual me recomiendas"
        ]
    ):
        return (
            "¡Claro! ✨ Puedo orientarte sobre los productos "
            "de MUGI STORE. Para elegir uno, puedes revisar "
            "el catálogo y comparar los productos disponibles, "
            "sus características y precios."
        )

    # ======================================================
    # AGRADECIMIENTO + DESPEDIDA
    # ======================================================

    if (
        "gracias" in texto
        and contiene_alguna(
            texto,
            [
                "adios",
                "chao",
                "hasta luego"
            ]
        )
    ):
        return (
            "¡Gracias a ti! 💎 Fue un gusto ayudarte. "
            "¡Hasta luego!"
        )

    # ======================================================
    # RESPUESTA GENERAL
    # ======================================================

    return (
        "Puedo ayudarte con información sobre MUGI STORE, "
        "productos, precios, disponibilidad, compras, carrito, "
        "ventas, facturas, cuenta, PQR y el funcionamiento "
        "general de la plataforma. 😊\n\n"
        "Si tienes una pregunta más específica, escríbela "
        "y trataré de orientarte."
    )


# ==========================================================
# INSTRUCCIONES PARA OPENAI
# ==========================================================

INSTRUCCIONES_MUGI = """
Eres MUGI IA, el asistente virtual de MUGI STORE.

MUGI STORE es una tienda de accesorios y joyería.

Tu función es brindar atención inicial a los clientes.

Puedes ayudar con:

- Información general de MUGI STORE.
- Productos y accesorios.
- Orientación sobre compras.
- Carrito de compras.
- Ventas.
- Facturas.
- PQR.
- Preguntas frecuentes.
- Registro e inicio de sesión.
- Funcionamiento general de la plataforma.

REGLAS IMPORTANTES:

1. Responde siempre en español.

2. Sé amable, claro y breve.

3. No inventes productos que no conozcas.

4. No inventes precios.

5. No inventes stock.

6. No inventes datos personales.

7. No inventes información privada de los usuarios.

8. Si preguntan por una venta, factura o PQR específica,
indica que deben ingresar a su cuenta.

9. Si no conoces un dato específico de MUGI STORE,
indica que deben revisar la sección correspondiente
de la plataforma.

10. Puedes explicar cómo funciona el sistema.

11. Puedes explicar el proceso general de compra.

12. Puedes orientar al usuario para crear una PQR.

13. No solicites contraseñas ni claves privadas.

14. No reveles información confidencial.

15. Utiliza respuestas fáciles de entender.

16. Puedes utilizar emojis de manera moderada.

17. Tu objetivo es brindar atención inicial y orientar
al usuario dentro de MUGI STORE.
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

    # ------------------------------------------------------
    # RESPUESTA LOCAL INICIAL
    # ------------------------------------------------------

    respuesta_local = respuesta_faq(mensaje)

    respuesta_general = (
        "Puedo ayudarte con información sobre MUGI STORE, "
        "productos, precios, disponibilidad, compras, carrito, "
        "ventas, facturas, cuenta, PQR y el funcionamiento "
        "general de la plataforma. 😊\n\n"
        "Si tienes una pregunta más específica, escríbela "
        "y trataré de orientarte."
    )

    # Las preguntas reconocidas tienen respuestas locales más precisas
    # que una respuesta generada sin datos reales del catálogo o la cuenta.
    if respuesta_local != respuesta_general:
        return {
            "respuesta": respuesta_local
        }

    # ------------------------------------------------------
    # INTENTAR OPENAI
    # ------------------------------------------------------

    if client:

        try:

            respuesta = client.responses.create(
                model="gpt-5",
                instructions=INSTRUCCIONES_MUGI,
                input=(
                    f"Pregunta del usuario: {mensaje}\n\n"
                    f"Orientación disponible: {respuesta_local}\n\n"
                    "Responde de forma concreta y relacionada con la pregunta. "
                    "Si la orientación no contiene el dato solicitado, dilo "
                    "claramente y dirige al usuario a la sección adecuada."
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

            print(
                "➡️ Se utilizará la respuesta FAQ local."
            )

    # ------------------------------------------------------
    # FALLBACK
    # ------------------------------------------------------

    return {
        "respuesta": respuesta_local
    }