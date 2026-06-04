import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getExercises, deleteExercise, updateExercise } from '../utils/api.js';
import ImageLightbox from '../components/ImageLightbox.jsx';

export default function AdminPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getExercises();
      setExercises(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This will also remove all logged sessions for this exercise.`)) return;
    setDeleting(id);
    try {
      await deleteExercise(id);
      setExercises((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      alert('Failed to delete exercise.');
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (exercise) => {
    const fd = new FormData();
    fd.append('name', exercise.name);
    fd.append('active', exercise.active ? 'false' : 'true');
    try {
      const updated = await updateExercise(exercise.id, fd);
      setExercises((prev) => prev.map((e) => e.id === updated.id ? updated : e));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm">
        <div className="h-0.5 bg-primary-600" />
        <div className="px-4 pt-3 pb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest">Settings</p>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">Exercises</h1>
          </div>
          <Link to="/admin/exercises/new" className="btn-primary py-2 px-4 text-sm">
            + Add Exercise
          </Link>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🏋️</div>
            <p className="font-medium">No exercises yet.</p>
            <p className="text-sm mt-1">Tap "Add Exercise" to get started.</p>
          </div>
        ) : (
          exercises.map((exercise) => (
            <div
              key={exercise.id}
              className={`card flex gap-3 ${!exercise.active ? 'opacity-60' : ''}`}
            >
              {exercise.image_path ? (
                <button
                  type="button"
                  onClick={() => setLightboxImage({ src: exercise.image_path, alt: exercise.name })}
                  className="relative flex-shrink-0 rounded-xl overflow-hidden group"
                  aria-label={`View ${exercise.name} diagram`}
                >
                  <img
                    src={exercise.image_path}
                    alt={exercise.name}
                    className="w-16 h-16 object-cover bg-gray-100"
                  />
                  <div className="absolute inset-0 bg-black/0 group-active:bg-black/20 transition-colors" />
                  <div className="absolute bottom-1 right-1">
                    <span className="bg-black/60 rounded p-0.5 flex">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </span>
                  </div>
                </button>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 text-2xl">
                  🦵
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 leading-tight">{exercise.name}</p>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      <span className="text-xs bg-primary-50 text-primary-700 font-medium px-2 py-0.5 rounded-full">
                        {exercise.default_sets} sets × {exercise.default_reps} reps
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        exercise.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {exercise.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {exercise.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{exercise.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Link
                    to={`/admin/exercises/${exercise.id}`}
                    className="flex-1 text-center text-xs font-semibold py-2 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleToggleActive(exercise)}
                    className="flex-1 text-xs font-semibold py-2 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    {exercise.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(exercise.id, exercise.name)}
                    disabled={deleting === exercise.id}
                    className="text-xs font-semibold py-2 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleting === exercise.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}
