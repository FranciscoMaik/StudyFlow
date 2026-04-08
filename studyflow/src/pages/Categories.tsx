import { Plus, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryCard } from "../components/categories/CategoryCard";
import { CategoryForm } from "../components/contents/CategoryForm";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useCategories, useDeleteCategory } from "../hooks/useCategories";
import { useContents } from "../hooks/useContents";
import type { Category } from "../types";

type PageState =
	| { mode: "idle" }
	| { mode: "creating" }
	| { mode: "editing"; category: Category }
	| { mode: "deleting"; category: Category };

export function Categories() {
	const [pageState, setPageState] = useState<PageState>({ mode: "idle" });
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const { data: categories = [], isLoading } = useCategories();
	const { data: contents = [] } = useContents();
	const deleteCategory = useDeleteCategory();

	const moduleCountByCategory = useMemo(
		() =>
			contents.reduce<Record<string, number>>((acc, content) => {
				if (content.categoryId) {
					acc[content.categoryId] = (acc[content.categoryId] ?? 0) + 1;
				}
				return acc;
			}, {}),
		[contents],
	);

	function handleCloseModal() {
		setPageState({ mode: "idle" });
		setDeleteError(null);
	}

	async function handleConfirmDelete() {
		if (pageState.mode !== "deleting") return;
		setDeleteError(null);
		try {
			await deleteCategory.mutateAsync(pageState.category.id);
			handleCloseModal();
		} catch (err) {
			setDeleteError(
				err instanceof Error ? err.message : "Erro ao excluir categoria.",
			);
		}
	}

	const deletingCategory =
		pageState.mode === "deleting" ? pageState.category : null;
	const deletingModuleCount = deletingCategory
		? (moduleCountByCategory[deletingCategory.id] ?? 0)
		: 0;

	return (
		<main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
			<div className="flex items-center justify-between border-b border-gray-100 pb-4">
				<div className="flex items-center gap-3">
					<div className="bg-indigo-50 p-3 rounded-2xl">
						<Tag className="w-6 h-6 text-indigo-600" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-slate-800">Categorias</h1>
						<p className="text-sm font-medium text-slate-500">
							Organize seus módulos por categoria
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={() => setPageState({ mode: "creating" })}
					className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl px-5 py-2.5 transition-colors shadow-sm focus:ring-4 focus:ring-indigo-500/20"
				>
					<Plus className="w-4 h-4" />
					Nova categoria
				</button>
			</div>

			{isLoading && (
				<div className="flex justify-center py-16">
					<output aria-label="Carregando categorias">
						<span
							aria-hidden="true"
							className="inline-block h-8 w-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"
						/>
					</output>
				</div>
			)}

			{!isLoading && categories.length === 0 && (
				<div className="flex flex-col items-center justify-center py-20 text-center gap-3">
					<div className="bg-gray-100 p-4 rounded-2xl">
						<Tag className="w-8 h-8 text-gray-400" />
					</div>
					<p className="text-gray-500 font-medium">
						Nenhuma categoria cadastrada
					</p>
					<p className="text-sm text-gray-400">
						Crie sua primeira categoria para organizar seus módulos.
					</p>
				</div>
			)}

			{!isLoading && categories.length > 0 && (
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{categories.map((category) => (
						<CategoryCard
							key={category.id}
							category={category}
							moduleCount={moduleCountByCategory[category.id] ?? 0}
							onEdit={(cat) => setPageState({ mode: "editing", category: cat })}
							onDelete={(cat) =>
								setPageState({ mode: "deleting", category: cat })
							}
						/>
					))}
				</div>
			)}

			{/* Create / Edit modal */}
			{(pageState.mode === "creating" || pageState.mode === "editing") && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
						<div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-4">
							<h2 className="text-lg font-bold text-slate-800">
								{pageState.mode === "editing"
									? "Editar categoria"
									: "Nova categoria"}
							</h2>
							<button
								type="button"
								onClick={handleCloseModal}
								className="bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors"
								aria-label="Fechar formulário"
							>
								×
							</button>
						</div>
						<CategoryForm
							category={
								pageState.mode === "editing" ? pageState.category : undefined
							}
							onSuccess={handleCloseModal}
						/>
					</div>
				</div>
			)}

			{/* Delete confirmation dialog */}
			<ConfirmDialog
				open={pageState.mode === "deleting"}
				title="Excluir categoria"
				description={
					deleteError
						? `Tem certeza que deseja excluir a categoria "${deletingCategory?.name}"? Esta ação não pode ser desfeita.\n\nErro: ${deleteError}`
						: `Tem certeza que deseja excluir a categoria "${deletingCategory?.name}"? Esta ação não pode ser desfeita.`
				}
				warning={
					deletingModuleCount > 0
						? "Esta categoria possui módulos associados. Ao excluí-la, esses módulos perderão a associação."
						: undefined
				}
				confirmLabel="Excluir"
				onConfirm={handleConfirmDelete}
				onCancel={handleCloseModal}
				isLoading={deleteCategory.isPending}
			/>
		</main>
	);
}
