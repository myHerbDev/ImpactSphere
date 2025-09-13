import React, { useState } from 'react';
import type { AssessmentAnswers, AssessmentQuestion, AssessmentCategoryName, AssessmentMaturity, AssessmentScores } from '../types';
import { getAssessmentRecommendations } from '../services/geminiService';
import PageHeader from './PageHeader';
import CopyToClipboard from './CopyToClipboard';
import AssessmentResultsChart from './AssessmentResultsChart';

const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
    // Reporting process and capability
    { text: "Map against business and regulatory requirements.", category: "Reporting process and capability" },
    { text: "Identify and fill any data gaps where estimates are used.", category: "Reporting process and capability" },
    { text: "Prepare an inventory of data sources and systems where ESG data resides.", category: "Reporting process and capability" },
    { text: "Create standardized procedures for consistent data capture.", category: "Reporting process and capability" },
    { text: "Implement digital controls for data validation.", category: "Reporting process and capability" },
    { text: "Automate reporting processes to streamline disclosures.", category: "Reporting process and capability" },
    // Strategy and value
    { text: "Develop processes to start and update a company materiality matrix.", category: "Strategy and value" },
    { text: "Evaluate risks and opportunities with partners and champions.", category: "Strategy and value" },
    { text: "Develop standardized data frameworks for consistent data collection.", category: "Strategy and value" },
    { text: "Use existing data to integrate ESG insights across business functions.", category: "Strategy and value" },
    { text: "Examine C-level priorities and ensure C-suite leaders have resources.", category: "Strategy and value" },
    { text: "Provide insights and opportunities identified by AI in ESG data sets.", category: "Strategy and value" },
    // People and culture
    { text: "Enhance ESG literacy and education for all employees.", category: "People and culture" },
    { text: "Distribute ESG data accountability across all departments.", category: "People and culture" },
    { text: "Embed ESG data contribution responsibility into roles and scorecards.", category: "People and culture" },
    { text: "Review ESG materiality matrices to inform performance metrics.", category: "People and culture" },
    { text: "Drive an ESG data culture by embedding metrics across all financial dashboards.", category: "People and culture" },
    // Technology and data
    { text: "Collaborate with IT to inventory ESG and business data sources.", category: "Technology and data" },
    { text: "Work toward digitizing business processes and equipment.", category: "Technology and data" },
    { text: "Ensure ESG data is integrated into any digital transformation.", category: "Technology and data" },
    { text: "Integrate accounting software and ERPs into ESG data sets.", category: "Technology and data" },
    { text: "Create digital controls and processes to govern ESG data.", category: "Technology and data" },
    { text: "Utilize AI to identify insights from large, diverse ESG data sets.", category: "Technology and data" },
    // ESG Data Governance
    { text: "Define and document ESG data management policies and procedures.", category: "ESG Data Governance" },
    { text: "Establish clear roles and responsibilities for ESG data ownership.", category: "ESG Data Governance" },
    { text: "Implement processes for ESG data quality assurance and validation.", category: "ESG Data Governance" },
    { text: "Integrate ESG data governance into broader corporate governance frameworks.", category: "ESG Data Governance" },
];

const CATEGORIES: AssessmentCategoryName[] = ['Reporting process and capability', 'Strategy and value', 'People and culture', 'Technology and data', 'ESG Data Governance'];

const initialAnswers: AssessmentAnswers = {
    'Reporting process and capability': Array(6).fill(0),
    'Strategy and value': Array(6).fill(0),
    'People and culture': Array(5).fill(0),
    'Technology and data': Array(6).fill(0),
    'ESG Data Governance': Array(4).fill(0),
};

const MATURITY_LEVELS: { label: string, value: AssessmentMaturity }[] = [
    { label: 'Not Started', value: 0 },
    { label: 'In Progress', value: 1 },
    { label: 'Completed', value: 2 },
];

type Results = {
    scores: AssessmentScores;
    recommendations: string;
};

const EsgAssessment: React.FC = () => {
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const [answers, setAnswers] = useState<AssessmentAnswers>(initialAnswers);
    const [results, setResults] = useState<Results | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnswerChange = (category: AssessmentCategoryName, questionIndex: number, value: AssessmentMaturity) => {
        setAnswers(prev => {
            const newCategoryAnswers = [...prev[category]];
            newCategoryAnswers[questionIndex] = value;
            return { ...prev, [category]: newCategoryAnswers };
        });
    };

    const calculateResults = async () => {
        setIsLoading(true);
        const scores: AssessmentScores = {} as AssessmentScores;
        CATEGORIES.forEach(category => {
            const categoryAnswers = answers[category];
            const maxScore = categoryAnswers.length * 2; // Max value for each question is 2
            const actualScore = categoryAnswers.reduce((sum, val) => sum + val, 0);
            scores[category] = maxScore > 0 ? (actualScore / maxScore) * 100 : 0;
        });

        const recommendations = await getAssessmentRecommendations(scores);
        setResults({ scores, recommendations });
        setIsLoading(false);
    };
    
    const restartAssessment = () => {
        setAnswers(initialAnswers);
        setCurrentCategoryIndex(0);
        setResults(null);
    }
    
    if (results) {
        return (
            <div className="space-y-8 animate-fade-in">
                <PageHeader 
                    title="Your ESG Maturity Results"
                    description="Here is a snapshot of your organization's ESG readiness and AI-powered strategic recommendations."
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-surface p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Maturity Benchmark</h3>
                        <AssessmentResultsChart scores={results.scores} />
                    </div>
                    <div className="bg-surface p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-text-primary">AI-Powered Strategy</h3>
                            <CopyToClipboard textToCopy={results.recommendations} />
                        </div>
                        {isLoading ? (
                            <div className="space-y-2 mt-4">
                                <div className="h-4 bg-background rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-background rounded w-5/6 animate-pulse"></div>
                            </div>
                        ) : (
                             <p className="text-text-secondary whitespace-pre-wrap">{results.recommendations}</p>
                        )}
                    </div>
                </div>
                 <div className="text-center pt-4">
                    <button
                        onClick={restartAssessment}
                        className="bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors duration-200"
                    >
                        Retake Assessment
                    </button>
                </div>
            </div>
        );
    }

    const currentCategory = CATEGORIES[currentCategoryIndex];
    const progress = ((currentCategoryIndex + 1) / CATEGORIES.length) * 100;

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader 
                title="ESG Maturity Journey"
                description={`Based on the "Impact checklist" from The Leader's Guide to Sustainable Business Transformation.`}
            />
            
            <div className="bg-surface p-8 rounded-lg shadow-md">
                {/* Progress Bar */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-text-primary">Step {currentCategoryIndex + 1} of {CATEGORIES.length}</span>
                        <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2.5">
                        <div
                            className="bg-gradient-to-r from-primary to-green-400 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <fieldset className="mt-8">
                    <legend className="text-xl font-semibold text-text-primary border-b border-border pb-2 mb-6 w-full">{currentCategory}</legend>
                    <div className="space-y-6">
                        {ASSESSMENT_QUESTIONS.filter(q => q.category === currentCategory).map((question, index) => (
                            <div key={index}>
                               <p className="text-text-primary mb-3">{question.text}</p>
                                <div className="flex space-x-2">
                                    {MATURITY_LEVELS.map(({label, value}) => (
                                        <label key={value} className="flex-1">
                                            <input
                                                type="radio"
                                                name={`${currentCategory}-${index}`}
                                                value={value}
                                                checked={answers[currentCategory][index] === value}
                                                onChange={() => handleAnswerChange(currentCategory, index, value)}
                                                className="sr-only peer"
                                            />
                                            <div className="text-center text-sm py-2 px-3 rounded-md cursor-pointer transition-colors duration-200 border peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary-dark bg-background border-border hover:bg-border/50">
                                                {label}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </fieldset>

                {/* Navigation */}
                <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
                    <button
                        onClick={() => setCurrentCategoryIndex(i => i - 1)}
                        disabled={currentCategoryIndex === 0}
                        className="bg-surface border border-border text-text-secondary font-semibold py-2 px-6 rounded-lg hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    {currentCategoryIndex < CATEGORIES.length - 1 ? (
                        <button
                            onClick={() => setCurrentCategoryIndex(i => i + 1)}
                            className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-dark"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={calculateResults}
                            disabled={isLoading}
                            className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-dark disabled:bg-gray-400"
                        >
                           {isLoading ? 'Analyzing...' : 'See Results'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EsgAssessment;