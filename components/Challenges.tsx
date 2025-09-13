
import React, { useState, useEffect, useCallback } from 'react';
import { getWeeklyChallenges } from '../services/geminiService';
import type { Challenge } from '../types';
import { TrophyIcon } from './Icons';

const DifficultyBadge: React.FC<{ difficulty: 'Easy' | 'Medium' | 'Hard' }> = ({ difficulty }) => {
    const colorClasses = {
        Easy: 'bg-green-500/20 text-green-300',
        Medium: 'bg-yellow-500/20 text-yellow-300',
        Hard: 'bg-red-500/20 text-red-300',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses[difficulty]}`}>
            {difficulty}
        </span>
    );
};

const Challenges: React.FC = () => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchChallenges = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const items = await getWeeklyChallenges();
            setChallenges(items);
        } catch (err) {
            setError('Failed to fetch challenges.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChallenges();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-tertiary">Weekly Challenges</h1>
                <p className="text-secondary mt-1">Push your limits and earn bragging rights.</p>
            </div>
            {isLoading ? (
                 <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="bg-surface p-6 rounded-lg shadow-lg animate-pulse">
                            <div className="flex justify-between items-start">
                                <div className="w-2/3">
                                    <div className="h-5 bg-overlay rounded w-1/2 mb-3"></div>
                                    <div className="h-3 bg-overlay rounded w-full"></div>
                                </div>
                                <div className="h-6 bg-overlay rounded-full w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <p className="text-red-400 text-center">{error}</p>
            ) : (
                <div className="space-y-4">
                    {challenges.map((challenge, index) => (
                        <div key={index} className="bg-surface p-6 rounded-lg shadow-lg transition-transform hover:scale-105 duration-300">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-tertiary flex items-center">
                                        <TrophyIcon />
                                        <span className="ml-2">{challenge.title}</span>
                                    </h3>
                                    <p className="text-secondary mt-2 text-sm">{challenge.description}</p>
                                </div>
                                <DifficultyBadge difficulty={challenge.difficulty} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Challenges;
