import React, { useState, useEffect, useCallback } from 'react';
import { getEsgPlaybookContent } from '../services/geminiService';
import type { EsgPlaybookCategory, ResourceItem } from '../types';
import Card from './Card';
import Modal from './Modal';
import PageHeader from './PageHeader';

const categories: EsgPlaybookCategory[] = ['ESG Value Drivers', 'Overcoming Challenges', 'Data Readiness Framework', 'Industry Use Cases'];

const SAMPLE_PLAYBOOK_CONTENT: Record<EsgPlaybookCategory, ResourceItem[]> = {
  'ESG Value Drivers': [
    { title: 'Driving Cost Savings Through Sustainability', description: 'Explore how initiatives like energy efficiency retrofits and waste reduction programs can significantly lower operational costs, freeing up capital for further innovation and growth. This guide details how to identify and implement high-ROI sustainability projects.' },
    { title: 'Gaining a Competitive Advantage with ESG', description: 'Learn how a strong ESG proposition can enhance brand reputation, attract top talent, and open new market opportunities. This article covers strategies for leveraging your sustainability performance to stand out in a crowded marketplace.' },
  ],
  'Overcoming Challenges': [
    { title: 'Breaking Down ESG Data Silos', description: 'A primary hurdle in ESG transformation is data confined to disparate systems. This article provides a roadmap for integrating data across business units to create a unified, reliable ESG data foundation for decision-making.' },
    { title: 'Securing Resources for ESG Initiatives', description: 'Effectively articulating the value of ESG data is key to securing budget and buy-in. Learn how to build a compelling business case that links sustainability investments to financial performance and long-term strategic goals.' },
  ],
  'Data Readiness Framework': [
    { title: 'Stage 1: Mastering Data Gathering', description: 'The foundation of any ESG strategy is robust data. This guide covers the essentials of mapping regulatory requirements, identifying data sources, and establishing processes for consistent and accurate data collection.' },
    { title: 'Stage 3: From Insights to Action', description: 'The final stage of data readiness involves operationalizing your insights. Discover how to build real-time dashboards, implement automated processes, and empower teams to manage performance and drive continuous improvement.' },
  ],
  'Industry Use Cases': [
    { title: 'ESG in Financial Services: Managing Risk and Opportunity', description: 'Explore how financial institutions are integrating ESG data into risk modeling, loan underwriting, and investment products to both mitigate climate risk and capitalize on the growing demand for sustainable finance.' },
    { title: 'Manufacturing: Building Resilient and Efficient Supply Chains', description: 'This case study examines how manufacturers use ESG data to improve operational efficiency, manage Scope 3 emissions, and collaborate with suppliers to build more transparent and sustainable value chains.' },
  ],
};


const ResourceHub: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<EsgPlaybookCategory>('ESG Value Drivers');
  const [content, setContent] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isShowingSampleData, setIsShowingSampleData] = useState(false);
  const [modalContent, setModalContent] = useState<ResourceItem | null>(null);

  const fetchContent = useCallback(async (category: EsgPlaybookCategory) => {
    setIsLoading(true);
    setIsShowingSampleData(false);
    setContent([]);
    try {
      const items = await getEsgPlaybookContent(category);
      if (items && items.length > 0) {
        setContent(items);
      } else {
        console.warn(`API call for ${category} failed or returned no data. Falling back to sample data.`);
        setContent(SAMPLE_PLAYBOOK_CONTENT[category]);
        setIsShowingSampleData(true);
      }
    } catch (err) {
      console.error(`An unexpected error occurred while fetching ${category}:`, err);
      setContent(SAMPLE_PLAYBOOK_CONTENT[category]);
      setIsShowingSampleData(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent(activeCategory);
  }, [activeCategory, fetchContent]);
  
  const handleCardClick = (item: ResourceItem) => {
    setModalContent(item);
  };

  const handleCloseModal = () => {
    setModalContent(null);
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <PageHeader 
          title="ESG Playbook" 
          description={`Explore strategic guides and frameworks based on "The Leader's Guide to Sustainable Business Transformation".`}
        />
        <div className="flex space-x-2 border-b border-border overflow-x-auto pb-px">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 -mb-px whitespace-nowrap ${
                activeCategory === category
                  ? 'border-b-2 border-primary text-primary'
                  // eslint-disable-next-line sonarjs/no-duplicate-string
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div>
           {isShowingSampleData && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-md" role="alert">
                    <p className="font-bold">Live Data Temporarily Unavailable</p>
                    <p>Displaying sample content due to high traffic. Live insights will return shortly.</p>
                </div>
            )}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-surface p-6 rounded-lg shadow-md animate-pulse">
                  <div className="h-4 bg-background rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-background rounded w-full mb-2"></div>
                  <div className="h-3 bg-background rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.map((item, index) => (
                <Card key={index} title={item.title} description={item.description} onClick={() => handleCardClick(item)} />
              ))}
            </div>
          )}
        </div>
      </div>
      {modalContent && (
        <Modal isOpen={!!modalContent} onClose={handleCloseModal} title={modalContent.title}>
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{modalContent.description}</p>
        </Modal>
      )}
    </>
  );
};

export default ResourceHub;