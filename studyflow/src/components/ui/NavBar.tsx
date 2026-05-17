import {
	BarChart,
	BookOpen,
	Brain,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Film,
	LogOut,
	Menu,
	Tags,
	User,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

type ProjectSlug = "study" | "movies";

const PROJECTS: {
	slug: ProjectSlug;
	label: string;
	icon: React.ElementType;
	defaultPath: string;
}[] = [
	{ slug: "study", label: "Estudos", icon: BookOpen, defaultPath: "/study/contents" },
	{ slug: "movies", label: "Filmes", icon: Film, defaultPath: "/movies" },
];

const PROJECT_NAV_LINKS: Record<
	ProjectSlug,
	{ to: string; label: string; icon: React.ElementType; end?: boolean }[]
> = {
	study: [
		{ to: "/study/contents", label: "Conteúdos", icon: BookOpen, end: true },
		{ to: "/study/categories", label: "Categorias", icon: Tags },
		{ to: "/study/schedule", label: "Agendas", icon: Calendar },
		{ to: "/study/profile", label: "Perfil", icon: User },
		{ to: "/study/reports", label: "Relatórios", icon: BarChart },
	],
	movies: [
		{ to: "/movies", label: "Minha Lista", icon: Film, end: true },
	],
};

export function NavBar({ children }: { children?: React.ReactNode }) {
	const { signOut } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	const activeProject: ProjectSlug = location.pathname.startsWith("/movies")
		? "movies"
		: "study";

	const navLinks = PROJECT_NAV_LINKS[activeProject];

	return (
		<div className="min-h-screen bg-gray-50 flex">
			{/* Mobile Header */}
			<header className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 h-14 fixed top-0 w-full z-40">
				<NavLink to="/study/contents">
					<img
						src="/logo.png"
						alt="Jazim Logo"
						className="h-8 w-auto shrink-0"
					/>
				</NavLink>
				<button
					type="button"
					className="p-2 text-gray-600 hover:text-indigo-600 focus:outline-none rounded-md"
					onClick={() => setIsMobileOpen(!isMobileOpen)}
					aria-label={isMobileOpen ? "Fechar menu" : "Abrir menu"}
				>
					<Menu size={24} />
				</button>
			</header>

			{/* Floating Sidebar */}
			<aside
				className={`
					fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out
					${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
					md:translate-x-0 md:p-4 bg-transparent
				`}
			>
				<div
					className={`
						flex flex-col h-full bg-white md:rounded-2xl border-r md:border border-gray-200 shadow-xl md:shadow-lg
						transition-all duration-300 ease-in-out
						${isCollapsed ? "w-20" : "w-64"}
						${isMobileOpen ? "w-64" : ""}
					`}
				>
					{/* Logo */}
					<div className="flex items-center justify-between p-4 h-20 shrink-0 border-b border-gray-100">
						<NavLink
							to="/study/contents"
							className={`flex items-center mx-auto overflow-hidden transition-all duration-300 ${isCollapsed && !isMobileOpen ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}
						>
							<img
								src="/logo.png"
								alt="Jazim Logo"
								className="h-8 w-auto shrink-0"
							/>
						</NavLink>
						{isCollapsed && !isMobileOpen && (
							<NavLink
								to="/study/contents"
								className="mx-auto text-indigo-600 hover:text-indigo-700 transition-colors"
							>
								<Brain size={32} />
							</NavLink>
						)}
					</div>

					{/* Project Switcher */}
					<div className="px-3 pt-3 pb-2 border-b border-gray-100">
						{(!isCollapsed || isMobileOpen) && (
							<p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
								Módulos
							</p>
						)}
						<div
							className={`flex ${isCollapsed && !isMobileOpen ? "flex-col items-center gap-1" : "gap-2"}`}
						>
							{PROJECTS.map(({ slug, label, icon: Icon, defaultPath }) => (
								<button
									key={slug}
									type="button"
									onClick={() => {
										navigate(defaultPath);
										setIsMobileOpen(false);
									}}
									title={isCollapsed && !isMobileOpen ? label : undefined}
									className={[
										"flex items-center gap-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
										isCollapsed && !isMobileOpen
											? "justify-center p-2.5"
											: "flex-1 px-3 py-2 justify-start",
										activeProject === slug
											? "bg-indigo-600 text-white shadow-sm"
											: "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
									].join(" ")}
								>
									<Icon size={16} className="shrink-0" />
									{(!isCollapsed || isMobileOpen) && (
										<span className="text-xs font-semibold whitespace-nowrap">
											{label}
										</span>
									)}
								</button>
							))}
						</div>
					</div>

					{/* Navigation Links */}
					<nav
						className="flex-1 md:overflow-visible overflow-y-auto py-4 flex flex-col gap-2 px-3 no-scrollbar"
						aria-label="Navegação principal"
					>
						<ul className="flex flex-col gap-1">
							{navLinks.map(({ to, label, icon: Icon, end }) => (
								<li key={to}>
									<NavLink
										to={to}
										end={end}
										onClick={() => setIsMobileOpen(false)}
										className={({ isActive }) =>
											[
												"flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
												"focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 group relative",
												isActive
													? "bg-indigo-50 text-indigo-700"
													: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
												isCollapsed && !isMobileOpen
													? "justify-center"
													: "justify-start",
											].join(" ")
										}
									>
										<Icon size={20} className="shrink-0" />
										<span
											className={`whitespace-nowrap transition-all duration-300 ${isCollapsed && !isMobileOpen ? "w-0 opacity-0 overflow-hidden hidden" : "w-auto opacity-100"}`}
										>
											{label}
										</span>

										{isCollapsed && !isMobileOpen && (
											<div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-100 whitespace-nowrap pointer-events-none before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-1 before:border-4 before:border-transparent before:border-r-gray-800 shadow-md">
												{label}
											</div>
										)}
									</NavLink>
								</li>
							))}
						</ul>
					</nav>

					{/* Bottom Actions */}
					<div className="p-3 border-t border-gray-100 flex flex-col gap-2">
						<button
							type="button"
							onClick={() => setIsCollapsed(!isCollapsed)}
							className="hidden md:flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none w-full relative group"
							style={{ justifyContent: isCollapsed ? "center" : "flex-start" }}
						>
							{isCollapsed ? (
								<ChevronRight size={20} className="shrink-0" />
							) : (
								<ChevronLeft size={20} className="shrink-0" />
							)}
							<span
								className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}
							>
								Recolher
							</span>

							{isCollapsed && (
								<div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-100 whitespace-nowrap pointer-events-none before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-1 before:border-4 before:border-transparent before:border-r-gray-800 shadow-md">
									Expandir menu
								</div>
							)}
						</button>

						<button
							type="button"
							onClick={() => {
								setIsMobileOpen(false);
								signOut();
							}}
							className={`
								flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 relative group
								text-red-500 hover:bg-red-50 hover:text-red-600
								${isCollapsed && !isMobileOpen ? "justify-center" : "justify-start"}
							`}
						>
							<LogOut size={20} className="shrink-0" />
							<span
								className={`whitespace-nowrap transition-all duration-300 ${isCollapsed && !isMobileOpen ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}
							>
								Sair
							</span>

							{isCollapsed && !isMobileOpen && (
								<div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-100 whitespace-nowrap pointer-events-none before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-1 before:border-4 before:border-transparent before:border-r-gray-800 shadow-md">
									Sair
								</div>
							)}
						</button>
					</div>
				</div>
			</aside>

			{/* Mobile Overlay */}
			{isMobileOpen && (
				<button
					type="button"
					className="md:hidden fixed inset-0 bg-black/20 z-40 w-full h-full cursor-default focus:outline-none border-none"
					onClick={() => setIsMobileOpen(false)}
					aria-label="Fechar menu overlay"
					tabIndex={-1}
				/>
			)}

			{/* Main Content */}
			<main
				className={`flex-1 w-full transition-all duration-300 ease-in-out pt-14 md:pt-0 ${isCollapsed ? "md:pl-24" : "md:pl-72"}`}
			>
				{children}
			</main>
		</div>
	);
}
