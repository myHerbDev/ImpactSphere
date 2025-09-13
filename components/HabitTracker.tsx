
import React, { useState } from 'react';
import type { Habit } from '../types';
import { CheckCircleIcon, CircleIcon, SparklesIcon } from './Icons';

const initialHabits: Habit[] = [
  { id: 1, text: 'Use a reusable water bottle', completed: false },
  { id: 2, text: 'Sort recycling correctly', completed: false },
  { id: 3, text: 'Turn off lights when leaving a room', completed: false },
  { id: 4, text: 'Walk or bike for a short trip', completed: false },
  { id: 5, text: 'Eat a plant-based meal', completed: false },
];

const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);

  const toggleHabit = (id: number) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  const completedCount = habits.filter((h) => h.completed).length;
  const progressPercentage = (completedCount / habits.length) * 100;

  return (
    <div className="bg-surface p-6 rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-semibold text-tertiary flex items-center mb-4">
        <SparklesIcon />
        <span className="ml-2">Today's Eco Habits</span>
      </h2>
      <div className="space-y-4">
        {habits.map((habit) => (
          <div
            key={habit.id}
            onClick={() => toggleHabit(habit.id)}
            className={`flex items-center p-4 rounded-md cursor-pointer transition-all duration-200 ${
              habit.completed
                ? 'bg-primary/20 text-tertiary'
                : 'bg-overlay hover:bg-overlay/70'
            }`}
          >
            <div className="mr-4">
              {habit.completed ? <CheckCircleIcon /> : <CircleIcon />}
            </div>
            <span className={`${habit.completed ? 'line-through text-secondary' : 'text-tertiary'}`}>
              {habit.text}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-tertiary">Daily Progress</span>
            <span className="text-sm font-medium text-primary">{completedCount} / {habits.length}</span>
        </div>
        <div className="w-full bg-overlay rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
