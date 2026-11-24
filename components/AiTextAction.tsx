import React, { useState } from 'react';

interface Props {
  label: string;
  generate: () => Promise<string>;
  onResult?: (text: string) => void;
}

export default function AiTextAction({ label, generate, onResult }: Props) {
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function run() {
    setPending(true);
    setFailed(false);
    try {
      const result = await generate();
      setText(result);
      onResult?.(result);
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return <div>
    <div aria-live="polite" aria-busy={pending}>
      {failed && <p className="text-text-secondary mb-2">AI is temporarily unavailable. Please try again.</p>}
      {text && <p className="text-text-secondary whitespace-pre-wrap break-words">{text}</p>}
    </div>
    {!text && <button type="button" disabled={pending} onClick={run}
      className="print:hidden rounded-md border border-border bg-surface px-3 py-2 text-sm font-semibold text-primary-dark hover:bg-background disabled:opacity-60">
      {pending ? 'Generating…' : label}
    </button>}
  </div>;
}
