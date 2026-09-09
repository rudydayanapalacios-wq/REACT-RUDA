import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RutaProtegida({ children, rolPermitido, rolesPermitidos }) {
  const { usuario, token, autenticado } = useAuth();

  if (!autenticado || !usuario || !token) {
    return <Navigate to="/login" replace />;
  }

  const rol = Number(
    usuario.rol_id ??
    usuario.rol?.id ??
    usuario.rol?.rol_id
  );

  const accesoPermitido = rolesPermitidos
    ? rolesPermitidos.includes(rol)
    : rol === rolPermitido;

  if (!accesoPermitido) {
    if (rol === 1) {
      return <Navigate to="/admin" replace />;
    }

    if (rol === 2) {
      return <Navigate to="/cliente" replace />;
    }

    if (rol === 3) {
      return <Navigate to="/empleado" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RutaProtegida;
