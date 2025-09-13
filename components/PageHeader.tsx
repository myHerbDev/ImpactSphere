import React from 'react';
import ShareButton from './ShareButton';

interface PageHeaderProps {
  title: string;
  description: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div className="flex justify-between items-start mb-8 flex-col sm:flex-row sm:items-center print:hidden">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
        <p className="text-text-secondary mt-1 max-w-2xl">{description}</p>
      </div>
      <div className="mt-4 sm:mt-0">
        <ShareButton />
      </div>
    </div>
  );
};

export default PageHeader;
