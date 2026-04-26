import { useState, useEffect, useCallback } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { getDailyProgress, getActiveExercises, getWeightLogs } from '../utils/api.js';
import { today, formatDate, formatDateShort, feelingBg, lastNDays } from '../utils/helpers.js';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const RANGE_OPTIONS = [
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

export default function ProgressPage() {
  const [rangeDays, setRangeDays] = useState(14);
  const [progressData, setProgressData] = useState([]);
  const [weightData, setWeightData] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { start, end } = lastNDays(rangeDays);
    try {
      const [data, exs, wLogs] = await Promise.all([
        getDailyProgress({ start, end }),
        getActiveExercises(),
        getWeightLogs({ start, end }),
      ]);
      setProgressData(data);
      setExercises(exs);
      setWeightData(wLogs);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [rangeDays]);

  useEffect(() => { loadData(); }, [loadData]);

  // Build chart data
  const chartData = (() => {
    const filtered = selectedExercise === 'all'
      ? progressData
      : progressData.map((d) => ({
          ...d,
          exercises: d.exercises.filter((e) => e.exercise_id === selectedExercise),
        })).filter((d) => d.exercises.length > 0 || d.dailyLog);

    return filtered.map((d) => {
      const avgFeeling = d.exercises.length
        ? d.exercises.reduce((acc, e) => acc + (parseFloat(e.avg_feeling) || 0), 0) / d.exercises.filter(e => e.avg_feeling).length
        : null;
      const totalSets = d.exercises.reduce((acc, e) => acc + (e.total_sets || 0), 0);

      return {
        date: formatDateShort(d.date),
        fullDate: d.date,
        timestamp: new Date(d.date + 'T00:00:00').getTime(),
        feeling: avgFeeling ? parseFloat(avgFeeling.toFixed(1)) : null,
        dailyFeeling: d.dailyLog?.overall_feeling || null,
        totalSets,
        sessionCount: d.exercises.reduce((acc, e) => acc + (e.session_count || 0), 0),
      };
    }).reverse();
  })();

  // Build weight chart data — convert stones+pounds to decimal stones for charting
  const weightChartData = weightData
    .map((w) => ({
      date: formatDateShort(w.log_date),
      fullDate: w.log_date,
      timestamp: new Date(w.log_date + 'T00:00:00').getTime(),
      weightDecimal: w.stones + (w.pounds / 14),
      label: `${w.stones}st ${w.pounds > 0 ? `${w.pounds}lb` : '0lb'}`,
    }))
    .reverse();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100 px-4 pt-4 pb-3 space-y-3">
        <h1 className="text-xl font-bold text-gray-900">📈 Progress</h1>

        {/* Range picker */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {RANGE_OPTIONS.map(({ label, days }) => (
            <button
              key={days}
              onClick={() => setRangeDays(days)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                rangeDays === days
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Exercise filter */}
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="input py-2 text-sm"
        >
          <option value="all">All exercises</option>
          {exercises.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 px-4 py-4 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : progressData.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">📊</div>
            <p className="font-medium">No data yet.</p>
            <p className="text-sm mt-1">Start logging your exercises to see progress here.</p>
          </div>
        ) : (
          <>
            {/* Feeling chart */}
            {chartData.some((d) => d.feeling || d.dailyFeeling) && (
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-4">Feeling Score Trend</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="timestamp" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={(ts) => format(new Date(ts), 'dd MMM')} tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value, name) => [value ? `${value}/10` : '—', name]}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="feeling"
                      name="Exercise feeling"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="dailyFeeling"
                      name="Daily feeling"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Sets chart */}
            {chartData.some((d) => d.totalSets > 0) && (
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-4">Sets Completed Per Day</h2>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="timestamp" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={(ts) => format(new Date(ts), 'dd MMM')} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip labelStyle={{ fontWeight: 600 }} />
                    <Line
                      type="monotone"
                      dataKey="totalSets"
                      name="Total sets"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Weight chart */}
            {weightChartData.length > 0 && (
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-4">⚖️ Weight</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weightChartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="timestamp" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={(ts) => format(new Date(ts), 'dd MMM')} tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${Math.floor(v)}st`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      formatter={(_value, _name, props) => [props.payload.label, 'Weight']}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weightDecimal"
                      name="Weight"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Day-by-day history */}
            <div className="space-y-3">
              <h2 className="font-bold text-gray-900">Daily History</h2>
              {progressData.map((day) => (
                <DayHistoryCard
                  key={day.date}
                  day={day}
                  selectedExercise={selectedExercise}
                  weightLog={weightData.find((w) => w.log_date === day.date) || null}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DayHistoryCard({ day, selectedExercise, weightLog }) {
  const [expanded, setExpanded] = useState(false);
  const exercises = selectedExercise === 'all'
    ? day.exercises
    : day.exercises.filter((e) => e.exercise_id === selectedExercise);

  const totalSets = exercises.reduce((acc, e) => acc + (e.total_sets || 0), 0);
  const avgFeeling = exercises.filter(e => e.avg_feeling).length
    ? exercises.reduce((acc, e) => acc + (parseFloat(e.avg_feeling) || 0), 0) / exercises.filter(e => e.avg_feeling).length
    : null;

  if (exercises.length === 0 && !day.dailyLog && !weightLog) return null;

  return (
    <div className="card">
      <button
        className="w-full text-left flex items-center gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">{formatDate(day.date)}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {totalSets > 0 && (
              <span className="text-xs bg-primary-50 text-primary-700 font-medium px-2 py-0.5 rounded-full">
                {totalSets} sets total
              </span>
            )}
            {exercises.length > 0 && (
              <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full">
                {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
              </span>
            )}
            {weightLog && (
              <span className="text-xs bg-purple-50 text-purple-700 font-medium px-2 py-0.5 rounded-full">
                ⚖️ {weightLog.stones}st {weightLog.pounds > 0 ? `${weightLog.pounds}lb` : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {day.dailyLog?.overall_feeling && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${feelingBg(day.dailyLog.overall_feeling)}`}>
              Day {day.dailyLog.overall_feeling}/10
            </span>
          )}
          {avgFeeling && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${feelingBg(Math.round(avgFeeling))}`}>
              Ex {parseFloat(avgFeeling.toFixed(1))}/10
            </span>
          )}
          <svg
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
          {exercises.map((ex) => (
            <div key={ex.exercise_id} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-800 text-sm">{ex.exercise_name}</p>
                {ex.avg_feeling && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${feelingBg(Math.round(ex.avg_feeling))}`}>
                    {parseFloat(ex.avg_feeling).toFixed(1)}/10
                  </span>
                )}
              </div>
              <div className="flex gap-3 mt-1.5">
                <span className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">{ex.total_sets}</span> sets
                </span>
                <span className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">{parseFloat(ex.avg_reps).toFixed(0)}</span> reps avg
                </span>
                <span className="text-xs text-gray-500">
                  {ex.times_completed?.split(',').map((t) => (
                    t === 'morning' ? '🌅' : t === 'afternoon' ? '☀️' : '🌙'
                  )).join(' ')}
                </span>
              </div>
            </div>
          ))}
          {day.dailyLog?.notes && (
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-blue-700 font-medium">Daily note:</p>
              <p className="text-sm text-blue-800 mt-0.5">{day.dailyLog.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
