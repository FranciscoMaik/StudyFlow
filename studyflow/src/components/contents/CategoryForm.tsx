import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	useCreateCategory,
	useUpdateCategory,
} from "../../hooks/useCategories";
import type { Category } from "../../types";

const PALETTE = [
	"#6366f1",
	"#8b5cf6",
	"#ec4899",
	"#ef4444",
	"#f97316",
	"#eab308",
	"#22c55e",
	"#14b8a6",
	"#3b82f6",
	"#64748b",
] as const;

const schema = z.object({
	name: z
		.string()
		.min(1, "Nome é obrigatório")
		.max(50, "Nome deve ter no máximo 50 caracteres"),
	color: z.string().refine((v) => (PALETTE as readonly string[]).includes(v), {
		message: "Selecione uma cor da paleta",
	}),
});

type FormValues = z.infer<typeof schema>;

interface CategoryFormProps {
	onSuccess?: () => void;
	category?: Category;
}

export function CategoryForm({ onSuccess, category }: CategoryFormProps) {
	const isEdit = !!category;
	const createCategory = useCreateCategory();
	const updateCategory = useUpdateCategory();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: category?.name ?? "",
			color: category?.color ?? "",
		},
	});

	const selectedColor = watch("color");

	async function onSubmit(values: FormValues) {
		if (isEdit) {
			await updateCategory.mutateAsync({ id: category.id, ...values });
		} else {
			await createCategory.mutateAsync(values);
		}
		onSuccess?.();
	}

	const mutationError = isEdit ? updateCategory.error : createCategory.error;

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
			<div>
				<label
					htmlFor="category-name"
					className="block text-sm font-medium mb-1"
				>
					Nome
				</label>
				<input
					id="category-name"
					type="text"
					{...register("name")}
					className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
					placeholder="Ex: Matemática"
					maxLength={50}
				/>
				{errors.name && (
					<p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
				)}
			</div>

			<div>
				<span className="block text-sm font-medium mb-2">Cor</span>
				<div
					className="flex flex-wrap gap-2"
					role="group"
					aria-label="Paleta de cores"
				>
					{PALETTE.map((color) => (
						<button
							key={color}
							type="button"
							aria-label={color}
							aria-pressed={selectedColor === color}
							onClick={() => setValue("color", color, { shouldValidate: true })}
							className="w-8 h-8 rounded-full border-2 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
							style={{
								backgroundColor: color,
								borderColor:
									selectedColor === color ? "#1e293b" : "transparent",
								transform: selectedColor === color ? "scale(1.2)" : "scale(1)",
							}}
						/>
					))}
				</div>
				{errors.color && (
					<p className="text-red-500 text-xs mt-1">{errors.color.message}</p>
				)}
			</div>

			{mutationError && (
				<p className="text-red-500 text-sm">
					{(mutationError as Error).message}
				</p>
			)}

			<button
				type="submit"
				disabled={isSubmitting}
				className="bg-indigo-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
			>
				{isSubmitting
					? "Salvando..."
					: isEdit
						? "Salvar alterações"
						: "Criar categoria"}
			</button>
		</form>
	);
}
