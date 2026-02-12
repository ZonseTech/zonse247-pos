import { FunctionComponent } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export interface HealthPieChartProps {
    percentage: number;
    size?: number;
    innerRadius?: number;
    outerRadius?: number;
    label?: string;
}

const HealthPieChart: FunctionComponent<HealthPieChartProps> = ({
    percentage,
    size = 120,
    innerRadius = 40,
    outerRadius = 55,
    label = '',
}) => {
    const getColor = () => {
        if (percentage >= 75) return '#10b981';
        if (percentage >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const getTextColorClass = () => {
        if (percentage >= 75) return 'text-emerald-500';
        if (percentage >= 50) return 'text-amber-500';
        return 'text-red-500';
    };

    const data = [
        { name: 'Complete', value: percentage },
        { name: 'Incomplete', value: 100 - percentage },
    ];

    const COLORS = [getColor(), '#e5e7eb'];

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${getTextColorClass()}`}>{percentage}%</span>
                {label && <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>}
            </div>
        </div>
    );
};

export default HealthPieChart;
