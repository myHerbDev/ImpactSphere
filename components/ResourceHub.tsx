import React, { useState, useEffect, useCallback } from 'react';
import { getEsgPlaybookContent } from '../services/geminiService';
import type { EsgPlaybookCategory, ResourceItem } from '../types';
import Card from './Card';
import Modal from './Modal';
import PageHeader from './PageHeader';

const categories: EsgPlaybookCategory[] = ['ESG Value Drivers', 'Overcoming Challenges', 'Data Readiness Framework', 'Industry Use Cases'];

const ResourceHub: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<EsgPlaybookCategory>('ESG Value Drivers');
  const [content, setContent] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<ResourceItem | null>(null);


  const fetchContent = useCallback(async (category: EsgPlaybookCategory) => {
    setIsLoading(true);
    setError(null);
    setContent([]);
    try {
      const items = await getEsgPlaybookContent(category);
      setContent(items);
    } catch (err) {
      setError(`Failed to fetch ${category}.`);
      console.error(err);
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
          // FIX: Used template literal for the description prop to handle the apostrophe correctly.
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
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div>
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
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
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