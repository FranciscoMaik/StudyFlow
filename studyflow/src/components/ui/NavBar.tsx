import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const NAV_LINKS: { to: string; label: string; end?: boolean }[] = [
	{ to: "/", label: "Dashboard", end: true },
	{ to: "/contents", label: "Conteúdos" },
	{ to: "/categories", label: "Categorias" },
	{ to: "/schedule", label: "Agenda" },
	{ to: "/profile", label: "Perfil" },
	{ to: "/reports", label: "Relatórios" },
];

export function NavBar() {
	const { signOut } = useAuth();

	return (
		<header className="bg-white border-b border-gray-200">
			<nav
				className="mx-auto max-w-4xl px-4 flex items-center justify-between h-14"
				aria-label="Navegação principal"
			>
				{/* Brand */}
				<span className="font-bold text-indigo-600 text-base shrink-0">
					StudyFlow
				</span>

				{/* Links — scrollable on small viewports */}
				<ul className="flex items-center gap-1 overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{NAV_LINKS.map(({ to, label, end }) => (
						<li key={to}>
							<NavLink
								to={to}
								end={end}
								className={({ isActive }) =>
									[
										"whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
										"focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
										isActive
											? "bg-indigo-50 text-indigo-700"
											: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
									].join(" ")
								}
							>
								{label}
							</NavLink>
						</li>
					))}
				</ul>

				{/* Logout */}
				<button
					type="button"
					onClick={() => signOut()}
					className="shrink-0 ml-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
				>
					Sair
				</button>
			</nav>
		</header>
	);
}
