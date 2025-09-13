import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { AssessmentScores } from '../types';

interface AssessmentResultsChartProps {
  scores: AssessmentScores;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface p-3 border border-border rounded-md shadow-lg text-sm">
        <p className="label text-text-primary font-semibold mb-1">{label}</p>
        <p style={{ color: '#10b981' }}>{`Maturity Score: ${payload[0].value.toFixed(0)} / 100`}</p>
      </div>
    );
  }
  return null;
};

const AssessmentResultsChart: React.FC<AssessmentResultsChartProps> = ({ scores }) => {
  const chartData = Object.entries(scores).map(([category, score]) => ({
    subject: category.split(' ')[0], // Use a shorter name for the axis
    fullSubject: category,
    score: score,
    fullMark: 100,
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#dee2e6" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#5f6368', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar 
                    name="Maturity" 
                    dataKey="score" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6} 
                    animationDuration={800}
                />
                <Tooltip content={<CustomTooltip />} />
            </RadarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default AssessmentResultsChart;
