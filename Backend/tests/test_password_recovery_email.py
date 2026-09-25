import asyncio

from app.correo import enviar_correo_recuperacion


class FakeFastMail:
    def __init__(self, *args, **kwargs):
        pass

    async def send_message(self, *args, **kwargs):
        raise RuntimeError("SMTP error simulado")


def test_enviar_correo_recuperacion_no_lanza_error(monkeypatch):
    monkeypatch.setattr("app.correo.FastMail", FakeFastMail)

    resultado = asyncio.run(
        enviar_correo_recuperacion("usuario@test.com", "https://example.com/reset")
    )

    assert resultado is False
