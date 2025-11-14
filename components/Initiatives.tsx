import React, { useState, useEffect, useCallback } from 'react';
import { generateVideoForInitiative, getEsgInitiatives } from '../services/geminiService';
import type { Initiative } from '../types';
import { TrophyIcon, VideoIcon, KeyIcon } from './Icons';
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

type VisualizeState = {
  status: 'idle' | 'needs_key' | 'loading' | 'success' | 'error';
  message?: string;
  url?: string;
};

const Initiatives: React.FC = () => {
    const [initiatives, setInitiatives] = useState<Initiative[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isShowingSampleData, setIsShowingSampleData] = useState(false);
    const [modalContent, setModalContent] = useState<Initiative | null>(null);
    const [visualizeState, setVisualizeState] = useState<VisualizeState>({ status: 'idle' });
    const [loadingMessage, setLoadingMessage] = useState('');

    const loadingMessages = [
        "Generating video concept...",
        "This may take a few minutes...",
        "Composing scenes...",
        "Analyzing prompt...",
        "Finalizing render...",
    ];

    useEffect(() => {
        let interval: number;
        if (visualizeState.status === 'loading') {
            setLoadingMessage(loadingMessages[0]);
            interval = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [visualizeState.status]);


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
        setVisualizeState({ status: 'idle' });
    };
    
    const handleCloseModal = () => {
        setModalContent(null);
        setVisualizeState({ status: 'idle' });
    };

    const handleVisualize = async (initiative: Initiative, skipKeyCheck = false) => {
        if (!skipKeyCheck) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                setVisualizeState({ status: 'needs_key', message: "To generate a video, you need to select a project with the Gemini API enabled." });
                return;
            }
        }

        setVisualizeState({ status: 'loading', message: 'Initializing video generation...' });

        try {
            const videoUrl = await generateVideoForInitiative(initiative);
            setVisualizeState({ status: 'success', url: videoUrl });
        } catch (err) {
            let errorMessage = "An unknown error occurred during video generation. Please try again later.";
            if (err instanceof Error) {
                if (err.message.toLowerCase().includes('permission') || err.message.includes('not found') || err.message.includes('api key not valid')) {
                    errorMessage = "Failed to generate video. You may not have permission with the selected API key. Please select a different project/key and try again.";
                    setVisualizeState({ status: 'needs_key', message: errorMessage });
                    return;
                }
                 if (err.message.includes('do not have permission to generate API keys')) {
                    errorMessage = "Failed to generate API key, You do not have permission to generate API keys. Please try again.";
                    setVisualizeState({ status: 'needs_key', message: errorMessage });
                    return;
                }
                errorMessage = err.message;
            }
            setVisualizeState({ status: 'error', message: errorMessage });
        }
    };
    
    const handleSelectKeyAndVisualize = async (initiative: Initiative) => {
        try {
            await window.aistudio.openSelectKey();
            // Assume key is selected and proceed
            await handleVisualize(initiative, true);
        } catch (e) {
            console.error('API Key selection was cancelled or failed.', e);
            setVisualizeState({ status: 'idle' });
        }
    };
    
    const renderVisualizeContent = () => {
        if (!modalContent) return null;
        
        switch (visualizeState.status) {
            case 'idle':
                return (
                     <button
                        onClick={() => handleVisualize(modalContent)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-200 text-sm"
                    >
                        <VideoIcon />
                        <span>Visualize Initiative</span>
                    </button>
                );
            case 'needs_key':
                return (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md">
                        <p className="font-bold mb-2">API Key Required</p>
                        <p className="text-sm mb-3">{visualizeState.message}</p>
                        <p className="text-xs mb-3">Video generation is a billable service. For more details, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline">billing documentation</a>.</p>
                        <button
                            onClick={() => handleSelectKeyAndVisualize(modalContent)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors duration-200 text-sm"
                        >
                           <KeyIcon />
                           <span>Select API Key</span>
                        </button>
                    </div>
                );
            case 'loading':
                 return (
                    <div className="text-center p-4">
                        <div className="flex items-center justify-center space-x-2 text-text-secondary">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                            <span>{loadingMessage}</span>
                        </div>
                    </div>
                );
            case 'success':
                 return (
                    <div>
                        <h4 className="font-semibold text-text-primary mb-2">Generated Video Concept:</h4>
                        <video src={visualizeState.url} controls autoPlay muted loop className="w-full rounded-lg bg-black"></video>
                    </div>
                );
            case 'error':
                 return (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md">
                        <p className="font-bold mb-2">Generation Failed</p>
                        <p className="text-sm">{visualizeState.message}</p>
                    </div>
                );
            default:
                return null;
        }
    }


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
                                        <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    </div>
                                    <div className="h-6 bg-gray-200 rounded-full w-24"></div>
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
                    <div className="space-y-6">
                        <div>
                            <DifficultyBadge difficulty={modalContent.difficulty} />
                            <p className="text-sm text-text-secondary whitespace-pre-wrap mt-4">{modalContent.description}</p>
                        </div>
                        <div className="border-t border-border pt-4">
                           {renderVisualizeContent()}
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default Initiatives;