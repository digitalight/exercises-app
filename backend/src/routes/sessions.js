import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';

const router = express.Router();

// GET sessions for a specific date (optionally filter by exercise)
router.get('/', (req, res) => {
  const { date, exercise_id } = req.query;
  let query = `
    SELECT s.*, e.name as exercise_name, e.default_sets, e.default_reps
    FROM sessions s
    JOIN exercises e ON s.exercise_id = e.id
    WHERE 1=1
  `;
  const params = [];

  if (date) { query += ' AND s.log_date = ?'; params.push(date); }
  if (exercise_id) { query += ' AND s.exercise_id = ?'; params.push(exercise_id); }

  query += ' ORDER BY s.log_date DESC, s.time_of_day ASC';
  res.json(db.prepare(query).all(...params));
});

// GET sessions for a date range (for progress view)
router.get('/range', (req, res) => {
  const { start, end, exercise_id } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'start and end dates required' });

  let query = `
    SELECT s.*, e.name as exercise_name
    FROM sessions s
    JOIN exercises e ON s.exercise_id = e.id
    WHERE s.log_date BETWEEN ? AND ?
  `;
  const params = [start, end];

  if (exercise_id) { query += ' AND s.exercise_id = ?'; params.push(exercise_id); }

  query += ' ORDER BY s.log_date ASC, s.time_of_day ASC';
  res.json(db.prepare(query).all(...params));
});

// GET a specific session
router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT s.*, e.name as exercise_name FROM sessions s
    JOIN exercises e ON s.exercise_id = e.id
    WHERE s.id = ?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Session not found' });
  res.json(row);
});

// POST create or upsert a session (one per exercise per time_of_day per date)
router.post('/', (req, res) => {
  const { exercise_id, log_date, time_of_day, sets_completed, reps_completed, feeling_score, notes } = req.body;

  if (!exercise_id || !log_date || !time_of_day) {
    return res.status(400).json({ error: 'exercise_id, log_date, and time_of_day are required' });
  }

  const validTimes = ['morning', 'afternoon', 'evening'];
  if (!validTimes.includes(time_of_day)) {
    return res.status(400).json({ error: 'time_of_day must be morning, afternoon, or evening' });
  }

  // Check for existing session
  const existing = db.prepare(
    'SELECT id FROM sessions WHERE exercise_id = ? AND log_date = ? AND time_of_day = ?'
  ).get(exercise_id, log_date, time_of_day);

  if (existing) {
    db.prepare(`
      UPDATE sessions
      SET sets_completed = ?, reps_completed = ?, feeling_score = ?, notes = ?
      WHERE id = ?
    `).run(
      parseInt(sets_completed) || 0,
      parseInt(reps_completed) || 0,
      feeling_score ? parseInt(feeling_score) : null,
      notes || null,
      existing.id
    );
    return res.json(db.prepare('SELECT * FROM sessions WHERE id = ?').get(existing.id));
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO sessions (id, exercise_id, log_date, time_of_day, sets_completed, reps_completed, feeling_score, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, exercise_id, log_date, time_of_day,
    parseInt(sets_completed) || 0,
    parseInt(reps_completed) || 0,
    feeling_score ? parseInt(feeling_score) : null,
    notes || null
  );

  res.status(201).json(db.prepare('SELECT * FROM sessions WHERE id = ?').get(id));
});

// PUT update session
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Session not found' });

  const { sets_completed, reps_completed, feeling_score, notes } = req.body;

  db.prepare(`
    UPDATE sessions
    SET sets_completed = ?, reps_completed = ?, feeling_score = ?, notes = ?
    WHERE id = ?
  `).run(
    parseInt(sets_completed) !== undefined ? parseInt(sets_completed) : existing.sets_completed,
    parseInt(reps_completed) !== undefined ? parseInt(reps_completed) : existing.reps_completed,
    feeling_score !== undefined ? parseInt(feeling_score) : existing.feeling_score,
    notes !== undefined ? notes : existing.notes,
    req.params.id
  );

  res.json(db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id));
});

// DELETE a session
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Session not found' });
  db.prepare('DELETE FROM sessions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
