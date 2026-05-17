import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Film, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import {
	useCreateMovie,
	useDeleteMovie,
	useMovies,
	useUpdateMovie,
} from "../hooks/useMovies";
import type { Movie } from "../types";

type Tab = "want_to_watch" | "watched";

const movieSchema = z.object({
	title: z
		.string()
		.min(1, "Título é obrigatório")
		.max(200, "Máximo 200 caracteres"),
	description: z.string().max(1000, "Máximo 1000 caracteres").optional(),
	genre: z.string().max(50, "Máximo 50 caracteres").optional(),
	releaseYear: z
		.number()
		.int()
		.min(1888, "Ano inválido")
		.max(2100, "Ano inválido")
		.optional(),
});

type MovieFormData = z.infer<typeof movieSchema>;

const inputCls =
	"w-full border-2 border-transparent bg-slate-100 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all";
const labelCls =
	"block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";

function StarRating({
	value,
	onChange,
}: {
	value: number | undefined;
	onChange: (v: number) => void;
}) {
	return (
		<div className="flex gap-0.5">
			{Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
				<button
					key={n}
					type="button"
					onClick={() => onChange(n === value ? 0 : n)}
					className={`text-2xl leading-none transition-colors ${
						n <= (value ?? 0) ? "text-yellow-400" : "text-gray-300"
					} hover:text-yellow-400`}
				>
					★
				</button>
			))}
		</div>
	);
}

function MovieCard({
	movie,
	onMarkWatched,
	onDelete,
}: {
	movie: Movie;
	onMarkWatched?: (movie: Movie) => void;
	onDelete: (id: string) => void;
}) {
	return (
		<div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
			<div className="flex items-start justify-between gap-2">
				<h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 flex-1 min-w-0">
					{movie.title}
				</h3>
				<button
					type="button"
					onClick={() => onDelete(movie.id)}
					className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
					aria-label="Excluir filme"
				>
					<Trash2 size={15} />
				</button>
			</div>

			<div className="flex flex-wrap gap-2">
				{movie.genre && (
					<span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
						{movie.genre}
					</span>
				)}
				{movie.releaseYear && (
					<span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
						{movie.releaseYear}
					</span>
				)}
				{movie.status === "watched" && movie.rating != null && (
					<span className="text-xs font-medium bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full flex items-center gap-1">
						<Star size={11} className="fill-yellow-400 text-yellow-400" />
						{movie.rating}/10
					</span>
				)}
			</div>

			{movie.description && (
				<p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
					{movie.description}
				</p>
			)}

			{movie.status === "want_to_watch" && onMarkWatched && (
				<button
					type="button"
					onClick={() => onMarkWatched(movie)}
					className="mt-auto flex items-center justify-center gap-2 w-full rounded-xl px-3 py-2.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
				>
					<CheckCircle size={14} />
					Marcar como assistido
				</button>
			)}
		</div>
	);
}

function WatchedDialog({
	movie,
	onConfirm,
	onCancel,
	isLoading,
}: {
	movie: Movie;
	onConfirm: (rating?: number) => void;
	onCancel: () => void;
	isLoading: boolean;
}) {
	const [rating, setRating] = useState<number | undefined>(undefined);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div
				role="dialog"
				aria-modal="true"
				className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 flex flex-col gap-5"
			>
				<div className="flex items-center gap-3">
					<div className="bg-emerald-50 rounded-xl p-2.5 shrink-0">
						<CheckCircle size={20} className="text-emerald-600" />
					</div>
					<div className="min-w-0">
						<h2 className="text-sm font-semibold text-gray-900">
							Marcar como assistido
						</h2>
						<p className="text-xs text-gray-500 mt-0.5 truncate">{movie.title}</p>
					</div>
				</div>

				<div>
					<p className={labelCls}>Nota (opcional)</p>
					<StarRating value={rating} onChange={setRating} />
					{rating != null && rating > 0 && (
						<p className="text-xs text-gray-400 mt-2">{rating}/10 estrelas</p>
					)}
				</div>

				<div className="flex gap-3">
					<button
						type="button"
						onClick={onCancel}
						disabled={isLoading}
						className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={() => onConfirm(rating && rating > 0 ? rating : undefined)}
						disabled={isLoading}
						className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
					>
						{isLoading && (
							<span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
						)}
						Confirmar
					</button>
				</div>
			</div>
		</div>
	);
}

export function Movies() {
	const [tab, setTab] = useState<Tab>("want_to_watch");
	const [showForm, setShowForm] = useState(false);
	const [watchingMovie, setWatchingMovie] = useState<Movie | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const { data: movies = [], isLoading } = useMovies();
	const createMovie = useCreateMovie();
	const updateMovie = useUpdateMovie();
	const deleteMovie = useDeleteMovie();

	const filtered = movies.filter((m) => m.status === tab);
	const wantCount = movies.filter((m) => m.status === "want_to_watch").length;
	const watchedCount = movies.filter((m) => m.status === "watched").length;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<MovieFormData>({
		resolver: zodResolver(movieSchema),
	});

	async function onSubmit(values: MovieFormData) {
		await createMovie.mutateAsync({
			title: values.title,
			description: values.description || undefined,
			genre: values.genre || undefined,
			releaseYear: values.releaseYear,
		});
		reset();
		setShowForm(false);
	}

	async function handleMarkWatched(rating?: number) {
		if (!watchingMovie) return;
		await updateMovie.mutateAsync({
			id: watchingMovie.id,
			status: "watched",
			rating: rating ?? null,
		});
		setWatchingMovie(null);
	}

	async function handleDelete() {
		if (!deletingId) return;
		await deleteMovie.mutateAsync(deletingId);
		setDeletingId(null);
	}

	return (
		<div className="p-6 max-w-6xl mx-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<div className="bg-indigo-50 rounded-xl p-2.5">
						<Film size={22} className="text-indigo-600" />
					</div>
					<div>
						<h1 className="text-xl font-bold text-gray-900">Minha Lista</h1>
						<p className="text-sm text-gray-500">
							{movies.length} filme{movies.length !== 1 ? "s" : ""} na lista
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={() => setShowForm((v) => !v)}
					className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
				>
					<Plus size={16} />
					Adicionar Filme
				</button>
			</div>

			{/* Add form */}
			{showForm && (
				<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
					<h2 className="text-sm font-bold text-gray-900 mb-5">Novo Filme</h2>
					<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="sm:col-span-2">
								<label htmlFor="movie-title" className={labelCls}>
									Título <span className="text-rose-500">*</span>
								</label>
								<input
									id="movie-title"
									type="text"
									{...register("title")}
									maxLength={200}
									placeholder="Ex: Inception"
									className={inputCls}
								/>
								{errors.title && (
									<p className="text-rose-500 text-xs font-medium mt-1.5 ml-1 flex items-center gap-1">
										<AlertCircle className="w-3 h-3" />
										{errors.title.message}
									</p>
								)}
							</div>

							<div>
								<label htmlFor="movie-genre" className={labelCls}>
									Gênero (Opcional)
								</label>
								<input
									id="movie-genre"
									type="text"
									{...register("genre")}
									maxLength={50}
									placeholder="Ex: Ficção Científica"
									className={inputCls}
								/>
							</div>

							<div>
								<label htmlFor="movie-year" className={labelCls}>
									Ano (Opcional)
								</label>
								<input
									id="movie-year"
									type="number"
									{...register("releaseYear", {
										setValueAs: (v: string) => {
											if (v === "" || v === undefined || v === null) return undefined;
											const n = parseInt(v, 10);
											return isNaN(n) ? undefined : n;
										},
									})}
									min={1888}
									max={2100}
									placeholder="Ex: 2010"
									className={inputCls}
								/>
								{errors.releaseYear && (
									<p className="text-rose-500 text-xs font-medium mt-1.5 ml-1 flex items-center gap-1">
										<AlertCircle className="w-3 h-3" />
										{errors.releaseYear.message}
									</p>
								)}
							</div>

							<div className="sm:col-span-2">
								<label htmlFor="movie-description" className={labelCls}>
									Descrição (Opcional)
								</label>
								<textarea
									id="movie-description"
									{...register("description")}
									maxLength={1000}
									rows={2}
									placeholder="Sinopse ou observações..."
									className={`${inputCls} resize-none`}
								/>
								{errors.description && (
									<p className="text-rose-500 text-xs font-medium mt-1.5 ml-1 flex items-center gap-1">
										<AlertCircle className="w-3 h-3" />
										{errors.description.message}
									</p>
								)}
							</div>
						</div>

						{createMovie.error && (
							<div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
								<p className="text-rose-600 text-sm font-medium flex items-center gap-2">
									<AlertCircle className="w-4 h-4" />
									{(createMovie.error as Error).message}
								</p>
							</div>
						)}

						<div className="flex gap-3 pt-1">
							<button
								type="button"
								onClick={() => {
									setShowForm(false);
									reset();
								}}
								className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
							>
								Cancelar
							</button>
							<button
								type="submit"
								disabled={isSubmitting}
								className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
							>
								{isSubmitting && (
									<span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
								)}
								Adicionar
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Tabs */}
			<div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
				{(
					[
						{ key: "want_to_watch", label: "Quero ver", count: wantCount },
						{ key: "watched", label: "Assistidos", count: watchedCount },
					] as const
				).map(({ key, label, count }) => (
					<button
						key={key}
						type="button"
						onClick={() => setTab(key)}
						className={[
							"px-4 py-2 rounded-lg text-sm font-medium transition-all",
							tab === key
								? "bg-white text-gray-900 shadow-sm"
								: "text-gray-500 hover:text-gray-700",
						].join(" ")}
					>
						{label}
						<span
							className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
								tab === key
									? "bg-indigo-100 text-indigo-700"
									: "bg-gray-200 text-gray-500"
							}`}
						>
							{count}
						</span>
					</button>
				))}
			</div>

			{/* Grid */}
			{isLoading ? (
				<div className="flex items-center justify-center py-16">
					<div className="w-8 h-8 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
				</div>
			) : filtered.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<div className="bg-gray-100 rounded-2xl p-5 mb-4">
						<Film size={32} className="text-gray-400" />
					</div>
					<p className="text-gray-500 text-sm font-medium">
						{tab === "want_to_watch"
							? "Nenhum filme na lista. Adicione filmes que deseja assistir."
							: "Nenhum filme assistido ainda."}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{filtered.map((movie) => (
						<MovieCard
							key={movie.id}
							movie={movie}
							onMarkWatched={
								tab === "want_to_watch" ? setWatchingMovie : undefined
							}
							onDelete={setDeletingId}
						/>
					))}
				</div>
			)}

			{watchingMovie && (
				<WatchedDialog
					movie={watchingMovie}
					onConfirm={handleMarkWatched}
					onCancel={() => setWatchingMovie(null)}
					isLoading={updateMovie.isPending}
				/>
			)}

			<ConfirmDialog
				open={!!deletingId}
				title="Excluir filme"
				description="Tem certeza que deseja excluir este filme da sua lista?"
				confirmLabel="Excluir"
				onConfirm={handleDelete}
				onCancel={() => setDeletingId(null)}
				isLoading={deleteMovie.isPending}
			/>
		</div>
	);
}
