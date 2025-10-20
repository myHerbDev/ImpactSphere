import React from 'react';
import { AssessmentIcon, FlaskIcon, BookIcon, ReportingIcon } from './Icons';
import PageHeader from './PageHeader';
import SustainabilityTrends from './SustainabilityTrends';
import type { SustainabilityData } from '../types';
import KpiCard from './KpiCard';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-surface p-6 rounded-lg shadow-md transition-shadow hover:shadow-lg">
    <div className="flex items-center space-x-4 mb-3">
      {icon}
      <h3 className="text-xl font-bold text-text-primary">{title}</h3>
    </div>
    <p className="text-text-secondary">{children}</p>
  </div>
);

interface ImpactDashboardProps {
  sustainabilityData: SustainabilityData | null;
}

const ImpactDashboard: React.FC<ImpactDashboardProps> = ({ sustainabilityData }) => {
  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
          Advance Your 
          <span className="block bg-gradient-to-r from-primary to-green-600 text-transparent bg-clip-text">
            ESG Data Readiness
          </span>
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-text-secondary">
          ImpactSphere empowers organizations to transform ESG (Environmental, Social, and Governance) goals into measurable achievements with strategic frameworks and AI-driven insights.
        </p>
      </section>

      {/* Key Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-text-primary text-center mb-8">A Platform for Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard icon={<AssessmentIcon />} title="Assess Readiness">
            Use our ESG Readiness checklist, based on the Leader's Guide to Sustainable Business Transformation, to identify gaps and get AI-powered recommendations.
          </FeatureCard>
          <FeatureCard icon={<FlaskIcon />} title="Gain Insights">
            Leverage AI to generate executive summaries from your data and receive strategic insights to stay ahead of sustainability trends.
          </FeatureCard>
          <FeatureCard icon={<BookIcon />} title="Explore Playbook">
            Access a curated ESG Playbook with content on value drivers, overcoming challenges, and industry-specific use cases.
          </FeatureCard>
          <FeatureCard icon={<ReportingIcon />} title="Visualize Impact">
            Generate compelling reports with clear data visualizations to communicate your progress to stakeholders and investors.
          </FeatureCard>
        </div>
      </section>

      {/* Your Organization's Impact Section */}
      <section>
        <div className="border-t border-border pt-12">
            <PageHeader title="Your Organization's Impact" description="A summary of your key performance indicators based on your latest data entry." />
        </div>
        {sustainabilityData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <KpiCard label="Carbon Footprint (tCO₂e)" value={sustainabilityData.carbonFootprint.toLocaleString()} change={-5} changeType='decrease' />
                <KpiCard label="Energy Consumption (MWh)" value={sustainabilityData.energyConsumption.toLocaleString()} change={-12} changeType='decrease' />
                <KpiCard label="Renewable Energy Mix" value={`${sustainabilityData.renewableEnergyMix}%`} change={20} changeType='increase' />
                <KpiCard label="Waste Diversion Rate" value={`${sustainabilityData.wasteDiversionRate}%`} change={8} changeType='increase' />
                <KpiCard label="Water Usage (m³)" value={sustainabilityData.waterUsage.toLocaleString()} change={-9} changeType='decrease' />
                <KpiCard label="Supply Chain Emissions" value={sustainabilityData.supplyChainEmissions.toLocaleString()} change={-7} changeType='decrease' />
                <KpiCard label="Employee Engagement" value={`${sustainabilityData.employeeEngagement}%`} change={10} changeType='increase' />
                <KpiCard label="Sustainable Procurement" value={`${sustainabilityData.sustainableProcurement}%`} change={15} changeType='increase' />
            </div>
        ) : (
            <div className="bg-surface p-8 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-semibold text-text-primary">No Data Available</h3>
                <p className="text-text-secondary mt-2">Enter your sustainability data on the 'Data Entry' page to see your key metrics here.</p>
            </div>
        )}
      </section>

      {/* Global Sustainability Snapshot Section */}
      <section>
        <div className="border-t border-border pt-12">
            <PageHeader title="Global Sustainability Snapshot" description="A real-time overview of key worldwide sustainability trends and economic data." />
        </div>
        <SustainabilityTrends />
      </section>
    </div>
  );
};

export default ImpactDashboard;