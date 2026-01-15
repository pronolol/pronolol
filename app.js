const { Pool } = require('pg');
const express = require('express');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'user',
    password: 'password',
    database: 'pronolol',
});
const app = express();
const port = 3000;

app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/getUserById', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM users WHERE id = ${req.query.id};`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/getUserByPin', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM users WHERE cpin = ${req.query.cpin};`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/getUserByName', async (req, res) => {
    try {
        const result = await pool.query(`SELECT username FROM users WHERE cpin = ${req.query.cpin};`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/getUserByPinName', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM users WHERE cpin = ${req.query.cpin} AND username = ${req.query.username};`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/getUsers', async (req, res) => {
    try {
        const result = await pool.query(`SELECT username FROM users;`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/createUser', async (req, res) => {
    try {
        const result = await pool.query(`INSERT INTO users (id, username, emoji, cpin) VALUES ((SELECT MAX(id)+1 FROM users), ${req.query.username}, ${req.query.emoji}, ${req.query.cpin});`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/updateUser', async (req, res) => {
    try {
        const result = await pool.query(`UPDATE users SET username = '${req.query.username}', emoji = '${req.query.emoji}' WHERE cpin = '${req.query.cpin}';`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/doesUserExists', async (req, res) => {
    try {
        const result = await pool.query(`UPDATE users SET username = '${req.query.username}', emoji = '${req.query.emoji}' WHERE cpin = '${req.query.cpin}';`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})