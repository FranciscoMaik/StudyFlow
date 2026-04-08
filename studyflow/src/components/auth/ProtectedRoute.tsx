import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

interface ProtectedRouteProps {
	children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const user = useAuthStore((state) => state.user);
	const loading = useAuthStore((state) => state.loading);

	if (loading) {
		return null; // aguarda a sessão ser resolvida antes de redirecionar
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return children ? <>{children}</> : <Outlet />;
}
