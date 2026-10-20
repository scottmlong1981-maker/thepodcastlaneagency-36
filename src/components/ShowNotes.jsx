import { useState } from 'react';

/**
 * Show notes with an expand control once they run long.
 * Shared by the Episodes library and the homepage episode rows so both
 * behave identically.
 */
export default function ShowNotes({ text, id, clampAt = 600 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;

  const long = text.length > clampAt;

  return (
    <>
      <div
        id={`notes-${id}`}
        className={`shownotes${long && !expanded ? ' shownotes--clamped' : ''}`}
      >
        {text}
      </div>
      {long && (
        <button
          type="button"
          className="disclosure"
          aria-expanded={expanded}
          aria-controls={`notes-${id}`}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Show less' : 'Read the full show notes'}
        </button>
      )}
    </>
  );
}
