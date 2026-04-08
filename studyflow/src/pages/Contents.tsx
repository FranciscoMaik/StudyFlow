import { useState } from "react";
import { ContentForm } from "../components/contents/ContentForm";
import { ContentList } from "../components/contents/ContentList";
import type { Content } from "../types";
import { Library, Plus } from "lucide-react";

export function Contents() {
	const [showForm, setShowForm] = useState(false);
	const [editingContent, setEditingContent] = useState<Content | undefined>();

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
						<h1 className="text-2xl font-bold text-slate-800">Cursos & Módulos</h1>
						<p className="text-sm font-medium text-slate-500">Gerencie sua trilha de aprendizagem</p>
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

			<ContentList onEdit={handleEdit} />
		</main>
	);
}
