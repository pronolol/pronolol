require('dotenv').config();
const { Pool } = require('pg');
const express = require('express');

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    user: process.env.PG_USER || 'user',
    password: process.env.PG_PASSWORD || 'password',
    database: process.env.PG_DATABASE || 'pronolol',
});

const app = express();
app.use(express.json()); 
const port = 3000;

// Root endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the Pronolol API!');
});


app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, emoji FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT id, username, emoji FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('User not found');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


app.post('/login', async (req, res) => {
    const { cpin, username } = req.body;
    if (!cpin || !username) {
        return res.status(400).send('CPIN and username are required');
    }
    try {
        const result = await pool.query('SELECT * FROM users WHERE cpin = $1 AND username = $2', [cpin, username]);
        if (result.rows.length === 0) {
            return res.status(401).send('Invalid credentials');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});



app.post('/users', async (req, res) => {
    const { username, emoji, cpin } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (username, emoji, cpin) VALUES ($1, $2, $3) RETURNING *',
            [username, emoji, cpin]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, emoji } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET username = $1, emoji = $2 WHERE id = $3 RETURNING *',
            [username, emoji, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('User not found');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});



app.get('/matches', async (req, res) => {
    const { userId, tournament, time } = req.query; // time can be 'upcoming' or 'past'
    
    let query = `
        SELECT m.id, t1.tag as team1_code, t1.logo_url as team1_url, t2.tag as team2_code, t2.logo_url as team2_url, m.match_date, m.best_of, m.team1_score, m.team2_score, m.tournament_id, p.team1_result, p.team2_result
        FROM matches m
        LEFT JOIN teams t1 ON m.team1_id = t1.id
        LEFT JOIN teams t2 ON m.team2_id = t2.id
        LEFT JOIN predictions p ON m.id = p.match_id AND p.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    const conditions = [];
    if (tournament) {
        conditions.push(`m.tournament_id = $${paramIndex++}`);
        params.push(tournament);
    }
    if (time === 'upcoming') {
        conditions.push(`m.match_date >= NOW()`);
    } else if (time === 'past') {
        conditions.push(`m.match_date < NOW()`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY m.match_date ${time === 'past' ? 'DESC' : 'ASC'}`;

    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


app.get('/users/:id/predictions', async (req, res) => {
    const { id } = req.params;
    const { tournament } = req.query;

    let query = `
        SELECT m.id, t1.tag as team1_code, t1.logo_url as team1_url, t2.tag as team2_code, t2.logo_url as team2_url, m.match_date, m.best_of, m.team1_score, m.team2_score, t.id as tournament_id, p.team1_result, p.team2_result
        FROM matches m
        LEFT JOIN teams t1 ON m.team1_id = t1.id
        LEFT JOIN teams t2 ON m.team2_id = t2.id
        LEFT JOIN tournaments t ON m.tournament_id = t.id
        INNER JOIN predictions p ON m.id = p.match_id
        WHERE p.user_id = $1
    `;
    const params = [id];

    if (tournament) {
        query += ' AND m.tournament_id = $2';
        params.push(tournament);
    }

    query += ' ORDER BY m.match_date DESC';

    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


app.post('/predictions', async (req, res) => {
    const { matchId, userId, team1Result, team2Result } = req.body;
    try {
        const matchResult = await pool.query('SELECT match_date FROM matches WHERE id = $1', [matchId]);
        if (matchResult.rows.length === 0) {
            return res.status(404).send('Match not found.');
        }
        if (new Date(matchResult.rows[0].match_date) < new Date()) {
            return res.status(400).send('Cannot predict on past matches.');
        }

        const result = await pool.query(
            'INSERT INTO predictions (match_id, user_id, team1_result, team2_result) VALUES ($1, $2, $3, $4) RETURNING *',
            [matchId, userId, team1Result, team2Result]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { 
            return res.status(409).send('Prediction for this match by this user already exists.');
        }
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.put('/predictions', async (req, res) => {
    const { matchId, userId, team1Result, team2Result } = req.body;
     try {
        const matchResult = await pool.query('SELECT match_date FROM matches WHERE id = $1', [matchId]);
        if (matchResult.rows.length === 0) {
            return res.status(404).send('Match not found.');
        }
        if (new Date(matchResult.rows[0].match_date) < new Date()) {
            return res.status(400).send('Cannot update prediction for past matches.');
        }
        
        const result = await pool.query(
            'UPDATE predictions SET team1_result = $1, team2_result = $2 WHERE match_id = $3 AND user_id = $4 RETURNING *',
            [team1Result, team2Result, matchId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Prediction not found. Use POST to create one.');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


app.get('/ranking/:tournament', async (req, res) => {
    const { tournament } = req.params;
    try {
        // TODO: Ranking logid
        const result = await pool.query(`
            SELECT u.id, u.username, u.emoji, p.team1_result, p.team2_result, m.team1_score, m.team2_score, m.best_of
            FROM users u
            INNER JOIN predictions p ON u.id = p.user_id
            INNER JOIN matches m ON p.match_id = m.id
            WHERE m.tournament_id = $1 AND m.match_date < NOW()`,
            [tournament]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/matches/:id/predictions', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT u.id, u.username, u.emoji, p.team1_result, p.team2_result
            FROM users u
            INNER JOIN predictions p ON u.id = p.user_id
            WHERE p.match_id = $1`,
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
