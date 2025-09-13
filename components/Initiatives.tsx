import React, { useState, useEffect, useCallback } from 'react';
import { getEsgInitiatives } from '../services/geminiService';
import type { Initiative } from '../types';
import { TrophyIcon } from './Icons';
import Modal from './Modal';
import PageHeader from './PageHeader';

const DifficultyBadge: React.FC<{ difficulty: 'Low' | 'Medium' | 'High' }> = ({ difficulty }) => {
    const colorClasses = {
        Low: 'bg-green-500 text-white',
        Medium: 'bg-yellow-400 text-yellow-900',
        High: 'bg-red-500 text-white',
    };
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colorClasses[difficulty]}`}>
            {difficulty} Intensity
        </span>
    );
};

const Initiatives: React.FC = () => {
    const [initiatives, setInitiatives] = useState<Initiative[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [modalContent, setModalContent] = useState<Initiative | null>(null);

    const fetchInitiatives = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const items = await getEsgInitiatives();
            setInitiatives(items);
        } catch (err) {
            setError('Failed to fetch initiatives.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitiatives();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const handleInitiativeClick = (initiative: Initiative) => {
        setModalContent(initiative);
    };
    
    const handleCloseModal = () => {
        setModalContent(null);
    };

    return (
        <>
            <div className="space-y-6 animate-fade-in">
                <PageHeader 
                  title="ESG Initiatives" 
                  description="Adopt a new ESG initiative to drive impactful change this quarter."
                />
                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="bg-surface p-6 rounded-lg shadow-md animate-pulse">
                                <div className="flex justify-between items-start">
                                    <div className="w-2/3">
                                        <div className="h-5 bg-background rounded w-1/2 mb-3"></div>
                                        <div className="h-3 bg-background rounded w-full"></div>
                                    </div>
                                    <div className="h-6 bg-background rounded-full w-24"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : (
                    <div className="space-y-4">
                        {initiatives.map((initiative, index) => (
                            <div 
                                key={index} 
                                className="bg-surface p-6 rounded-lg shadow-md transition-shadow hover:shadow-lg duration-300 cursor-pointer"
                                onClick={() => handleInitiativeClick(initiative)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && handleInitiativeClick(initiative)}
                                aria-label={`View details for ${initiative.title}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary flex items-center">
                                            <TrophyIcon />
                                            <span className="ml-2">{initiative.title}</span>
                                        </h3>
                                        <p className="text-text-secondary mt-2 text-sm line-clamp-2">{initiative.description}</p>
                                    </div>
                                    <DifficultyBadge difficulty={initiative.difficulty} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {modalContent && (
                <Modal isOpen={!!modalContent} onClose={handleCloseModal} title={modalContent.title}>
                    <div className="space-y-4">
                        <DifficultyBadge difficulty={modalContent.difficulty} />
                        <p className="text-sm text-text-secondary whitespace-pre-wrap">{modalContent.description}</p>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default Initiatives;