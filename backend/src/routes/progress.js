import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET progress summary: aggregate stats per exercise per day
router.get('/summary', (req, res) => {
  const { start, end, exercise_id } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'start and end required' });

  let query = `
    SELECT
      s.log_date,
      s.exercise_id,
      e.name as exercise_name,
      SUM(s.sets_completed) as total_sets,
      AVG(s.reps_completed) as avg_reps,
      AVG(s.feeling_score) as avg_feeling,
      COUNT(s.id) as session_count,
      GROUP_CONCAT(s.time_of_day) as times_completed
    FROM sessions s
    JOIN exercises e ON s.exercise_id = e.id
    WHERE s.log_date BETWEEN ? AND ?
  `;
  const params = [start, end];

  if (exercise_id) { query += ' AND s.exercise_id = ?'; params.push(exercise_id); }

  query += ' GROUP BY s.log_date, s.exercise_id ORDER BY s.log_date DESC, e.name ASC';
  res.json(db.prepare(query).all(...params));
});

// GET progress with daily logs joined
router.get('/daily', (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'start and end required' });

  const summaries = db.prepare(`
    SELECT
      s.log_date,
      s.exercise_id,
      e.name as exercise_name,
      SUM(s.sets_completed) as total_sets,
      ROUND(AVG(s.reps_completed), 1) as avg_reps,
      ROUND(AVG(s.feeling_score), 1) as avg_feeling,
      COUNT(s.id) as session_count,
      GROUP_CONCAT(s.time_of_day) as times_completed
    FROM sessions s
    JOIN exercises e ON s.exercise_id = e.id
    WHERE s.log_date BETWEEN ? AND ?
    GROUP BY s.log_date, s.exercise_id
    ORDER BY s.log_date DESC
  `).all(start, end);

  const dailyLogs = db.prepare(`
    SELECT * FROM daily_logs
    WHERE log_date BETWEEN ? AND ?
    ORDER BY log_date DESC
  `).all(start, end);

  // Group by date
  const byDate = {};
  for (const row of summaries) {
    if (!byDate[row.log_date]) {
      byDate[row.log_date] = { date: row.log_date, exercises: [], dailyLog: null };
    }
    byDate[row.log_date].exercises.push(row);
  }
  for (const log of dailyLogs) {
    if (!byDate[log.log_date]) {
      byDate[log.log_date] = { date: log.log_date, exercises: [], dailyLog: log };
    } else {
      byDate[log.log_date].dailyLog = log;
    }
  }

  res.json(Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date)));
});

export default router;
