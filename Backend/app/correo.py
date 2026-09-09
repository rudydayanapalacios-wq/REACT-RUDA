import os
import html

from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

load_dotenv()


# ============================================================
# CONFIGURACIÓN DEL CORREO
# ============================================================

print("====================================")
print("CONFIGURACIÓN DEL CORREO")
print("MAIL_USERNAME:", os.getenv("MAIL_USERNAME"))
print(
    "MAIL_PASSWORD configurada:",
    bool(os.getenv("MAIL_PASSWORD"))
)
print("MAIL_FROM:", os.getenv("MAIL_FROM"))
print("MAIL_SERVER:", "smtp.gmail.com")
print("MAIL_PORT:", 587)
print("====================================")


conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)


# ============================================================
# ENVIAR CORREO DE RECUPERACIÓN
# ============================================================

async def enviar_correo_recuperacion(
    correo_destino: str,
    enlace: str
):

    print("====================================")
    print("PREPARANDO CORREO DE RECUPERACIÓN")
    print("DESTINO:", correo_destino)

    # --------------------------------------------------------
    # PROTEGER EL ENLACE PARA HTML
    # --------------------------------------------------------

    enlace_seguro = html.escape(
        enlace,
        quote=True
    )

    # --------------------------------------------------------
    # CUERPO HTML
    # --------------------------------------------------------

    cuerpo_html = f"""
<!DOCTYPE html>

<html lang="es">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Recuperación de contraseña - MUGI STORE
    </title>

</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #EFE8DF;
    font-family: Arial, Helvetica, sans-serif;
    color: #52070A;
">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background-color: #EFE8DF;
        padding: 40px 15px;
    "
>

    <tr>

        <td align="center">

            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                    max-width: 600px;
                    background-color: #F8F3EA;
                    border: 1px solid #D8BA98;
                    border-radius: 25px;
                    overflow: hidden;
                "
            >

                <!-- ENCABEZADO -->

                <tr>

                    <td
                        align="center"
                        style="
                            background-color: #7F0303;
                            padding: 35px 25px;
                        "
                    >

                        <div style="
                            font-size: 30px;
                            font-weight: bold;
                            letter-spacing: 3px;
                            color: #FFFFFF;
                            margin-bottom: 10px;
                        ">

                            MUGI STORE

                        </div>

                        <div style="
                            width: 70px;
                            height: 3px;
                            background-color: #D4AF37;
                            margin: 0 auto 15px auto;
                        ">
                        </div>

                        <div style="
                            font-size: 14px;
                            color: #F8F3EA;
                            letter-spacing: 1px;
                        ">

                            Tu tienda, tu estilo

                        </div>

                    </td>

                </tr>


                <!-- CONTENIDO -->

                <tr>

                    <td style="padding: 40px 35px;">

                        <h1 style="
                            margin: 0 0 20px 0;
                            text-align: center;
                            font-family: Georgia, 'Times New Roman', serif;
                            font-size: 28px;
                            color: #7F0303;
                        ">

                            Recupera tu acceso

                        </h1>


                        <p style="
                            margin: 0 0 18px 0;
                            font-size: 16px;
                            line-height: 1.7;
                            color: #765E52;
                        ">

                            Hola,

                        </p>


                        <p style="
                            margin: 0 0 18px 0;
                            font-size: 16px;
                            line-height: 1.7;
                            color: #765E52;
                        ">

                            Recibimos una solicitud para recuperar
                            la contraseña de tu cuenta de

                            <strong style="color: #7F0303;">
                                MUGI STORE
                            </strong>.

                        </p>


                        <p style="
                            margin: 0 0 30px 0;
                            font-size: 16px;
                            line-height: 1.7;
                            color: #765E52;
                        ">

                            Para crear una nueva contraseña,
                            haz clic en el siguiente botón:

                        </p>


                        <!-- BOTÓN -->

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                        >

                            <tr>

                                <td align="center">

                                    <a
                                        href="{enlace_seguro}"
                                        style="
                                            display: inline-block;
                                            background-color: #7F0303;
                                            color: #FFFFFF;
                                            text-decoration: none;
                                            font-size: 16px;
                                            font-weight: bold;
                                            padding: 15px 35px;
                                            border-radius: 12px;
                                            border: 2px solid #D4AF37;
                                        "
                                    >

                                        Restablecer contraseña

                                    </a>

                                </td>

                            </tr>

                        </table>


                        <!-- ENLACE -->

                        <p style="
                            margin: 30px 0 10px 0;
                            font-size: 13px;
                            line-height: 1.6;
                            color: #765E52;
                            text-align: center;
                        ">

                            Si el botón no funciona, puedes copiar
                            y pegar este enlace en tu navegador:

                        </p>


                        <p style="
                            margin: 0;
                            padding: 12px;
                            background-color: #EFE8DF;
                            border: 1px solid #D8BA98;
                            border-radius: 10px;
                            font-size: 12px;
                            line-height: 1.5;
                            word-break: break-all;
                            color: #7F0303;
                        ">

                            {enlace_seguro}

                        </p>


                        <!-- AVISO -->

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="margin-top: 30px;"
                        >

                            <tr>

                                <td style="
                                    background-color: #EFE8DF;
                                    border-left: 4px solid #D4AF37;
                                    padding: 15px;
                                    border-radius: 8px;
                                ">

                                    <p style="
                                        margin: 0;
                                        font-size: 14px;
                                        line-height: 1.6;
                                        color: #765E52;
                                    ">

                                        <strong style="
                                            color: #7F0303;
                                        ">

                                            Importante:

                                        </strong>

                                        este enlace es temporal y
                                        dejará de funcionar después
                                        de un tiempo.

                                    </p>

                                </td>

                            </tr>

                        </table>


                        <!-- SEGURIDAD -->

                        <p style="
                            margin: 30px 0 0 0;
                            font-size: 14px;
                            line-height: 1.7;
                            color: #765E52;
                        ">

                            Si tú no solicitaste este cambio de
                            contraseña, puedes ignorar este correo.
                            Tu cuenta permanecerá segura.

                        </p>


                        <p style="
                            margin: 25px 0 0 0;
                            font-size: 15px;
                            line-height: 1.6;
                            color: #765E52;
                        ">

                            Saludos,<br>

                            <strong style="color: #7F0303;">

                                Equipo MUGI STORE

                            </strong>

                        </p>

                    </td>

                </tr>


                <!-- PIE -->

                <tr>

                    <td
                        align="center"
                        style="
                            background-color: #7F0303;
                            padding: 25px 20px;
                        "
                    >

                        <div style="
                            color: #D4AF37;
                            font-size: 18px;
                            font-weight: bold;
                            letter-spacing: 2px;
                            margin-bottom: 8px;
                        ">

                            MUGI STORE

                        </div>


                        <div style="
                            color: #F8F3EA;
                            font-size: 12px;
                        ">

                            Gracias por confiar en nosotros.

                        </div>

                    </td>

                </tr>

            </table>

        </td>

    </tr>

</table>

</body>

</html>
"""

    # ========================================================
    # CREAR MENSAJE
    # ========================================================

    mensaje = MessageSchema(
        subject="Recuperación de contraseña - MUGI STORE",
        recipients=[correo_destino],
        body=cuerpo_html,
        subtype="html",
    )

    # ========================================================
    # FASTMAIL
    # ========================================================

    print("CREANDO CONEXIÓN CON GMAIL...")

    fm = FastMail(conf)

    print("INTENTANDO ENVIAR CORREO...")
    print("DESTINO:", correo_destino)

    # ========================================================
    # ENVIAR CORREO
    # ========================================================

    try:

        await fm.send_message(mensaje)

        print("CORREO ENVIADO CORRECTAMENTE")
        print("====================================")

    except Exception as error:

        print("====================================")
        print("ERROR ENVIANDO CORREO")
        print("TIPO DE ERROR:", type(error).__name__)
        print("DETALLE:", repr(error))
        print("====================================")

        raise