import React from 'react';

interface KpiCardProps {
    label: string;
    value: string;
    change?: number;
    changeType?: 'increase' | 'decrease';
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, change, changeType }) => {
    const isPositive = change && changeType ? (changeType === 'increase' && change > 0) || (changeType === 'decrease' && change < 0) : null;
    const changeColor = isPositive === null ? 'text-text-secondary' : isPositive ? 'text-green-500' : 'text-red-500';
    const arrow = isPositive === null ? '' : isPositive ? '↑' : '↓';

    return (
        <div className="bg-surface p-4 rounded-lg shadow-md flex flex-col justify-between print:break-inside-avoid h-full">
            <div>
                <p className="text-sm text-text-secondary">{label}</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
            </div>
            {change !== undefined && (
                <p className={`text-sm font-semibold ${changeColor} mt-1`}>
                    {arrow} {Math.abs(change)}% vs last quarter
                </p>
            )}
        </div>
    );
};

export default KpiCard;
