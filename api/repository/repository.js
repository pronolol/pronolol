function singleItem(result) {
    if (result.rows.length === 0)
        return null;

    return result.rows[0];
}

function multipleItems(result) {
    return result.rows;
}

class Repository {
    constructor(pool) {
        this.pool = pool;
    }

    async getUsers() {
        return multipleItems(
            await this.pool.query(
                'SELECT id, username, emoji FROM users'
            )
        );
    }

    async getUserById(id) {
        return singleItem(
            await this.pool.query(
                'SELECT id, username, emoji FROM users WHERE id = $1', [id]
            )
        );
    }

    async getUserByCPIN(cpin) {
        return singleItem(
            await this.pool.query(
                'SELECT id, username, emoji FROM users WHERE cpin = $1', [cpin]
            )
        );
    }

    async getUserByCPINAndUsername(cpin, username) {
        return singleItem(
            await this.pool.query(
                'SELECT * FROM users WHERE cpin = $1 AND username = $2', [cpin, username]
            )
        );
    }

    async createUser(username, emoji, cpin) {
        return singleItem(
            await this.pool.query(
                'INSERT INTO users (id, username, emoji, cpin) VALUES ($1, $2, $3, $4) RETURNING *',
                [1, username, emoji, cpin]
            )
        );
    }

    async updateUser(id, username, emoji) {
        return singleItem(
            await this.pool.query(
                'UPDATE users SET username = $1, emoji = $2 WHERE id = $3 RETURNING *',
                [username, emoji, id]
            )
        );
    }

    async getUserPredictionMatches(userId, tournamentId=null, time=null) {
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
        if (tournamentId) {
            conditions.push(`m.tournament_id = $${paramIndex++}`);
            params.push(tournamentId);
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

        return multipleItems(await this.pool.query(query, params));
    }

    async getUserPredictions(userId, tournamentId=null) {
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

        return multipleItems(this.pool.query(query, params));
    }

    async getMatchDate(matchId) {
        return singleItem(
            await this.pool.query(
                'SELECT match_date FROM matches WHERE id = $1', [matchId]
            )
        );
    }

    async createPrediction(userId, matchId, team1Result, team2Result) {
        return singleItem(
            await this.pool.query(
                'INSERT INTO predictions (match_id, user_id, team1_result, team2_result) VALUES ($1, $2, $3, $4) RETURNING *',
                [matchId, userId, team1Result, team2Result]
            )
        );
    }

    async updatePrediction(userId, matchId, team1Result, team2Result) {
        return singleItem(
            await this.pool.query(
                'UPDATE predictions SET team1_result = $1, team2_result = $2 WHERE match_id = $3 AND user_id = $4 RETURNING *',
                [team1Result, team2Result, matchId, userId]
            )
        );
    }

    async getTournamentRanking(tournamentId) {
        return multipleItems(
            await this.pool.query(`
                SELECT u.id, u.username, u.emoji, p.team1_result, p.team2_result, m.team1_score, m.team2_score, m.best_of
                FROM users u
                INNER JOIN predictions p ON u.id = p.user_id
                INNER JOIN matches m ON p.match_id = m.id
                WHERE m.tournament_id = $1 AND m.match_date < NOW()`,
                [tournamentId]
            )
        );
    }

    async getRankings() {
        return multipleItems(
            await this.pool.query(`
                SELECT u.id, u.username, u.emoji, p.team1_result, p.team2_result, m.team1_score, m.team2_score, m.best_of
                FROM users u
                INNER JOIN predictions p ON u.id = p.user_id
                INNER JOIN matches m ON p.match_id = m.id
                WHERE m.match_date < NOW()`
            )
        );
    }

    async getMatchPredictions(matchId) {
        return multipleItems(
            await this.pool.query(`
                SELECT u.id, u.username, u.emoji, p.team1_result, p.team2_result
                FROM users u
                INNER JOIN predictions p ON u.id = p.user_id
                WHERE p.match_id = $1`,
                [id]
            )
        );
    }
}

module.exports = Repository