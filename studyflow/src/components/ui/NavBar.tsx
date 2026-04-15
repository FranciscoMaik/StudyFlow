import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";

const NAV_LINKS: { to: string; label: string; end?: boolean }[] = [
	{ to: "/", label: "Conteúdos", end: true },
	{ to: "/categories", label: "Categorias" },
	{ to: "/schedule", label: "Agenda" },
	{ to: "/profile", label: "Perfil" },
	{ to: "/reports", label: "Relatórios" },
];

export function NavBar() {
	const { signOut } = useAuth();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<header className="bg-white border-b border-gray-200 relative z-50">
			<nav
				className="mx-auto max-w-4xl px-4 flex items-center justify-between h-14"
				aria-label="Navegação principal"
			>
				{/* Brand */}
				<NavLink to="/" end>
					<img src="/logo.png" alt="Jazim Logo" className="h-8 w-auto shrink-0" />
				</NavLink>

				{/* Desktop Links */}
				<ul className="hidden md:flex items-center gap-1">
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

				{/* Logout Desktop */}
				<button
					type="button"
					onClick={() => signOut()}
					className="hidden md:block shrink-0 ml-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
				>
					Sair
				</button>

				{/* Mobile Menu Button */}
				<button
					type="button"
					className="md:hidden p-2 text-gray-600 hover:text-indigo-600 focus:outline-none rounded-md"
					onClick={() => setIsOpen(!isOpen)}
					aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
				>
					{isOpen ? <X size={24} /> : <Menu size={24} />}
				</button>
			</nav>

			{/* Mobile Dropdown */}
			{isOpen && (
				<div className="md:hidden absolute top-14 left-0 w-full bg-white border-b border-gray-200 shadow-xl">
					<ul className="flex flex-col p-4 gap-2">
						{NAV_LINKS.map(({ to, label, end }) => (
							<li key={to}>
								<NavLink
									to={to}
									end={end}
									onClick={() => setIsOpen(false)}
									className={({ isActive }) =>
										[
											"block rounded-md px-4 py-3 text-base font-medium transition-colors",
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
						<li>
							<button
								type="button"
								onClick={() => {
									setIsOpen(false);
									signOut();
								}}
								className="w-full text-left rounded-md px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 mt-2 border-t border-gray-100"
							>
								<LogOut size={20} />
								Sair
							</button>
						</li>
					</ul>
				</div>
			)}
		</header>
	);
}
