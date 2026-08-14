import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import queryDb from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from dist/ (for production deployment)
app.use(express.static(path.join(__dirname, '../dist')));

// ── Custom Lessons API ──────────────────────────────────────────────────────
app.get('/api/lessons', async (req, res) => {
  try {
    const lessons = await queryDb('SELECT * FROM custom_lessons ORDER BY created_at DESC');
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lessons', async (req, res) => {
  const { id, title, text, language, difficulty } = req.body;
  if (!id || !title || !text || !language) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await queryDb(`
      INSERT INTO custom_lessons (id, title, text, language, difficulty, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, title, text, language, difficulty || 'Intermediate', new Date().toISOString()]);
    res.status(201).json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/lessons/:id', async (req, res) => {
  try {
    await queryDb('DELETE FROM custom_lessons WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Stats API ───────────────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const results = await queryDb('SELECT wpm, accuracy, language FROM test_results ORDER BY completed_at ASC');
    
    // Group and aggregate exactly like AppStats
    const stats = {
      wpmHistory: [],
      accuracyHistory: [],
      totalTests: 0,
      bestWpm: 0,
      uzWpmHistory: [],
      ruWpmHistory: [],
      uzTests: 0,
      ruTests: 0,
      uzBestWpm: 0,
      ruBestWpm: 0
    };

    for (const r of results) {
      stats.wpmHistory.push(r.wpm);
      stats.accuracyHistory.push(r.accuracy);
      stats.totalTests++;
      if (r.wpm > stats.bestWpm) stats.bestWpm = r.wpm;

      if (r.language === 'uz') {
        stats.uzWpmHistory.push(r.wpm);
        stats.uzTests++;
        if (r.wpm > stats.uzBestWpm) stats.uzBestWpm = r.wpm;
      } else if (r.language === 'ru') {
        stats.ruWpmHistory.push(r.wpm);
        stats.ruTests++;
        if (r.wpm > stats.ruBestWpm) stats.ruBestWpm = r.wpm;
      }
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stats/test', async (req, res) => {
  const { wpm, accuracy, language, lesson_id } = req.body;
  
  try {
    await queryDb(`
      INSERT INTO test_results (wpm, accuracy, language, lesson_id, completed_at)
      VALUES (?, ?, ?, ?, ?)
    `, [wpm, accuracy, language, lesson_id, new Date().toISOString()]);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats/daily', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    // LIKE behaves slightly differently in Postgres, so we use string literal concatenation
    let count = 0;
    if (queryDb.isPostgres) {
       const result = await queryDb(`SELECT count(*) as count FROM test_results WHERE completed_at::text LIKE ?`, [`${today}%`]);
       count = result[0]?.count || 0;
    } else {
       const result = await queryDb(`SELECT count(*) as count FROM test_results WHERE completed_at LIKE ?`, [`${today}%`]);
       count = result[0]?.count || 0;
    }
    
    res.json({ date: today, count: Number(count) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/stats', async (req, res) => {
  try {
    await queryDb('DELETE FROM test_results');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fallback for React Router (if using client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});
