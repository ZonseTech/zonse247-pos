import { FC } from 'react';
import { Text, Card } from '@radix-ui/themes';

const statColorMap: Record<string, { bg: string; border: string; text: string }> = {
    sky: { bg: 'bg-sky-50 dark:bg-sky-950/30', border: 'border-sky-200 dark:border-sky-800', text: 'text-sky-600 dark:text-sky-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-600 dark:text-emerald-400' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-800', text: 'text-violet-600 dark:text-violet-400' },
};

interface StatCardProps {
    label: string;
    value: string;
    sublabel: string;
    color: string;
}

const StatCard: FC<StatCardProps> = ({ label, value, sublabel, color }) => {
    const c = statColorMap[color] || statColorMap.sky;
    return (
        <div className={`p-3 rounded-xl ${c.bg} border ${c.border}`}>
            <Text size="1" color="gray" className="block mb-1">{label}</Text>
            <Text size="4" weight="bold" className={c.text}>
                {value} <span className="text-xs font-normal">{sublabel}</span>
            </Text>
        </div>
    );
};

export default StatCard;
