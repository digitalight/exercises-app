import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer, { diskStorage } from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db from '../db/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
                allowed.test(file.mimetype);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  },
});

// GET all exercises
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM exercises ORDER BY name ASC').all();
  res.json(rows);
});

// GET active exercises only
router.get('/active', (_req, res) => {
  const rows = db.prepare('SELECT * FROM exercises WHERE active = 1 ORDER BY name ASC').all();
  res.json(rows);
});

// GET single exercise
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Exercise not found' });
  res.json(row);
});

// POST create exercise
router.post('/', upload.single('image'), (req, res) => {
  const { name, description, instruction, default_sets, default_reps } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const id = uuidv4();
  const image_path = req.file ? `/uploads/${req.file.filename}` : null;

  db.prepare(`
    INSERT INTO exercises (id, name, description, instruction, image_path, default_sets, default_reps)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, description || null, instruction || null, image_path,
         parseInt(default_sets) || 3, parseInt(default_reps) || 10);

  res.status(201).json(db.prepare('SELECT * FROM exercises WHERE id = ?').get(id));
});

// PUT update exercise
router.put('/:id', upload.single('image'), (req, res) => {
  const existing = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Exercise not found' });

  const { name, description, instruction, default_sets, default_reps, active } = req.body;
  let image_path = existing.image_path;

  if (req.file) {
    // Remove old image if exists
    if (existing.image_path) {
      const oldPath = path.join(UPLOAD_DIR, path.basename(existing.image_path));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    image_path = `/uploads/${req.file.filename}`;
  }

  db.prepare(`
    UPDATE exercises
    SET name = ?, description = ?, instruction = ?, image_path = ?,
        default_sets = ?, default_reps = ?, active = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    name || existing.name,
    description !== undefined ? description : existing.description,
    instruction !== undefined ? instruction : existing.instruction,
    image_path,
    parseInt(default_sets) || existing.default_sets,
    parseInt(default_reps) || existing.default_reps,
    active !== undefined ? (active === 'true' || active === true || active === 1 ? 1 : 0) : existing.active,
    req.params.id
  );

  res.json(db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id));
});

// DELETE exercise
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Exercise not found' });

  if (existing.image_path) {
    const imgPath = path.join(UPLOAD_DIR, path.basename(existing.image_path));
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  db.prepare('DELETE FROM exercises WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
