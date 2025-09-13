import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BarChartProps {
  data: {
    labels: string[];
    values: number[];
    averageValues: number[];
  };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface p-3 border border-border rounded-md shadow-lg text-sm">
        <p className="label text-text-primary font-semibold mb-2">{label}</p>
        <p style={{ color: '#10b981' }}>{`Your Result: ${payload[0].value.toLocaleString()}`}</p>
        <p style={{ color: '#a7f3d0' }}>{`Industry Average: ${payload[1].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    yourValue: data.values[index],
    averageValue: data.averageValues[index],
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <RechartsBarChart
          data={chartData}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
          <XAxis dataKey="name" tick={{ fill: '#5f6368', fontSize: 12 }} />
          <YAxis tick={{ fill: '#5f6368', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}/>
          <Legend wrapperStyle={{fontSize: "12px", paddingTop: '10px'}}/>
          <Bar dataKey="yourValue" name="Your Result" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={800} />
          <Bar dataKey="averageValue" name="Industry Average" fill="#a7f3d0" radius={[4, 4, 0, 0]} animationDuration={800} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;