import { Archive, Library, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { CalendarView } from "../components/contents/CalendarView";
import { ContentCard } from "../components/contents/ContentCard";
import { ContentForm } from "../components/contents/ContentForm";
import { ContentList } from "../components/contents/ContentList";
import { useDoneContents, useReopenContent } from "../hooks/useContents";
import type { Content } from "../types";

export function Contents() {
	const [showForm, setShowForm] = useState(false);
	const [editingContent, setEditingContent] = useState<Content | undefined>();
	const { data: doneContents = [] } = useDoneContents();
	const reopenMutation = useReopenContent();

	function handleEdit(content: Content) {
		setEditingContent(content);
		setShowForm(true);
	}

	function handleClose() {
		setShowForm(false);
		setEditingContent(undefined);
	}

	return (
		<main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
			<div className="flex items-center justify-between border-b border-gray-100 pb-4">
				<div className="flex items-center gap-3">
					<div className="bg-indigo-50 p-3 rounded-2xl">
						<Library className="w-6 h-6 text-indigo-600" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-slate-800">
							Cursos & Módulos
						</h1>
						<p className="text-sm font-medium text-slate-500">
							Gerencie sua trilha de aprendizagem
						</p>
					</div>
				</div>
				{!showForm && (
					<button
						type="button"
						onClick={() => setShowForm(true)}
						className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl px-5 py-2.5 transition-colors shadow-sm focus:ring-4 focus:ring-indigo-500/20"
					>
						<Plus className="w-4 h-4" />
						Criar Módulo
					</button>
				)}
			</div>

			{showForm && (
				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative">
					<div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
						<h2 className="text-lg font-bold text-slate-800">
							{editingContent ? "Editar Módulo" : "Novo Módulo"}
						</h2>
						<button
							type="button"
							onClick={handleClose}
							className="bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors"
							aria-label="Fechar formulário"
						>
							×
						</button>
					</div>
					<ContentForm content={editingContent} onSuccess={handleClose} />
				</div>
			)}

			<CalendarView />

			<hr className="border-gray-100" />

			<ContentList onEdit={handleEdit} />

			<section className="space-y-4">
				<div className="flex items-center gap-3 border-b border-gray-100 pb-4">
					<div className="bg-slate-50 p-3 rounded-2xl">
						<Archive className="w-6 h-6 text-slate-500" />
					</div>
					<div>
						<h2 className="text-xl font-bold text-slate-700">
							Concluídos & Arquivados
						</h2>
						<p className="text-sm font-medium text-slate-400">
							Módulos finalizados ou arquivados
						</p>
					</div>
				</div>

				{doneContents.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
						<Archive className="w-10 h-10 mb-3 opacity-40" />
						<p className="font-semibold text-slate-500">
							Nenhum conteúdo concluído ainda
						</p>
						<p className="text-sm mt-1">
							Módulos marcados como feitos ou arquivados aparecerão aqui.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{doneContents.map((content) => (
							<div key={content.id} className="flex flex-col gap-2">
								<ContentCard content={content} />
								<button
									type="button"
									onClick={() => reopenMutation.mutate(content.id)}
									disabled={reopenMutation.isPending}
									className="flex items-center justify-center gap-2 w-full py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors disabled:opacity-50"
								>
									<RotateCcw className="w-4 h-4" />
									Reabrir
								</button>
							</div>
						))}
					</div>
				)}
			</section>
		</main>
	);
}
