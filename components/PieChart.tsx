import React, { useState } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PieChartProps {
  data: {
    labels: string[];
    values: number[];
  };
  averageValue: number;
}

const COLORS = ['#e2e8f0', '#10b981']; // Gray for fossil, green for renewables

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface p-2 border border-border rounded-md shadow-lg">
        <p className="label text-text-primary">{`${payload[0].name} : ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

const PieChart: React.FC<PieChartProps> = ({ data, averageValue }) => {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.values[index],
  }));
  
  const yourRenewableValue = data.values[data.labels.indexOf('Renewables')] || 0;
  
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(null);
  }

  const onLegendEnter = (e: any) => {
    const index = chartData.findIndex(item => item.name === e.value);
    setActiveIndex(index);
  };

  const onLegendLeave = () => {
    setActiveIndex(null);
  }

  return (
    <div className="flex flex-col h-full">
      <div style={{ width: '100%', height: 260, flexGrow: 1 }}>
        <ResponsiveContainer>
          <RechartsPieChart>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="middle"
              align="right"
              layout="vertical"
              iconSize={10}
              wrapperStyle={{ right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}
              onMouseEnter={onLegendEnter}
              onMouseLeave={onLegendLeave}
              formatter={(value, entry, index) => {
                  const isActive = activeIndex === index;
                  const className = `transition-all duration-200 ${isActive ? 'text-text-primary font-bold' : 'text-text-secondary'}`;
                  return <span className={className}>{value}</span>;
              }}
            />
            <Pie
              data={chartData}
              cx="40%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
              innerRadius={60}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationDuration={800}
              animationBegin={0}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                  stroke={'#fff'}
                  strokeWidth={activeIndex === index ? 4 : 1}
                  style={{ transition: 'all 0.3s ease', outline: 'none' }}
                />
              ))}
            </Pie>
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
       <div className="text-center text-sm text-text-secondary mt-2 border-t pt-3">
        <p>Your renewable mix is <strong>{yourRenewableValue}%</strong> compared to the industry average of <strong>{averageValue}%</strong>.</p>
      </div>
    </div>
  );
};

export default PieChart;