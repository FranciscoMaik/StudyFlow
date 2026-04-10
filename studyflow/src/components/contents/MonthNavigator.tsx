const MONTH_NAMES = [
	"Janeiro",
	"Fevereiro",
	"Março",
	"Abril",
	"Maio",
	"Junho",
	"Julho",
	"Agosto",
	"Setembro",
	"Outubro",
	"Novembro",
	"Dezembro",
];

interface MonthNavigatorProps {
	year: number;
	month: number;
	onPrev: () => void;
	onNext: () => void;
	onToday: () => void;
}

export function MonthNavigator({
	year,
	month,
	onPrev,
	onNext,
	onToday,
}: MonthNavigatorProps) {
	return (
		<div className="flex items-center justify-between gap-3 mb-4">
			<div className="flex items-center gap-1">
				<button
					type="button"
					onClick={onPrev}
					aria-label="Mês anterior"
					className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors text-lg font-medium"
				>
					‹
				</button>
				<button
					type="button"
					onClick={onNext}
					aria-label="Próximo mês"
					className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors text-lg font-medium"
				>
					›
				</button>
			</div>

			<h2 className="text-base font-semibold text-gray-800 capitalize">
				{MONTH_NAMES[month]} {year}
			</h2>

			<button
				type="button"
				onClick={onToday}
				className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors"
			>
				Hoje
			</button>
		</div>
	);
}
