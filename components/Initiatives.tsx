import React, { useState, useEffect, useCallback } from 'react';
import { getEsgInitiatives } from '../services/geminiService';
import type { Initiative } from '../types';
import { TrophyIcon } from './Icons';
import Modal from './Modal';
import PageHeader from './PageHeader';

const SAMPLE_INITIATIVES: Initiative[] = [
    { title: 'Supply Chain Decarbonization Pilot', description: 'Launch a pilot program with 5-10 key suppliers to establish a baseline for their Scope 1 and 2 emissions. This initiative involves co-developing a standardized data collection framework and identifying shared opportunities for energy efficiency, providing a scalable model for broader supply chain engagement.', difficulty: 'High' },
    { title: 'Develop an ESG Data Governance Council', description: 'Establish a cross-functional council with members from Finance, IT, Sustainability, and Operations to oversee the management of all ESG data. The council\'s first task is to create a central data dictionary and map key data flows to ensure consistency and reliability for internal and external reporting.', difficulty: 'Medium' },
    { title: 'Employee Sustainability Innovation Challenge', description: 'Host a company-wide innovation challenge focused on generating practical, resource-saving ideas for daily operations. This empowers employees, fosters a culture of sustainability, and can uncover significant opportunities for cost savings and efficiency improvements with minimal capital investment.', difficulty: 'Low' },
];

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
    const [isShowingSampleData, setIsShowingSampleData] = useState(false);
    const [modalContent, setModalContent] = useState<Initiative | null>(null);

    const fetchInitiatives = useCallback(async () => {
        setIsLoading(true);
        setIsShowingSampleData(false);
        try {
            const items = await getEsgInitiatives();
            if (items && items.length > 0) {
              setInitiatives(items);
            } else {
              console.warn("API call for initiatives failed or returned no data. Falling back to sample data.");
              setInitiatives(SAMPLE_INITIATIVES);
              setIsShowingSampleData(true);
            }
        } catch (err) {
            console.error('An unexpected error occurred while fetching initiatives:', err);
            setInitiatives(SAMPLE_INITIATIVES);
            setIsShowingSampleData(true);
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
                 {isShowingSampleData && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-md" role="alert">
                        <p className="font-bold">Live Data Temporarily Unavailable</p>
                        <p>Displaying sample initiatives due to high traffic. Live content will return shortly.</p>
                    </div>
                )}
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