import {
	Bar,
	BarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface HoursBarChartProps {
	data: { date: string; hours: number }[];
}

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

/**
 * Bar chart showing study hours per day of the week.
 * Requirement 11.2
 */
export function HoursBarChart({ data }: HoursBarChartProps) {
	const chartData = data.map((item, index) => ({
		day: DAY_LABELS[index] ?? item.date,
		hours: item.hours,
	}));

	return (
		<div aria-label="Gráfico de horas estudadas por dia da semana">
			<ResponsiveContainer width="100%" height={200}>
				<BarChart data={chartData}>
					<XAxis dataKey="day" />
					<YAxis />
					<Tooltip formatter={(value) => [`${value}h`, "Horas estudadas"]} />
					<Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
