require('dotenv').config();
const { Pool } = require('pg');
const Repository = require('./repository')
const fs = require('node:fs')

var pool = null; 

async function getUser(id) {
    return (await pool.query("SELECT id, username, emoji, cpin FROM users WHERE id = $1", [id])).rows[0];
}

beforeAll(async () => {
    pool = new Pool({
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE,
    });
})

test('create user', async () => {
    const r = new Repository(pool);

    const user = await r.createUser("Alex", ":)", "cpin");
    const created = await getUser(user.id);

    expect(created).toStrictEqual(user);
})

afterAll(() => {
    pool.end();
})