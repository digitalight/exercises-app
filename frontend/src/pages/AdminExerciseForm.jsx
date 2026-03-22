import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getExercise, createExercise, updateExercise } from '../utils/api.js';

export default function AdminExerciseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    instruction: '',
    default_sets: 3,
    default_reps: 10,
    active: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNew) {
      getExercise(id)
        .then((data) => {
          setForm({
            name: data.name || '',
            description: data.description || '',
            instruction: data.instruction || '',
            default_sets: data.default_sets || 3,
            default_reps: data.default_reps || 10,
            active: !!data.active,
          });
          setCurrentImage(data.image_path || null);
        })
        .catch(() => setError('Failed to load exercise.'))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Exercise name is required.');
      return;
    }
    setSaving(true);
    setError('');

    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('description', form.description);
    fd.append('instruction', form.instruction);
    fd.append('default_sets', form.default_sets);
    fd.append('default_reps', form.default_reps);
    fd.append('active', form.active);
    if (imageFile) fd.append('image', imageFile);

    try {
      if (isNew) {
        await createExercise(fd);
      } else {
        await updateExercise(id, fd);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Failed to save exercise.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            {isNew ? 'New Exercise' : 'Edit Exercise'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Image upload */}
        <div>
          <label className="label">Exercise Diagram / Image</label>
          <div
            className="relative border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden bg-gray-50 cursor-pointer hover:border-primary-400 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {(imagePreview || currentImage) ? (
              <div className="relative">
                <img
                  src={imagePreview || currentImage}
                  alt="Exercise diagram"
                  className="w-full h-48 object-contain bg-gray-50"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white font-semibold text-sm">Change image</span>
                </div>
              </div>
            ) : (
              <div className="h-36 flex flex-col items-center justify-center text-gray-400 gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Tap to upload diagram</span>
                <span className="text-xs">PNG, JPG, GIF, WebP up to 10MB</span>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Name */}
        <div>
          <label className="label">Exercise Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Quad Stretch"
            className="input"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="label">Short Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="e.g. Stretches the quadriceps muscle"
            className="input"
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="label">Step-by-step Instructions</label>
          <textarea
            value={form.instruction}
            onChange={(e) => setForm({ ...form, instruction: e.target.value })}
            placeholder="1. Stand near a wall for support...&#10;2. Bend your knee and hold your ankle..."
            rows={5}
            className="input resize-none"
          />
        </div>

        {/* Sets & Reps */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Default Sets</label>
            <input
              type="number"
              min="1"
              max="20"
              value={form.default_sets}
              onChange={(e) => setForm({ ...form, default_sets: parseInt(e.target.value) || 1 })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Default Reps</label>
            <input
              type="number"
              min="1"
              max="100"
              value={form.default_reps}
              onChange={(e) => setForm({ ...form, default_reps: parseInt(e.target.value) || 1 })}
              className="input"
            />
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between card">
          <div>
            <p className="font-semibold text-gray-900">Active</p>
            <p className="text-sm text-gray-500">Show this exercise on the daily log screen</p>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, active: !form.active })}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              form.active ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                form.active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pb-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 btn-primary"
          >
            {saving ? 'Saving…' : isNew ? 'Add Exercise' : 'Save Changes'}
          </button>
          <Link to="/admin" className="btn-secondary px-5">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
