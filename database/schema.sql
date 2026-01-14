-- This file contains the SQL schema for the pronolol application database.
-- Use this to initialize your PostgreSQL database tables.

-- Table for storing league information
CREATE TABLE leagues (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    region TEXT
);

-- Table for storing team information
CREATE TABLE teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tag TEXT NOT NULL,
    logo_url TEXT
);

-- Table for storing tournament information
CREATE TABLE tournaments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    league_id TEXT NOT NULL REFERENCES leagues(id)
);

-- Table for storing match details and results
CREATE TABLE matches (
    id TEXT PRIMARY KEY,
    match_date TIMESTAMPTZ NOT NULL,
    state TEXT NOT NULL, -- e.g., 'unstarted', 'completed'
    best_of INTEGER NOT NULL,
    stage TEXT, -- e.g., 'Week 1', 'Playoffs'
    tournament_id TEXT NOT NULL REFERENCES tournaments(id),
    team1_id TEXT NOT NULL REFERENCES teams(id),
    team2_id TEXT NOT NULL REFERENCES teams(id),
    winner_id TEXT REFERENCES teams(id), -- Can be NULL until match is completed
    team1_score INTEGER,
    team2_score INTEGER
);

-- Add indexes for foreign keys to improve query performance
CREATE INDEX ON tournaments (league_id);
CREATE INDEX ON matches (tournament_id);
CREATE INDEX ON matches (team1_id);
CREATE INDEX ON matches (team2_id);
CREATE INDEX ON matches (winner_id);
CREATE INDEX ON matches (match_date);