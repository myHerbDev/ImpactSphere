
import React, { useState } from 'react';
import type { Goal } from '../types';
import { CheckCircleIcon, CircleIcon, SparklesIcon } from './Icons';

const initialGoals: Goal[] = [
  { id: 1, text: 'Reduce office paper consumption by 10%', completed: true },
  { id: 2, text: 'Complete energy audit of main campus building', completed: true },
  { id: 3, text: 'Launch employee sustainability training program', completed: false },
  { id: 4, text: 'Switch to 100% renewable energy supplier', completed: false },
  { id: 5, text: 'Establish a baseline for supply chain emissions', completed: false },
];

const GoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);

  const toggleGoal = (id: number) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const completedCount = goals.filter((h) => h.completed).length;
  const progressPercentage = (completedCount / goals.length) * 100;

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md h-full">
      <h2 className="text-xl font-semibold text-text-primary flex items-center mb-4">
        <SparklesIcon />
        <span className="ml-2">Key Performance Goals</span>
      </h2>
      <div className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={`flex items-center p-4 rounded-md cursor-pointer transition-all duration-200 ${
              goal.completed
                ? 'bg-primary/10 text-text-primary'
                : 'bg-background hover:bg-border/50'
            }`}
          >
            <div className="mr-4">
              {goal.completed ? <CheckCircleIcon /> : <CircleIcon />}
            </div>
            <span className={`${goal.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
              {goal.text}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-text-primary">Quarterly Progress</span>
            <span className="text-sm font-medium text-primary">{completedCount} / {goals.length}</span>
        </div>
        <div className="w-full bg-background rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-primary to-green-400 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default GoalTracker;
