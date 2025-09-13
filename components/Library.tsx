import React, { useState, useEffect, useCallback } from 'react';
import { getLibraryContent } from '../services/geminiService';
import type { LibraryCategory, LibraryItem } from '../types';
import Card from './Card';
// FIX: Import Modal component.
import Modal from './Modal';

const categories: LibraryCategory[] = ['Tips', 'Recipes', 'DIY Projects'];

const Library: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<LibraryCategory>('Tips');
  const [content, setContent] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // FIX: Add state to manage modal content.
  const [modalContent, setModalContent] = useState<LibraryItem | null>(null);

  const fetchContent = useCallback(async (category: LibraryCategory) => {
    setIsLoading(true);
    setError(null);
    setContent([]);
    try {
      const items = await getLibraryContent(category);
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

  // FIX: Add handlers to open and close the modal.
  const handleCardClick = (item: LibraryItem) => {
    setModalContent(item);
  };

  const handleCloseModal = () => {
    setModalContent(null);
  };

  return (
    // FIX: Wrap component in a React Fragment to include the Modal.
    <>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-tertiary">Eco Library</h1>
          <p className="text-secondary mt-1">Explore sustainable ideas, recipes, and projects.</p>
        </div>
        <div className="flex space-x-2 border-b border-overlay pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200 ${
                activeCategory === category
                  ? 'bg-surface text-primary border-b-2 border-primary'
                  : 'text-secondary hover:bg-overlay'
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
                <div key={index} className="bg-surface p-6 rounded-lg shadow-lg animate-pulse">
                  <div className="h-4 bg-overlay rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-overlay rounded w-full mb-2"></div>
                  <div className="h-3 bg-overlay rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-red-400 text-center">{error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.map((item, index) => (
                // FIX: Pass onClick handler to the Card component.
                <Card key={index} title={item.title} description={item.description} onClick={() => handleCardClick(item)} />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* FIX: Render the Modal when modalContent is not null. */}
      {modalContent && (
        <Modal isOpen={!!modalContent} onClose={handleCloseModal} title={modalContent.title}>
            <p className="text-sm text-secondary whitespace-pre-wrap">{modalContent.description}</p>
        </Modal>
      )}
    </>
  );
};

export default Library;
