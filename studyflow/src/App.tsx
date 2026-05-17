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
import { Movies } from "./pages/Movies";
import { Profile } from "./pages/Profile";
import { Reports } from "./pages/Reports";
import { Schedule } from "./pages/Schedule";

function AppLayout() {
	return (
		<NavBar>
			<Outlet />
		</NavBar>
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

				{/* Protected routes */}
				<Route element={<ProtectedRoute />}>
					<Route element={<AppLayout />}>
						{/* Study project */}
						<Route path="/study/contents" element={<Contents />} />
						<Route path="/study/categories" element={<Categories />} />
						<Route path="/study/schedule" element={<Schedule />} />
						<Route path="/study/profile" element={<Profile />} />
						<Route path="/study/reports" element={<Reports />} />

						{/* Movies project */}
						<Route path="/movies" element={<Movies />} />
					</Route>
				</Route>

				{/* Legacy redirects — keep old bookmarks working */}
				<Route path="/" element={<Navigate to="/study/contents" replace />} />
				<Route path="/categories" element={<Navigate to="/study/categories" replace />} />
				<Route path="/schedule" element={<Navigate to="/study/schedule" replace />} />
				<Route path="/profile" element={<Navigate to="/study/profile" replace />} />
				<Route path="/reports" element={<Navigate to="/study/reports" replace />} />

				<Route path="*" element={<Navigate to="/study/contents" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
