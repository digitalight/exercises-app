import { useState } from 'react';
import { createOrUpdateSession } from '../utils/api.js';
import { TIME_OF_DAY_LABELS, feelingBg } from '../utils/helpers.js';
import FeelingPicker from './FeelingPicker.jsx';

const TIME_ICONS = { morning: '🌅', afternoon: '☀️', evening: '🌙' };

export default function ExerciseSessionCard({ exercise, timeOfDay, date, session, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sets, setSets] = useState(session?.sets_completed ?? '');
  const [reps, setReps] = useState(session?.reps_completed ?? '');
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);

  const completed = session && session.sets_completed > 0;

  const handleSave = async (feeling, notes) => {
    setSaving(true);
    try {
      const updated = await createOrUpdateSession({
        exercise_id: exercise.id,
        log_date: date,
        time_of_day: timeOfDay,
        sets_completed: parseInt(sets) || 0,
        reps_completed: parseInt(reps) || 0,
        feeling_score: feeling || session?.feeling_score || null,
        notes: notes || session?.notes || null,
      });
      onUpdate(updated);
      setShowFeelingPicker(false);
      setExpanded(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickLog = async () => {
    // Auto-fill with defaults
    const s = parseInt(sets) || exercise.default_sets;
    const r = parseInt(reps) || exercise.default_reps;
    setSets(s);
    setReps(r);
    // Show feeling picker after setting defaults
    setExpanded(true);
  };

  return (
    <div
      className={`rounded-xl border transition-all ${
        completed
          ? 'border-primary-200 bg-primary-50'
          : 'border-gray-100 bg-gray-50'
      }`}
    >
      <button
        className="w-full text-left px-3 py-2 flex items-center gap-2"
        onClick={() => {
          if (!expanded && !completed) handleQuickLog();
          else setExpanded(!expanded);
        }}
      >
        <span className="text-base">{TIME_ICONS[timeOfDay]}</span>
        <span className="flex-1 text-sm font-medium text-gray-700">
          {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
        </span>
        {completed ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-primary-700 font-semibold">
              {session.sets_completed}×{session.reps_completed}
            </span>
            {session.feeling_score && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${feelingBg(session.feeling_score)}`}>
                {session.feeling_score}/10
              </span>
            )}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-primary-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <span className="text-xs text-gray-400 font-medium">Tap to log</span>
        )}
      </button>

      {(expanded || (completed && expanded)) && (
        <div className="px-3 pb-2.5 space-y-2.5 border-t border-gray-100 pt-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 w-8 shrink-0">Sets</span>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  onClick={() => setSets((v) => Math.max(0, (parseInt(v) || 0) - 1))}
                >−</button>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  className="flex-1 text-center input py-1 text-sm"
                  placeholder={exercise.default_sets}
                />
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  onClick={() => setSets((v) => (parseInt(v) || 0) + 1)}
                >+</button>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 w-8 shrink-0">Reps</span>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  onClick={() => setReps((v) => Math.max(0, (parseInt(v) || 0) - 1))}
                >−</button>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="flex-1 text-center input py-1 text-sm"
                  placeholder={exercise.default_reps}
                />
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  onClick={() => setReps((v) => (parseInt(v) || 0) + 1)}
                >+</button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFeelingPicker(true)}
              disabled={saving || (!sets && !reps)}
              className="flex-1 btn-primary py-2 text-sm"
            >
              {saving ? 'Saving…' : session?.feeling_score ? 'Update' : 'Save & Rate'}
            </button>
            <button
              onClick={() => setExpanded(false)}
              className="btn-secondary py-2 text-sm px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showFeelingPicker && (
        <FeelingPicker
          initial={session?.feeling_score}
          initialNotes={session?.notes}
          title={`How did ${timeOfDay}'s ${exercise.name} feel?`}
          onSave={handleSave}
          onClose={() => setShowFeelingPicker(false)}
          saving={saving}
        />
      )}
    </div>
  );
}
