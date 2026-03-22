import { useState, useEffect, useCallback } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { getActiveExercises, getSessions, getDailyLog, upsertDailyLog, getWeightLog } from '../utils/api.js';
import { today, formatDate, TIME_OF_DAY_LABELS, feelingBg } from '../utils/helpers.js';
import ExerciseSessionCard from '../components/ExerciseSessionCard.jsx';
import FeelingPicker from '../components/FeelingPicker.jsx';
import WeightLogger from '../components/WeightLogger.jsx';

export default function TodayPage() {
  const [selectedDate, setSelectedDate] = useState(today());
  const [exercises, setExercises] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [dailyLog, setDailyLog] = useState(null);
  const [weightLog, setWeightLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingLog, setSavingLog] = useState(false);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [exs, sess, log, wLog] = await Promise.all([
        getActiveExercises(),
        getSessions({ date: selectedDate }),
        getDailyLog(selectedDate),
        getWeightLog(selectedDate),
      ]);
      setExercises(exs);
      setSessions(sess);
      setDailyLog(log);
      setWeightLog(wLog);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSessionUpdate = (updated) => {
    setSessions((prev) => {
      const idx = prev.findIndex(
        (s) => s.exercise_id === updated.exercise_id &&
               s.time_of_day === updated.time_of_day &&
               s.log_date === updated.log_date
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [...prev, updated];
    });
  };

  const handleFeelingSave = async (score, notes) => {
    setSavingLog(true);
    try {
      const saved = await upsertDailyLog({ log_date: selectedDate, overall_feeling: score, notes });
      setDailyLog(saved);
      setShowFeelingPicker(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingLog(false);
    }
  };

  const isToday = selectedDate === today();
  const dateObj = new Date(selectedDate + 'T00:00:00');

  const getSessionsForSlot = (exerciseId, timeOfDay) =>
    sessions.find((s) => s.exercise_id === exerciseId && s.time_of_day === timeOfDay) || null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 pt-safe-top pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">
              {isToday ? '🏃 Today' : '📅 History'}
            </h1>
            {dailyLog?.overall_feeling ? (
              <button
                onClick={() => setShowFeelingPicker(true)}
                className={`text-sm font-semibold px-3 py-1.5 rounded-full ${feelingBg(dailyLog.overall_feeling)}`}
              >
                Day: {dailyLog.overall_feeling}/10
              </button>
            ) : (
              <button
                onClick={() => setShowFeelingPicker(true)}
                className="text-sm font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Log day feeling
              </button>
            )}
          </div>

          {/* Date navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDate(format(subDays(dateObj, 1), 'yyyy-MM-dd'))}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 text-center">
              <p className="font-semibold text-gray-900 text-sm">
                {isToday ? 'Today — ' : ''}{formatDate(selectedDate)}
              </p>
            </div>
            <button
              onClick={() => setSelectedDate(format(addDays(dateObj, 1), 'yyyy-MM-dd'))}
              disabled={isToday}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Weight logger — always visible */}
            <WeightLogger
              date={selectedDate}
              weightLog={weightLog}
              onUpdate={setWeightLog}
            />

            {exercises.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">🏋️</div>
                <p className="font-medium">No exercises configured yet.</p>
                <p className="text-sm mt-1">Go to Admin to add your physio exercises.</p>
              </div>
            ) : (
              exercises.map((exercise) => (
            <div key={exercise.id} className="card">
              {/* Exercise header */}
              <div className="flex gap-3 mb-4">
                {exercise.image_path ? (
                  <img
                    src={exercise.image_path}
                    alt={exercise.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">🦵</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base leading-tight">{exercise.name}</h3>
                  {exercise.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{exercise.description}</p>
                  )}
                  <div className="flex gap-2 mt-1.5">
                    <span className="text-xs bg-primary-50 text-primary-700 font-medium px-2 py-0.5 rounded-full">
                      {exercise.default_sets} sets
                    </span>
                    <span className="text-xs bg-primary-50 text-primary-700 font-medium px-2 py-0.5 rounded-full">
                      {exercise.default_reps} reps
                    </span>
                  </div>
                </div>
              </div>

              {/* Time of day sessions */}
              <div className="space-y-2">
                {['morning', 'afternoon', 'evening'].map((timeOfDay) => (
                  <ExerciseSessionCard
                    key={timeOfDay}
                    exercise={exercise}
                    timeOfDay={timeOfDay}
                    date={selectedDate}
                    session={getSessionsForSlot(exercise.id, timeOfDay)}
                    onUpdate={handleSessionUpdate}
                  />
                ))}
              </div>

              {/* Instructions expandable */}
              {exercise.instruction && (
                <details className="mt-3">
                  <summary className="text-xs font-medium text-primary-600 cursor-pointer hover:text-primary-700 select-none">
                    View instructions
                  </summary>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed bg-primary-50 rounded-lg p-3">
                    {exercise.instruction}
                  </p>
                </details>
              )}
            </div>
          ))
            )}
          </>
        )}
      </div>

      {/* Feeling Picker Modal */}
      {showFeelingPicker && (
        <FeelingPicker
          initial={dailyLog?.overall_feeling}
          initialNotes={dailyLog?.notes}
          title="How did your day feel overall?"
          onSave={handleFeelingSave}
          onClose={() => setShowFeelingPicker(false)}
          saving={savingLog}
        />
      )}
    </div>
  );
}
