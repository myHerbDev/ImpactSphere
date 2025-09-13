
import React, { useState, useEffect, useCallback } from 'react';
import { getStrategicInsight } from '../services/geminiService';
import { LightbulbIcon } from './Icons';

const StrategicInsight: React.FC = () => {
  const [insight, setInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rec = await getStrategicInsight();
      setInsight(rec);
    } catch (err) {
      setError('Failed to fetch insight.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-xl font-semibold text-text-primary flex items-center mb-4">
        <LightbulbIcon />
        <span className="ml-2">Strategic Insight</span>
      </h2>
      <div className="flex-grow flex items-center justify-center min-h-[100px]">
        {isLoading ? (
          <div className="flex items-center space-x-2 text-text-secondary">
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
             <span>Fetching insight...</span>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <p className="text-text-primary text-center">"{insight}"</p>
        )}
      </div>
      <button
        onClick={fetchInsight}
        disabled={isLoading}
        className="mt-6 w-full bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Loading...' : 'Get New Insight'}
      </button>
    </div>
  );
};

export default StrategicInsight;
