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
        const result = await pool.query(`SELECT * FROM users WHERE cpin = '${req.query.cpin}';`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


app.get('/getMatchesToCome', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT m.id, t1.tricode as t1_code, t1.logo_url as t1_url, t2.tricode as t2_code, t2.logo_url as t2_url, m.date, m.bo, tourn.tricode as tourn_tricode, p.result
            FROM matches m
            LEFT JOIN teams t1 on m.team1 = t1.id
            LEFT JOIN teams t2 on m.team2 = t2.id
            LEFT JOIN tournaments tourn on m.tournament = tourn.tricode
            LEFT JOIN predictions p on m.id = p.match_id AND p.user_id = ${req.query.id}
            WHERE m.date >= NOW() AND date < NOW() + INTERVAL '10 days'
            ORDER BY m.date;`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


app.get('/getSpecificMatchesToCome', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT m.id, t1.tricode as t1_code, t1.logo_url as t1_url, t2.tricode as t2_code, t2.logo_url as t2_url, m.date, m.bo, tourn.tricode as tourn_tricode, p.result
            FROM matches m
            LEFT JOIN teams t1 on m.team1 = t1.id
            LEFT JOIN teams t2 on m.team2 = t2.id
            LEFT JOIN tournaments tourn on m.tournament = tourn.tricode
            LEFT JOIN predictions p on m.id = p.match_id AND p.user_id = ${req.query.id}
            WHERE m.tournament = '${req.query.tournament}' AND m.date >= NOW() AND date < NOW() + INTERVAL '10 days'
            ORDER BY m.date;`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/getPastMatches', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT m.id, t1.tricode as t1_code, t1.logo_url as t1_url, t2.tricode as t2_code, t2.logo_url as t2_url, m.date, m.bo, m.score, tourn.tricode as tourn_tricode, p.result
            FROM matches m
            LEFT JOIN teams t1 on m.team1 = t1.id
            LEFT JOIN teams t2 on m.team2 = t2.id
            LEFT JOIN tournaments tourn on m.tournament = tourn.tricode
            LEFT JOIN predictions p on m.id = p.match_id AND p.user_id = ${req.query.id}
            WHERE m.date < NOW()
            ORDER BY m.date DESC;`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/getSpecificPastMatches', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT m.id, t1.tricode as t1_code, t1.logo_url as t1_url, t2.tricode as t2_code, t2.logo_url as t2_url, m.date, m.bo, m.score, tourn.tricode as tourn_tricode, p.result
            FROM matches m
            LEFT JOIN teams t1 on m.team1 = t1.id
            LEFT JOIN teams t2 on m.team2 = t2.id
            LEFT JOIN tournaments tourn on m.tournament = tourn.tricode
            LEFT JOIN predictions p on m.id = p.match_id AND p.user_id = ${req.query.id}
            WHERE m.tournament = '${req.query.tournament}' AND m.date < NOW()
            ORDER BY m.date DESC;`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/addPrediction', async (req, res) => {
    try {
        const result = await pool.query(`SELECT date FROM matches WHERE id = ${req.query.id};`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/addPredictionInsert', async (req, res) => {
    try {
        const result = await pool.query(`INSERT INTO predictions (match_id, user_id, result) VALUES (${req.query.matchId}, ${req.query.userId}, '${req.query.score}');`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/updatePrediction', async (req, res) => {
    try {
        const result = await pool.query(`SELECT date FROM matches WHERE id = ${req.query.id};`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/updatePredictionInsert', async (req, res) => {
    try {
        const result = await pool.query(`UPDATE predictions SET result = '${req.query.score}' WHERE match_id = ${req.query.matchId} AND user_id = ${req.query.userId}`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/getUserPredictions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT m.id, t1.tricode as t1_code, t1.logo_url as t1_url, t2.tricode as t2_code, t2.logo_url as t2_url, m.date, m.bo, m.score, tourn.tricode, p.result
            FROM matches m
            LEFT JOIN teams t1 on m.team1 = t1.id
            LEFT JOIN teams t2 on m.team2 = t2.id
            LEFT JOIN tournaments tourn on m.tournament = tourn.tricode
            INNER JOIN predictions p on m.id = p.match_id
            WHERE m.tournament IN (SELECT tournament FROM tournaments HAVING COUNT(DISTINCT tricode) = 7) AND p.user_id = ${req.query.id}
            ORDER BY m.date DESC;`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/getUserSpecificPredictions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT m.id, t1.tricode as t1_code, t1.logo_url as t1_url, t2.tricode as t2_code, t2.logo_url as t2_url, m.date, m.bo, m.score, tourn.tricode, p.result
            FROM matches m
            LEFT JOIN teams t1 on m.team1 = t1.id
            LEFT JOIN teams t2 on m.team2 = t2.id
            LEFT JOIN tournaments tourn on m.tournament = tourn.tricode
            INNER JOIN predictions p on m.id = p.match_id
            WHERE m.tournament = '${req.query.tournament}' AND p.user_id = ${req.query.id}
            ORDER BY m.date DESC;`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/getCurrentRanking', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id, u.username, u.emoji, p.result, m.score, m.bo
            FROM users u
            INNER JOIN predictions p on u.id = p.user_id
            INNER JOIN matches m on p.match_id = m.id
            WHERE m.date > (SELECT begindate FROM tournaments WHERE begindate = (SELECT MIN(begindate) FROM tournaments));`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/getSpecificGlobalRanking', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id, u.username, u.emoji, p.result, m.score, m.bo
            FROM users u
            INNER JOIN predictions p on u.id = p.user_id
            INNER JOIN matches m on p.match_id = m.id
            WHERE m.tournament = '${req.query.tournament}' AND m.date < NOW();`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/getMatchPredictionsById', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id, u.username, u.emoji, p.result
            FROM users u
            INNER JOIN predictions p on u.id = p.user_id
            WHERE p.match_id = ${req.query.id};`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


app.get('/getCurrentTournament', async (req, res) => {
    try {
        const result = await pool.query(`SELECT description FROM tournaments WHERE begindate = (SELECT MIN(begindate) FROM tournaments);`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/getTeamPreviousMatches', async (req, res) => {
    try {
        const result = await pool.query(`SELECT m.id, t1.tricode as t1_code, t1.logo_url as t1_url, t2.tricode as t2_code, t2.logo_url as t2_url, m.date, m.bo, m.score, tourn.tricode as tourn_tricode
            FROM matches m
            LEFT JOIN teams t1 on m.team1 = t1.id
            LEFT JOIN teams t2 on m.team2 = t2.id
            LEFT JOIN tournaments tourn on m.tournament = tourn.tricode
            WHERE (t1.tricode = '${req.query.team}' OR t2.tricode = '${req.query.team}') AND m.date <= NOW()
            ORDER BY m.date DESC;`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})