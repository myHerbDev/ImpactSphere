import React, { useState, useEffect } from 'react';
import BarChart from './BarChart';
import PieChart from './PieChart';
import type { SustainabilityData, IndustryAverageData } from '../types';
import { getReportSummary } from '../services/geminiService';
import { fetchIndustryAverages } from '../services/mockApi';
import { LeafIcon, DownloadIcon, EmailIcon } from './Icons';
import PageHeader from './PageHeader';
import CopyToClipboard from './CopyToClipboard';


interface ReportingProps {
    sustainabilityData: SustainabilityData | null;
}

const KpiCard: React.FC<{ label: string; value: string; change?: number; changeType?: 'increase' | 'decrease' }> = ({ label, value, change, changeType }) => {
    const isPositive = change && changeType ? (changeType === 'increase' && change > 0) || (changeType === 'decrease' && change < 0) : null;
    const changeColor = isPositive === null ? 'text-text-secondary' : isPositive ? 'text-green-500' : 'text-red-500';
    const arrow = isPositive === null ? '' : isPositive ? '↑' : '↓';

    return (
        <div className="bg-surface p-4 rounded-lg shadow-md flex flex-col justify-between print:break-inside-avoid">
            <div>
                <p className="text-sm text-text-secondary">{label}</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
            </div>
            {change !== undefined && (
                <p className={`text-sm font-semibold ${changeColor} mt-1`}>
                    {arrow} {Math.abs(change)}% vs last quarter
                </p>
            )}
        </div>
    );
};

const Reporting: React.FC<ReportingProps> = ({ sustainabilityData }) => {
    const [summary, setSummary] = useState('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [industryAverages, setIndustryAverages] = useState<IndustryAverageData | null>(null);
    const [isLoadingAverages, setIsLoadingAverages] = useState(true);

    useEffect(() => {
        if (sustainabilityData) {
            const fetchData = async () => {
                setIsSummaryLoading(true);
                setIsLoadingAverages(true);
                
                const summaryResult = await getReportSummary(sustainabilityData);
                setSummary(summaryResult);
                setIsSummaryLoading(false);

                const averagesResult = await fetchIndustryAverages();
                setIndustryAverages(averagesResult);
                setIsLoadingAverages(false);
            };
            fetchData();
        }
    }, [sustainabilityData]);

    const handlePrint = () => {
        window.print();
    }
    
    if (!sustainabilityData) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-text-primary">No Data to Report</h2>
                <p className="text-text-secondary mt-2">Please go to the "Data Entry" page to input your sustainability metrics.</p>
            </div>
        )
    }
    
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const { 
        businessName, carbonFootprint, energyConsumption, renewableEnergyMix, wasteDiversionRate,
        waterUsage, supplyChainEmissions, employeeEngagement, sustainableProcurement 
    } = sustainabilityData;

    const kpiData = [
        { label: 'Carbon Footprint (tCO₂e)', value: carbonFootprint.toLocaleString(), change: -5, changeType: 'decrease' },
        { label: 'Energy Consumption (MWh)', value: energyConsumption.toLocaleString(), change: -12, changeType: 'decrease' },
        { label: 'Waste Diversion Rate', value: `${wasteDiversionRate}%`, change: 8, changeType: 'increase' },
        { label: 'Water Usage (m³)', value: waterUsage.toLocaleString(), change: -9, changeType: 'decrease' },
        { label: 'Sustainable Procurement', value: `${sustainableProcurement}%`, change: 15, changeType: 'increase' },
        { label: 'Employee Engagement', value: `${employeeEngagement}%`, change: 10, changeType: 'increase' },
        { label: 'Supply Chain Emissions', value: supplyChainEmissions.toLocaleString(), change: -7, changeType: 'decrease' },
        { label: 'Renewable Energy Mix', value: `${renewableEnergyMix}%`, change: 20, changeType: 'increase' },
    ] as const;

    const fossilFuelEnergy = 100 - renewableEnergyMix;

    const handleDownloadTxt = () => {
        let content = `${businessName} - Sustainability Report\n`;
        content += `=================================\n\n`;
        content += `Reporting Period: ${formatDate(sustainabilityData.timeFrameStart)} - ${formatDate(sustainabilityData.timeFrameEnd)}\n\n`;
        content += `AI-Generated Executive Summary:\n${summary}\n\n`;
        content += `Key Performance Indicators:\n`;
        kpiData.forEach(kpi => {
            content += `- ${kpi.label}: ${kpi.value}\n`;
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${businessName.replace(/\s+/g, '_')}_Report.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleShareEmail = () => {
        const subject = `Sustainability Report for ${businessName} from ImpactSphere`;
        let body = `Hello,\n\nPlease find the latest sustainability report summary for ${businessName} below.\n\n`;
        body += `Reporting Period: ${formatDate(sustainabilityData.timeFrameStart)} - ${formatDate(sustainabilityData.timeFrameEnd)}\n\n`;
        body += `Executive Summary:\n${summary}\n\n`;
        body += `This report was generated using ImpactSphere.\n`;
        
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };
    
    const ChartLoader = ({height = 300}: {height?: number}) => (
        <div style={{height: `${height}px`}} className="flex items-center justify-center text-text-secondary">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-3"></div>
            Loading Chart Data...
        </div>
    );

    return (
        <>
            <div id="print-area" className="space-y-8 animate-fade-in">
                <div className="hidden print:block pt-8 px-8">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <p className="text-3xl font-bold text-text-primary">{businessName}</p>
                            <p className="text-text-secondary text-lg mt-1">Sustainability Report</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <LeafIcon />
                            <h2 className="text-2xl font-bold text-text-secondary tracking-tight">ImpactSphere</h2>
                        </div>
                    </div>
                     <div className="text-right mt-2 text-text-secondary">
                        <p><strong>Reporting Period:</strong> {formatDate(sustainabilityData.timeFrameStart)} - {formatDate(sustainabilityData.timeFrameEnd)}</p>
                    </div>
                </div>

                <div className="px-0 print:px-8">
                    <PageHeader title={`${businessName} | Sustainability Report`} description="Visualize your impact and generate reports for stakeholders." />
                     <div className="bg-primary/10 p-3 rounded-md text-center print:hidden">
                        <p className="text-sm font-medium text-primary-dark">
                            <strong>Reporting Period:</strong> {formatDate(sustainabilityData.timeFrameStart)} - {formatDate(sustainabilityData.timeFrameEnd)}
                        </p>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-lg shadow-md print:break-inside-avoid">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-text-primary">AI-Generated Executive Summary</h3>
                        <CopyToClipboard textToCopy={summary} />
                    </div>
                    {isSummaryLoading ? (
                        <div className="space-y-2">
                            <div className="h-4 bg-background rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-background rounded w-5/6 animate-pulse"></div>
                            <div className="h-4 bg-background rounded w-3/4 animate-pulse"></div>
                        </div>
                    ) : (
                        <p className="text-text-secondary whitespace-pre-wrap">{summary}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 print:grid-cols-4 print:break-inside-avoid">
                    {kpiData.map(kpi => <KpiCard key={kpi.label} {...kpi} />)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-2 !break-after-page print:break-inside-avoid">
                   <div className="bg-surface p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Carbon Footprint by Scope (tCO₂e)</h3>
                        {isLoadingAverages || !industryAverages ? <ChartLoader /> : (
                            <BarChart data={{
                                labels: ['Scope 1 (Direct)', 'Scope 2 (Indirect)', 'Scope 3 (Supply Chain)'],
                                values: [carbonFootprint, energyConsumption * 0.4, supplyChainEmissions],
                                averageValues: [industryAverages.carbonFootprint, industryAverages.energyConsumption, industryAverages.supplyChainEmissions]
                            }} />
                        )}
                   </div>
                   <div className="bg-surface p-6 rounded-lg shadow-md flex flex-col">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Energy Consumption by Source</h3>
                        {isLoadingAverages || !industryAverages ? <ChartLoader height={340} /> : (
                            <PieChart data={{
                                labels: ['Grid (Fossil)', 'Renewables'],
                                values: [fossilFuelEnergy, renewableEnergyMix],
                            }} averageValue={industryAverages.renewableEnergyMix} />
                        )}
                   </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
                    <button 
                        onClick={handlePrint}
                        className="bg-primary text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-200"
                    >
                        Export Full Report (PDF)
                    </button>
                     <button 
                        onClick={handleDownloadTxt}
                        className="bg-surface border border-border text-text-secondary font-semibold py-2.5 px-6 rounded-lg hover:bg-background flex items-center transition-colors duration-200"
                    >
                        <DownloadIcon /> <span className="ml-2">Download .txt</span>
                    </button>
                     <button 
                        onClick={handleShareEmail}
                        className="bg-surface border border-border text-text-secondary font-semibold py-2.5 px-6 rounded-lg hover:bg-background flex items-center transition-colors duration-200"
                    >
                        <EmailIcon /> <span className="ml-2">Share via Email</span>
                    </button>
                </div>

                <div id="print-footer" className="hidden print:block">
                    <p>Generated by ImpactSphere | For more information, visit <a href="https://myHerb.co.il" className="text-primary hover:underline">myHerb.co.il</a></p>
                </div>
            </div>
        </>
    );
};

export default Reporting;