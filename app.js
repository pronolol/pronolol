const { Pool } = require('pg');
const https = require('https');
const fs = require('fs');
const express = require('express');

const PORT = 443;
const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    user: 'nuha8660',
    password: 'rF71Sj1t#2Wjv!j4*pMr',
    database: 'nuha8660_pronolol',
});
const app = express();

app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

const httpsOptions = {
    key: fs.readFileSync('./env/private.key'),
    cert: fs.readFileSync('./env/certificate.crt')
};

https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`Serveur HTTPS démarré sur le port ${PORT}`);
});