const { Pool } = require('pg');
const http = require('http');

const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    user: 'nuha8660',
    password: 'VV63-zX7M-GVN]',
    database: 'nuha8660_pronolol',
});

var server = http.createServer(async (req, res) => { 
    res.setHeader('Content-Type', 'application/json'); 
    const result = await pool.query('SELECT id FROM users'); 
    res.writeHead(200);
    res.end(JSON.stringify(result.rows)); 

    if (req.method === 'GET' && req.url === `${BASE}/users`) {
      const result = await pool.query('SELECT * FROM users WHERE id = 1;');
      res.writeHead(200);
      return res.end(JSON.stringify(result.rows));
    }
}); 
server.listen();