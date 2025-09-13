
import React from 'react';
import HabitTracker from './HabitTracker';
import Recommendations from './Recommendations';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-tertiary">Welcome back!</h1>
        <p className="text-secondary mt-1">Ready to make a positive impact today?</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <HabitTracker />
        </div>
        <div>
          <Recommendations />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
