import { useState } from 'react';
import { upsertWeightLog, deleteWeightLog } from '../utils/api.js';

export default function WeightLogger({ date, weightLog, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [stones, setStones] = useState('');
  const [pounds, setPounds] = useState('');
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setStones(weightLog ? String(weightLog.stones) : '');
    setPounds(weightLog ? String(weightLog.pounds) : '');
    setEditing(true);
  };

  const handleSave = async () => {
    if (stones === '') return;
    setSaving(true);
    try {
      const saved = await upsertWeightLog({
        log_date: date,
        stones: parseInt(stones),
        pounds: parseFloat(pounds) || 0,
      });
      onUpdate(saved);
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteWeightLog(date);
      onUpdate(null);
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚖️</span>
          <span className="font-semibold text-gray-900">Weight</span>
        </div>
        {!editing && (
          weightLog ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary-700">
                {weightLog.stones}st {weightLog.pounds > 0 ? `${weightLog.pounds}lb` : ''}
              </span>
              <button
                onClick={openEdit}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Edit
              </button>
            </div>
          ) : (
            <button
              onClick={openEdit}
              className="text-sm font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Log weight
            </button>
          )
        )}
      </div>

      {editing && (
        <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Stones</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                  onClick={() => setStones((v) => String(Math.max(0, (parseInt(v) || 0) - 1)))}
                >−</button>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={stones}
                  onChange={(e) => setStones(e.target.value)}
                  placeholder="0"
                  className="input flex-1 text-center py-1.5 text-sm"
                />
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                  onClick={() => setStones((v) => String((parseInt(v) || 0) + 1))}
                >+</button>
              </div>
            </div>
            <div>
              <label className="label text-xs">Pounds (0–13)</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                  onClick={() => setPounds((v) => String(Math.max(0, (parseFloat(v) || 0) - 1)))}
                >−</button>
                <input
                  type="number"
                  min="0"
                  max="13.9"
                  step="0.1"
                  value={pounds}
                  onChange={(e) => setPounds(e.target.value)}
                  placeholder="0"
                  className="input flex-1 text-center py-1.5 text-sm"
                />
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                  onClick={() => setPounds((v) => {
                    const next = (parseFloat(v) || 0) + 1;
                    return String(next >= 14 ? 13 : next);
                  })}
                >+</button>
              </div>
            </div>
          </div>

          {stones !== '' && (
            <p className="text-center text-sm text-gray-500">
              {parseInt(stones) || 0}st {parseFloat(pounds) > 0 ? `${parseFloat(pounds)}lb` : '0lb'}
              {' '}≈ {((parseInt(stones) || 0) * 6.35 + (parseFloat(pounds) || 0) * 0.453).toFixed(1)} kg
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || stones === ''}
              className="flex-1 btn-primary py-2 text-sm"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            {weightLog && (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="btn-danger py-2 px-3 text-sm"
              >
                Remove
              </button>
            )}
            <button
              onClick={() => setEditing(false)}
              className="btn-secondary py-2 px-4 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
