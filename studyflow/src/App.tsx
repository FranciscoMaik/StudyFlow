import {
	BrowserRouter,
	Navigate,
	Outlet,
	Route,
	Routes,
} from "react-router-dom";
import { Login } from "./components/auth/Login";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Register } from "./components/auth/Register";
import { NavBar } from "./components/ui/NavBar";
import { Toast } from "./components/ui/Toast";
import { Categories } from "./pages/Categories";
import { Contents } from "./pages/Contents";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Reports } from "./pages/Reports";
import { Schedule } from "./pages/Schedule";

/** Layout wrapper that renders the NavBar above all protected pages */
function AppLayout() {
	return (
		<>
			<NavBar />
			<Outlet />
		</>
	);
}

function App() {
	return (
		<BrowserRouter>
			<Toast />
			<Routes>
				{/* Public routes */}
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />

				{/* Protected routes — wrapped with NavBar */}
				<Route element={<ProtectedRoute />}>
					<Route element={<AppLayout />}>
						<Route path="/" element={<Dashboard />} />
						<Route path="/categories" element={<Categories />} />
						<Route path="/contents" element={<Contents />} />
						<Route path="/schedule" element={<Schedule />} />
						<Route path="/profile" element={<Profile />} />
						<Route path="/reports" element={<Reports />} />
					</Route>
				</Route>

				{/* Fallback */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
