import React from 'react';

interface CardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, onClick }) => {
  return (
    <div className="bg-surface p-6 rounded-lg shadow-md transition-shadow hover:shadow-lg duration-300 flex flex-col">
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm flex-grow line-clamp-3">{description}</p>
      <button 
        onClick={onClick}
        className="text-sm text-primary font-semibold mt-4 self-start hover:underline focus:outline-none focus:ring-2 focus:ring-primary-dark rounded"
        aria-label={`Learn more about ${title}`}
      >
        Learn more &rarr;
      </button>
    </div>
  );
};

export default Card;
