import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import type { Category } from "../../types";

interface CategoryCardProps {
	category: Category;
	moduleCount: number;
	onEdit: (category: Category) => void;
	onDelete: (category: Category) => void;
}

export function CategoryCard({
	category,
	moduleCount,
	onEdit,
	onDelete,
}: CategoryCardProps) {
	return (
		<motion.div
			whileHover={{
				y: -4,
				boxShadow:
					"0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
			}}
			className="bg-white rounded-2xl border-2 border-gray-100 p-5 flex items-center justify-between gap-4 transition-all"
		>
			<div className="flex items-center gap-4 min-w-0">
				<span
					className="w-8 h-8 rounded-full shrink-0 border-2 border-white shadow"
					style={{ backgroundColor: category.color }}
					aria-hidden="true"
				/>
				<div className="min-w-0">
					<h3
						className="font-bold text-gray-800 truncate text-base leading-tight"
						title={category.name}
					>
						{category.name}
					</h3>
					<p className="text-xs text-gray-500 mt-0.5">
						{moduleCount === 1 ? "1 módulo" : `${moduleCount} módulos`}
					</p>
				</div>
			</div>

			<div className="flex gap-1.5 shrink-0">
				<button
					type="button"
					onClick={() => onEdit(category)}
					className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
					aria-label={`Editar categoria ${category.name}`}
				>
					<Edit className="w-4 h-4" />
				</button>
				<button
					type="button"
					onClick={() => onDelete(category)}
					className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
					aria-label={`Excluir categoria ${category.name}`}
				>
					<Trash2 className="w-4 h-4" />
				</button>
			</div>
		</motion.div>
	);
}
