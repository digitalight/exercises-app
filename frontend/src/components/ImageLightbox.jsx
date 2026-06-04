import { useEffect } from 'react';

export default function ImageLightbox({ src, alt, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-white font-bold text-base leading-tight pr-4">{alt}</p>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors flex-shrink-0"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Image */}
      <div
        className="flex-1 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full rounded-2xl object-contain"
          style={{ maxHeight: 'calc(100dvh - 100px)' }}
        />
      </div>

      {/* Tap anywhere to close hint */}
      <p className="text-white/40 text-xs text-center pb-6 flex-shrink-0">Tap anywhere to close</p>
    </div>
  );
}
