import React, { useState } from 'react';
import type { SustainabilityData } from '../types';
import PageHeader from './PageHeader';

interface DataEntryProps {
    onSubmit: (data: SustainabilityData) => void;
}

// Omit fields that are handled separately or calculated
const initialFormState: Omit<SustainabilityData, 'timeFrameStart' | 'timeFrameEnd' | 'businessName'> = {
    carbonFootprint: 0,
    energyConsumption: 0,
    renewableEnergyMix: 0,
    wasteDiversionRate: 0,
    waterUsage: 0,
    supplyChainEmissions: 0,
    employeeEngagement: 0,
    sustainableProcurement: 0,
};

type PeriodType = 'Hours' | 'Days' | 'Weeks' | 'Months' | 'Years';

const InputField: React.FC<{label: string; id: keyof typeof initialFormState; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; unit: string;}> = ({ label, id, value, onChange, unit }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-primary">
            {label}
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <input
                type="number"
                name={id}
                id={id}
                value={value}
                onChange={onChange}
                className="focus:ring-primary focus:border-primary block w-full pr-12 sm:text-sm border-border rounded-md p-2.5"
                placeholder="0"
                min="0"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-text-secondary sm:text-sm">{unit}</span>
            </div>
        </div>
    </div>
);

const DataEntry: React.FC<DataEntryProps> = ({ onSubmit }) => {
    const [businessName, setBusinessName] = useState('');
    const [formData, setFormData] = useState(initialFormState);
    const [periodType, setPeriodType] = useState<PeriodType>('Days');
    const [periodQuantity, setPeriodQuantity] = useState<number>(7);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: Number(value),
        }));
    };

    const handlePeriodQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPeriodQuantity(Number(e.target.value));
    };

    const handlePeriodTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPeriodType(e.target.value as PeriodType);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const endDate = new Date();
        const startDate = new Date();

        switch(periodType) {
            case 'Hours':
                startDate.setHours(endDate.getHours() - periodQuantity);
                break;
            case 'Days':
                startDate.setDate(endDate.getDate() - periodQuantity);
                break;
            case 'Weeks':
                startDate.setDate(endDate.getDate() - periodQuantity * 7);
                break;
            case 'Months':
                startDate.setMonth(endDate.getMonth() - periodQuantity);
                break;
            case 'Years':
                startDate.setFullYear(endDate.getFullYear() - periodQuantity);
                break;
        }

        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        const fullData: SustainabilityData = {
            businessName,
            ...formData,
            timeFrameStart: formatDate(startDate),
            timeFrameEnd: formatDate(endDate),
        };
        
        onSubmit(fullData);
    };

    return (
        <div className="animate-fade-in">
            <PageHeader 
                title="Enter Sustainability Data"
                description="Input your metrics for the latest reporting period to generate an updated report."
            />
            <form onSubmit={handleSubmit} className="mt-2 bg-surface p-8 rounded-lg shadow-md">
                <fieldset className="border-b border-border pb-6 mb-6">
                    <legend className="text-lg font-semibold text-text-primary mb-4">Organization Details</legend>
                     <div>
                        <label htmlFor="businessName" className="block text-sm font-medium text-text-primary">
                            Business, Organization, or Project Name
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                name="businessName"
                                id="businessName"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                required
                                className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md p-2.5"
                                placeholder="e.g., Acme Corporation"
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset className="border-b border-border pb-6 mb-6">
                    <legend className="text-lg font-semibold text-text-primary mb-4">Reporting Time Frame</legend>
                    <p className="text-sm text-text-secondary mb-4">Select a reporting period. The end date will be today.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                             <label htmlFor="periodQuantity" className="block text-sm font-medium text-text-primary">
                                Quantity
                            </label>
                            <input
                                type="number"
                                name="periodQuantity"
                                id="periodQuantity"
                                value={periodQuantity}
                                onChange={handlePeriodQuantityChange}
                                required
                                min="1"
                                className="mt-1 focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md p-2.5"
                            />
                        </div>
                        <div>
                            <label htmlFor="periodType" className="block text-sm font-medium text-text-primary">
                                Period
                            </label>
                            <select
                                name="periodType"
                                id="periodType"
                                value={periodType}
                                onChange={handlePeriodTypeChange}
                                required
                                className="mt-1 focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md p-2.5 bg-white"
                            >
                                <option>Hours</option>
                                <option>Days</option>
                                <option>Weeks</option>
                                <option>Months</option>
                                <option>Years</option>
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend className="text-lg font-semibold text-text-primary mb-4">Key Performance Indicators</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <InputField label="Carbon Footprint" id="carbonFootprint" value={formData.carbonFootprint} onChange={handleChange} unit="tCO₂e" />
                        <InputField label="Total Energy Consumption" id="energyConsumption" value={formData.energyConsumption} onChange={handleChange} unit="MWh" />
                        <InputField label="Renewable Energy Mix" id="renewableEnergyMix" value={formData.renewableEnergyMix} onChange={handleChange} unit="%" />
                        <InputField label="Waste Diversion Rate" id="wasteDiversionRate" value={formData.wasteDiversionRate} onChange={handleChange} unit="%" />
                        <InputField label="Total Water Usage" id="waterUsage" value={formData.waterUsage} onChange={handleChange} unit="m³" />
                        <InputField label="Supply Chain Emissions" id="supplyChainEmissions" value={formData.supplyChainEmissions} onChange={handleChange} unit="tCO₂e" />
                        <InputField label="Employee Engagement Score" id="employeeEngagement" value={formData.employeeEngagement} onChange={handleChange} unit="%" />
                        <InputField label="Sustainable Procurement Rate" id="sustainableProcurement" value={formData.sustainableProcurement} onChange={handleChange} unit="%" />
                    </div>
                </fieldset>
                
                <div className="mt-8 border-t border-border pt-6">
                    <button
                        type="submit"
                        className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-200"
                    >
                        Generate Report
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DataEntry;