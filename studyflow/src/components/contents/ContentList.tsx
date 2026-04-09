import { Filter, SortAsc } from "lucide-react";
import { useState } from "react";
import { useCategories } from "../../hooks/useCategories";
import {
	useArchiveContent,
	useContents,
	useMarkContentDone,
} from "../../hooks/useContents";
import type { Content } from "../../types";
import { ContentCard } from "./ContentCard";

interface ContentListProps {
	weeklyCapacityHours?: number;
	onEdit?: (content: Content) => void;
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export function ContentList({ weeklyCapacityHours, onEdit }: ContentListProps) {
	const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
	const [sortBy, setSortBy] = useState<
		"default" | "priority_asc" | "priority_desc"
	>("default");

	const { data: contents = [], isLoading: contentsLoading } = useContents();
	const { data: categories = [], isLoading: categoriesLoading } =
		useCategories();
	const archiveMutation = useArchiveContent();
	const doneMutation = useMarkContentDone();

	const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

	const filtered = (
		selectedCategoryId === "all"
			? contents
			: contents.filter((c) => c.categoryId === selectedCategoryId)
	)
		.slice()
		.sort((a, b) => {
			if (sortBy === "priority_asc")
				return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
			if (sortBy === "priority_desc")
				return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
			return 0;
		});

	const totalEstimatedHours = contents.reduce(
		(sum, c) => sum + c.estimatedHours,
		0,
	);

	const overloadHours =
		weeklyCapacityHours !== undefined &&
		totalEstimatedHours > weeklyCapacityHours
			? totalEstimatedHours - weeklyCapacityHours
			: null;

	const isLoading = contentsLoading || categoriesLoading;

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{overloadHours !== null && (
				<div
					role="alert"
					className="flex items-start gap-3 bg-rose-50 border-2 border-rose-100 text-rose-800 rounded-xl px-5 py-4 text-sm shadow-sm"
				>
					<span className="text-rose-500 text-lg mt-0.5" aria-hidden="true">
						⚠️
					</span>
					<span>
						<strong>Atenção à sobrecarga:</strong> Você tem{" "}
						<strong>{totalEstimatedHours}h</strong> estimadas de estudos na
						fila, o que ultrapassa a sua capacidade semanal em{" "}
						<strong>{overloadHours.toFixed(1)}h</strong>. Considere focar nas
						prioridades maiores!
					</span>
				</div>
			)}

			<div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
				<div className="flex-1 flex items-center gap-2">
					<Filter className="w-4 h-4 text-gray-400" />
					<select
						id="category-filter"
						value={selectedCategoryId}
						onChange={(e) => setSelectedCategoryId(e.target.value)}
						className="w-full sm:w-auto text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
					>
						<option value="all">Todas as Áreas</option>
						{categories.map((cat) => (
							<option key={cat.id} value={cat.id}>
								{cat.name}
							</option>
						))}
					</select>
				</div>

				<div className="flex-1 flex items-center sm:justify-end gap-2">
					<SortAsc className="w-4 h-4 text-gray-400" />
					<select
						id="sort-priority"
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
						className="w-full sm:w-auto text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
					>
						<option value="default">Ordem Padrão</option>
						<option value="priority_asc">Maior Prioridade ⚡</option>
						<option value="priority_desc">Menor Prioridade</option>
					</select>
				</div>
			</div>

			{filtered.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
					<div className="text-4xl mb-4">📭</div>
					{contents.length === 0 ? (
						<>
							<h3 className="text-lg font-bold text-gray-700">
								Seu catálogo está vazio
							</h3>
							<p className="text-gray-500 mt-1 max-w-sm">
								Adicione os conteúdos e matérias que você precisa estudar para
								criarmos a sua trilha.
							</p>
						</>
					) : (
						<p className="text-gray-500">
							Nenhum módulo encontrado com esse filtro.
						</p>
					)}
				</div>
			) : (
				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
					{filtered.map((content) => (
						<ContentCard
							key={content.id}
							content={content}
							category={
								content.categoryId ? categoryMap[content.categoryId] : undefined
							}
							onEdit={onEdit}
							onArchive={(id) => archiveMutation.mutate(id)}
							onDone={(id) => doneMutation.mutate(id)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
