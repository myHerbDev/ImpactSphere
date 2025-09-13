import React, { useState } from 'react';
import { CopyIcon } from './Icons';

interface CopyToClipboardProps {
  textToCopy: string;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="bg-surface border border-border text-text-secondary font-medium py-1 px-3 rounded-lg hover:bg-background flex items-center transition-colors text-xs"
      aria-label="Copy to clipboard"
    >
      <CopyIcon />
      <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
};

export default CopyToClipboard;
