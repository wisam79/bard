-- +goose Up
-- Add sessions table for persistent login tracking
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    token_hash TEXT NOT NULL UNIQUE,
    staff_id TEXT NOT NULL,
    staff_role TEXT DEFAULT '',
    ip_address TEXT DEFAULT '',
    user_agent TEXT DEFAULT '',
    last_active DATETIME,
    expires_at DATETIME NOT NULL,
    created_at DATETIME,
    FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_staff_id ON sessions(staff_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- +goose Down
DROP TABLE IF EXISTS sessions;
