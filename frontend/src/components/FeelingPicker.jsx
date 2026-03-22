import { useState } from 'react';
import { FEELING_LABELS, feelingBg } from '../utils/helpers.js';

export default function FeelingPicker({ initial, initialNotes, title, onSave, onClose, saving }) {
  const [score, setScore] = useState(initial || null);
  const [notes, setNotes] = useState(initialNotes || '');

  const scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg leading-tight pr-4">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Score grid */}
        <div className="grid grid-cols-5 gap-2">
          {scores.map((s) => (
            <button
              key={s}
              onClick={() => setScore(s)}
              className={`h-12 rounded-xl font-bold text-lg transition-all ${
                score === s
                  ? 'ring-2 ring-offset-1 ring-primary-500 scale-105 ' + feelingBg(s)
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {score && (
          <p className={`text-center text-sm font-medium px-3 py-1.5 rounded-full ${feelingBg(score)}`}>
            {score}/10 — {FEELING_LABELS[score]}
          </p>
        )}

        <div>
          <label className="label text-sm">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling? Any pain or discomfort?"
            rows={2}
            className="input text-sm resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onSave(score, notes)}
            disabled={saving || !score}
            className="flex-1 btn-primary"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={onClose} className="btn-secondary px-5">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
