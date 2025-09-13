import React, { useState } from 'react';
import { ShareIcon } from './Icons';

const ShareButton: React.FC = () => {
  const [copied, setCopied] = useState(false);
  
  // Using a fixed canonical URL ensures the Web Share API receives a valid URL,
  // preventing errors in environments where window.location.href might be invalid (e.g., iframes).
  const canonicalUrl = 'https://myherb.co.il/impactsphere';

  const handleShare = async () => {
    const shareData = {
      title: 'ImpactSphere: ESG Intelligence Platform',
      text: 'Check out this ESG intelligence platform!',
      url: canonicalUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Couldn't share", err);
      }
    } else {
      // Fallback for desktop/unsupported browsers
      navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="bg-surface border border-border text-text-secondary font-medium py-2 px-4 rounded-lg hover:bg-background flex items-center transition-colors text-sm"
      aria-label="Share this page"
    >
      <ShareIcon />
      <span className="ml-2">{copied ? 'Link Copied!' : 'Share'}</span>
    </button>
  );
};

export default ShareButton;
