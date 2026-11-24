import React from 'react';
import type { SustainabilityTrend } from '../types';

const SAMPLE_TRENDS: SustainabilityTrend[] = [
    { name: 'Global Renewable Energy Investment', value: '$1.8T', change: 12, insight: 'Investment continues to accelerate, driven by lower costs and policy support.' },
    { name: 'Average Carbon Price (Global)', value: '$32/ton', change: 8, insight: 'Carbon pricing mechanisms are expanding, but prices remain below levels needed for Paris Agreement goals.' },
    { name: 'Global EV Market Share', value: '18%', change: 25, insight: 'Rapid adoption in major markets is reshaping the automotive industry.' },
    { name: 'Corporate ESG Reporting Rate (S&P 500)', value: '96%', change: 4, insight: 'Mandatory reporting and investor pressure have made ESG disclosure standard practice.' },
    { name: 'Circular Economy Growth (Projected)', value: '$4.5T', change: 7, insight: 'Represents a significant economic opportunity in waste reduction and resource efficiency.' },
    { name: 'Global Plastic Waste Generation', value: '353M tons', change: -2, insight: 'Modest progress in reduction highlights the ongoing challenge of plastic pollution.' },
];

const TrendCard: React.FC<{ trend: SustainabilityTrend }> = ({ trend }) => {
    const isPositive = trend.change >= 0;
    const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
    const arrow = isPositive ? '▲' : '▼';

    return (
        <div className="bg-surface p-4 rounded-lg shadow-md flex flex-col justify-between">
            <div>
                <p className="text-sm text-text-secondary">{trend.name}</p>
                <div className="flex items-baseline space-x-2 mt-1">
                    <p className="text-2xl font-bold text-text-primary">{trend.value}</p>
                    <span className={`text-sm font-semibold ${changeColor}`}>
                        {arrow} {Math.abs(trend.change)}%
                    </span>
                </div>
            </div>
            <p className="text-xs text-text-secondary mt-2 pt-2 border-t border-border">{trend.insight}</p>
        </div>
    );
};

const SustainabilityTrends: React.FC = () => {
    return (
        <>
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-md" role="alert">
                    <p className="font-bold">Sample sustainability indicators</p>
                    <p>Figures shown are illustrative.</p>
                </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SAMPLE_TRENDS.map((trend, index) => (
                    <TrendCard key={index} trend={trend} />
                ))}
            </div>
        </>
    );
};

export default SustainabilityTrends;