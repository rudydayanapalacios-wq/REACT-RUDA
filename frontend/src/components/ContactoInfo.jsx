import "../styles/ContactoInfo.css";

function ContactoInfo() {
  return (
    <div className="contacto-info">

      <div className="contacto-item">
        <span className="contacto-icono">📍</span>

        <div>
          <h3>Ubicación</h3>
          <p>Colombia</p>
        </div>
      </div>

      <div className="contacto-item">
        <span className="contacto-icono">📧</span>

        <div>
          <h3>Correo</h3>
          <p>contacto@onepieceaccessories.com</p>
        </div>
      </div>

      <div className="contacto-item">
        <span className="contacto-icono">📱</span>

        <div>
          <h3>Teléfono</h3>
          <p>+57 300 000 0000</p>
        </div>
      </div>

    </div>
  );
}

export default ContactoInfo;