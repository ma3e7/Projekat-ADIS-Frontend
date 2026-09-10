import { Navigate } from "react-router-dom";
import authService from "../../services/authService";

export default function ProtectedRoute({ children, role }) {
    const user = authService.getCurrentUser();

    if (!user) return <Navigate to="/" replace />;
    if (role && user.role !== role) return <Navigate to="/" replace />;

    return children;
}
