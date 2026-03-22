import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';

const router = express.Router();

// GET daily log for a date
router.get('/:date', (req, res) => {
  const row = db.prepare('SELECT * FROM daily_logs WHERE log_date = ?').get(req.params.date);
  res.json(row || null);
});

// GET range of daily logs
router.get('/', (req, res) => {
  const { start, end } = req.query;
  let query = 'SELECT * FROM daily_logs';
  const params = [];

  if (start && end) {
    query += ' WHERE log_date BETWEEN ? AND ?';
    params.push(start, end);
  }

  query += ' ORDER BY log_date DESC';
  res.json(db.prepare(query).all(...params));
});

// POST upsert daily log
router.post('/', (req, res) => {
  const { log_date, overall_feeling, notes } = req.body;
  if (!log_date) return res.status(400).json({ error: 'log_date is required' });

  const existing = db.prepare('SELECT id FROM daily_logs WHERE log_date = ?').get(log_date);

  if (existing) {
    db.prepare(`
      UPDATE daily_logs
      SET overall_feeling = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      overall_feeling ? parseInt(overall_feeling) : null,
      notes || null,
      existing.id
    );
    return res.json(db.prepare('SELECT * FROM daily_logs WHERE id = ?').get(existing.id));
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO daily_logs (id, log_date, overall_feeling, notes)
    VALUES (?, ?, ?, ?)
  `).run(id, log_date, overall_feeling ? parseInt(overall_feeling) : null, notes || null);

  res.status(201).json(db.prepare('SELECT * FROM daily_logs WHERE id = ?').get(id));
});

export default router;
