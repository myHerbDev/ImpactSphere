import React from 'react';

interface CardProps {
  title: string;
  description: string;
  onClick: () => void;
  category?: string;
  tags?: string[];
}

const Card: React.FC<CardProps> = ({ title, description, onClick, category, tags }) => {
  return (
    <div className="bg-surface p-6 rounded-lg shadow-md transition-shadow hover:shadow-lg duration-300 flex flex-col h-full">
      <div className="flex-grow">
          {category && (
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                {category}
            </p>
          )}
          <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
          <p className="text-text-secondary text-sm line-clamp-3">{description}</p>
      </div>
      
      <div>
        {tags && tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                  <span key={tag} className="text-xs bg-background text-text-secondary px-2 py-1 rounded-full">
                      #{tag}
                  </span>
              ))}
          </div>
        )}

        <button 
          onClick={onClick}
          className="text-sm text-primary font-semibold mt-4 self-start hover:underline focus:outline-none focus:ring-2 focus:ring-primary-dark rounded"
          aria-label={`Learn more about ${title}`}
        >
          Learn more &rarr;
        </button>
      </div>
    </div>
  );
};

export default Card;