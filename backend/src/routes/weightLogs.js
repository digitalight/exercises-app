import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';

const router = express.Router();

// GET weight log for a specific date
router.get('/:date', (req, res) => {
  const row = db.prepare('SELECT * FROM weight_logs WHERE log_date = ?').get(req.params.date);
  res.json(row || null);
});

// GET range of weight logs
router.get('/', (req, res) => {
  const { start, end } = req.query;
  let query = 'SELECT * FROM weight_logs';
  const params = [];

  if (start && end) {
    query += ' WHERE log_date BETWEEN ? AND ?';
    params.push(start, end);
  }

  query += ' ORDER BY log_date DESC';
  res.json(db.prepare(query).all(...params));
});

// POST upsert weight log
router.post('/', (req, res) => {
  const { log_date, stones, pounds } = req.body;
  if (!log_date) return res.status(400).json({ error: 'log_date is required' });
  if (stones === undefined || stones === null || stones === '') {
    return res.status(400).json({ error: 'stones is required' });
  }

  const stonesVal = parseInt(stones);
  const poundsVal = parseFloat(pounds) || 0;

  if (isNaN(stonesVal) || stonesVal < 0) {
    return res.status(400).json({ error: 'Invalid stones value' });
  }
  if (poundsVal < 0 || poundsVal >= 14) {
    return res.status(400).json({ error: 'Pounds must be between 0 and 13.9' });
  }

  const existing = db.prepare('SELECT id FROM weight_logs WHERE log_date = ?').get(log_date);

  if (existing) {
    db.prepare(`
      UPDATE weight_logs
      SET stones = ?, pounds = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(stonesVal, poundsVal, existing.id);
    return res.json(db.prepare('SELECT * FROM weight_logs WHERE id = ?').get(existing.id));
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO weight_logs (id, log_date, stones, pounds)
    VALUES (?, ?, ?, ?)
  `).run(id, log_date, stonesVal, poundsVal);

  res.status(201).json(db.prepare('SELECT * FROM weight_logs WHERE id = ?').get(id));
});

// DELETE weight log for a date
router.delete('/:date', (req, res) => {
  const existing = db.prepare('SELECT id FROM weight_logs WHERE log_date = ?').get(req.params.date);
  if (!existing) return res.status(404).json({ error: 'Weight log not found' });
  db.prepare('DELETE FROM weight_logs WHERE log_date = ?').run(req.params.date);
  res.json({ success: true });
});

export default router;
