const { Pool } = require('pg');
const express = require('express');

const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    user: 'nuha8660',
    password: '30M9K0f7W&2HDp^apz0P',
    database: 'nuha8660_pronolol',
});
const app = express();

app.get('/', (req, res) => {
    res.send('Backend OK');
});

app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
module.exports = app;