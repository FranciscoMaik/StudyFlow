interface ConfirmDialogProps {
	open: boolean;
	title: string;
	description: string;
	warning?: string;
	confirmLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
}

export function ConfirmDialog({
	open,
	title,
	description,
	warning,
	confirmLabel = "Confirmar",
	onConfirm,
	onCancel,
	isLoading = false,
}: ConfirmDialogProps) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="confirm-dialog-title"
				aria-describedby="confirm-dialog-description"
				className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
			>
				<h2
					id="confirm-dialog-title"
					className="text-base font-semibold text-gray-900"
				>
					{title}
				</h2>

				<p
					id="confirm-dialog-description"
					className="mt-2 text-sm text-gray-600"
				>
					{description}
				</p>

				{warning && (
					<p className="mt-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
						{warning}
					</p>
				)}

				<div className="mt-5 flex justify-end gap-3">
					<button
						type="button"
						onClick={onCancel}
						disabled={isLoading}
						className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isLoading}
						className="rounded-md px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 flex items-center gap-2"
					>
						{isLoading && (
							<span
								className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"
								aria-hidden="true"
							/>
						)}
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
