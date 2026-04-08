import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCategories } from "../../hooks/useCategories";
import { useCreateContent, useUpdateContent } from "../../hooks/useContents";
import type { Content } from "../../types";
import { Save, AlertCircle } from "lucide-react";

const schema = z.object({
	title: z
		.string()
		.min(1, "Título é obrigatório")
		.max(120, "Título deve ter no máximo 120 caracteres"),
	description: z
		.string()
		.max(500, "Descrição deve ter no máximo 500 caracteres")
		.optional(),
	estimatedHours: z
		.number({ message: "Carga horária é obrigatória" })
		.min(0.5, "Carga horária mínima é 0,5h"),
	priority: z.enum(["low", "medium", "high"], {
		message: "Prioridade é obrigatória",
	}),
	deadline: z
		.string()
		.optional()
		.refine(
			(val) => {
				if (!val) return true;
				return new Date(val) > new Date();
			},
			{ message: "O prazo deve ser uma data futura" },
		),
	categoryId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const PRIORITY_LABELS: Record<"low" | "medium" | "high", string> = {
	low: "Baixa",
	medium: "Média",
	high: "Alta",
};

interface ContentFormProps {
	onSuccess?: () => void;
	content?: Content;
}

const inputClassName = "w-full border-2 border-transparent bg-slate-100 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all";
const labelClassName = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";

export function ContentForm({ onSuccess, content }: ContentFormProps) {
	const isEdit = !!content;
	const createContent = useCreateContent();
	const updateContent = useUpdateContent();
	const { data: categories = [] } = useCategories();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			title: content?.title ?? "",
			description: content?.description ?? "",
			estimatedHours: content?.estimatedHours ?? undefined,
			priority: content?.priority ?? undefined,
			deadline: content?.deadline ?? "",
			categoryId: content?.categoryId ?? "",
		},
	});

	async function onSubmit(values: FormValues) {
		const payload = {
			title: values.title,
			description: values.description || undefined,
			estimatedHours: values.estimatedHours,
			priority: values.priority,
			deadline: values.deadline || undefined,
			categoryId: values.categoryId || undefined,
		};

		if (isEdit) {
			await updateContent.mutateAsync({ id: content.id, ...payload });
		} else {
			await createContent.mutateAsync(payload);
		}
		onSuccess?.();
	}

	const mutationError = isEdit ? updateContent.error : createContent.error;

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-1">
			{/* Title */}
			<div>
				<label htmlFor="content-title" className={labelClassName}>
					Título <span className="text-rose-500">*</span>
				</label>
				<input
					id="content-title"
					type="text"
					{...register("title")}
					maxLength={120}
					placeholder="Ex: Introdução ao React"
					className={inputClassName}
				/>
				{errors.title && (
					<p className="text-rose-500 text-xs font-medium mt-1.5 ml-1 flex items-center gap-1">
						<AlertCircle className="w-3 h-3" />
						{errors.title.message}
					</p>
				)}
			</div>

			{/* Description */}
			<div>
				<label htmlFor="content-description" className={labelClassName}>
					Descrição (Opcional)
				</label>
				<textarea
					id="content-description"
					{...register("description")}
					maxLength={500}
					rows={3}
					placeholder="Sobre o que é este conteúdo?"
					className={`${inputClassName} resize-none`}
				/>
				{errors.description && (
					<p className="text-rose-500 text-xs font-medium mt-1.5 ml-1 flex items-center gap-1">
						<AlertCircle className="w-3 h-3" />
						{errors.description.message}
					</p>
				)}
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
				{/* Estimated Hours */}
				<div>
					<label htmlFor="content-hours" className={labelClassName}>
						Duração (h) <span className="text-rose-500">*</span>
					</label>
					<input
						id="content-hours"
						type="number"
						step="0.5"
						min="0.5"
						{...register("estimatedHours", { valueAsNumber: true })}
						placeholder="Ex: 5"
						className={inputClassName}
					/>
					{errors.estimatedHours && (
						<p className="text-rose-500 text-xs font-medium mt-1.5 ml-1 flex items-center gap-1">
							<AlertCircle className="w-3 h-3" />
							{errors.estimatedHours.message}
						</p>
					)}
				</div>

				{/* Priority */}
				<div>
					<label htmlFor="content-priority" className={labelClassName}>
						Prioridade <span className="text-rose-500">*</span>
					</label>
					<div className="relative">
						<select
							id="content-priority"
							{...register("priority")}
							className={`${inputClassName} appearance-none pr-10`}
						>
							<option value="">Selecione...</option>
							{(["low", "medium", "high"] as const).map((p) => (
								<option key={p} value={p}>
									{PRIORITY_LABELS[p]}
								</option>
							))}
						</select>
						<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
							<svg aria-hidden="true" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
						</div>
					</div>
					{errors.priority && (
						<p className="text-rose-500 text-xs font-medium mt-1.5 ml-1 flex items-center gap-1">
							<AlertCircle className="w-3 h-3" />
							{errors.priority.message}
						</p>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
				{/* Deadline */}
				<div>
					<label htmlFor="content-deadline" className={labelClassName}>
						Data Limite (Opcional)
					</label>
					<input
						id="content-deadline"
						type="date"
						{...register("deadline")}
						className={inputClassName}
					/>
					{errors.deadline && (
						<p className="text-rose-500 text-xs font-medium mt-1.5 ml-1 flex items-center gap-1">
							<AlertCircle className="w-3 h-3" />
							{errors.deadline.message}
						</p>
					)}
				</div>

				{/* Category */}
				<div>
					<label htmlFor="content-category" className={labelClassName}>
						Categoria (Opcional)
					</label>
					<div className="relative">
						<select
							id="content-category"
							{...register("categoryId")}
							className={`${inputClassName} appearance-none pr-10`}
						>
							<option value="">Sem categoria</option>
							{categories.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.name}
								</option>
							))}
						</select>
						<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
							<svg aria-hidden="true" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
						</div>
					</div>
					{errors.categoryId && (
						<p className="text-rose-500 text-xs font-medium mt-1.5 ml-1 flex items-center gap-1">
							<AlertCircle className="w-3 h-3" />
							{errors.categoryId.message}
						</p>
					)}
				</div>
			</div>

			{mutationError && (
				<div className="bg-rose-50 border border-rose-100 rounded-xl p-3 mt-2">
					<p className="text-rose-600 text-sm font-medium flex items-center gap-2">
						<AlertCircle className="w-4 h-4" />
						{(mutationError as Error).message}
					</p>
				</div>
			)}

			<div className="mt-4 pt-4 border-t border-slate-100">
				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl px-6 py-3 text-sm font-bold shadow hover:bg-indigo-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all focus:ring-4 focus:ring-indigo-500/20"
				>
					{isSubmitting ? (
						<span className="flex items-center gap-2">
							<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							Salvando...
						</span>
					) : (
						<>
							<Save className="w-4 h-4" />
							{isEdit ? "Salvar Alterações" : "Criar Módulo"}
						</>
					)}
				</button>
			</div>
		</form>
	);
}
