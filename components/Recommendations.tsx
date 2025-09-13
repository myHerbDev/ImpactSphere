
import React, { useState, useEffect, useCallback } from 'react';
import { getDailyRecommendation } from '../services/geminiService';
import { LightbulbIcon } from './Icons';

const Recommendations: React.FC = () => {
  const [recommendation, setRecommendation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rec = await getDailyRecommendation();
      setRecommendation(rec);
    } catch (err) {
      setError('Failed to fetch recommendation.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-surface p-6 rounded-lg shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-semibold text-tertiary flex items-center mb-4">
        <LightbulbIcon />
        <span className="ml-2">Green Tip of the Day</span>
      </h2>
      <div className="flex-grow flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center space-x-2 text-secondary">
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
             <span>Fetching today's tip...</span>
          </div>
        ) : error ? (
          <p className="text-red-400 text-center">{error}</p>
        ) : (
          <p className="text-tertiary text-center italic">"{recommendation}"</p>
        )}
      </div>
      <button
        onClick={fetchRecommendation}
        disabled={isLoading}
        className="mt-6 w-full bg-primary text-base font-semibold py-2 px-4 rounded-lg hover:bg-primary/80 transition-colors duration-200 disabled:bg-overlay disabled:cursor-not-allowed"
      >
        {isLoading ? 'Loading...' : 'Get a New Tip'}
      </button>
    </div>
  );
};

export default Recommendations;
