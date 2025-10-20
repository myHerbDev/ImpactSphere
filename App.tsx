import React, { useState } from 'react';
import Header from './components/Header';
import ImpactDashboard from './components/ImpactDashboard';
import ResourceHub from './components/ResourceHub';
import Initiatives from './components/Initiatives';
import Reporting from './components/Reporting';
import DataEntry from './components/DataEntry';
import EsgAssessment from './components/EsgAssessment';
import type { SustainabilityData } from './types';
import { NAV_ITEMS } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('Impact Dashboard');
  const [sustainabilityData, setSustainabilityData] = useState<SustainabilityData | null>(null);

  const handleDataSubmit = (data: SustainabilityData) => {
    setSustainabilityData(data);
    setActiveView('Reporting');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'Impact Dashboard':
        return <ImpactDashboard sustainabilityData={sustainabilityData} />;
      case 'ESG Playbook':
        return <ResourceHub />;
      case 'Initiatives':
        return <Initiatives />;
      case 'ESG Assessment':
        return <EsgAssessment />;
      case 'Data Entry':
        return <DataEntry onSubmit={handleDataSubmit} />;
      case 'Reporting':
        return <Reporting sustainabilityData={sustainabilityData} />;
      default:
        return <ImpactDashboard sustainabilityData={sustainabilityData} />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header 
        navItems={NAV_ITEMS}
        activeView={activeView} 
        setActiveView={setActiveView} 
      />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {renderContent()}
      </main>
      <footer className="text-center p-4 mt-8 text-xs text-gray-500 print:hidden">
        <p>&copy; 2024 ImpactSphere. Made by myHerb as a part of DevSphere - Sustainable Development.</p>
      </footer>
    </div>
  );
};

export default App;
