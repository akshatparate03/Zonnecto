-- ============================================================
-- Zonnecto — PostgreSQL Schema
-- Converted from MySQL 8.0 → PostgreSQL 15+
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    username    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(255),
    bio         TEXT,
    dp_url      VARCHAR(500),
    gender      VARCHAR(50),
    state       VARCHAR(100),
    age         VARCHAR(50),
    interests   TEXT,
    email_verified          BOOLEAN DEFAULT FALSE,
    preference_unlocked     INTEGER DEFAULT 0,
    daily_matches_used      INTEGER DEFAULT 0,
    last_match_reset_time   TIMESTAMP,
    referral_count          INTEGER DEFAULT 0,
    link_violation_count    INTEGER DEFAULT 0,
    is_premium              BOOLEAN DEFAULT FALSE,
    premium_plan            VARCHAR(50),
    premium_expires_at      TIMESTAMP,
    preferred_gender        VARCHAR(50),
    preferred_age           VARCHAR(50),
    preferred_state         VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Chat Rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
    id              BIGSERIAL PRIMARY KEY,
    user1id         BIGINT NOT NULL REFERENCES users(id),
    user2id         BIGINT NOT NULL REFERENCES users(id),
    room_type       VARCHAR(50) DEFAULT 'RANDOM_MATCH',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_chatrooms_users ON chat_rooms(user1id, user2id);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id                  BIGSERIAL PRIMARY KEY,
    sender_id           BIGINT NOT NULL REFERENCES users(id),
    recipient_id        BIGINT NOT NULL REFERENCES users(id),
    chat_room_id        BIGINT NOT NULL REFERENCES chat_rooms(id),
    content             TEXT,
    media_url           VARCHAR(500),
    message_type        VARCHAR(50) DEFAULT 'TEXT',
    timestamp           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_reported         BOOLEAN DEFAULT FALSE,
    reported_by_user_id BIGINT,
    is_edited           BOOLEAN DEFAULT FALSE,
    is_deleted          BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_messages_chatroom  ON messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

-- Friends
CREATE TABLE IF NOT EXISTS friends (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    friend_id   BIGINT NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, friend_id)
);

-- Friend Requests
CREATE TABLE IF NOT EXISTS friend_requests (
    id           BIGSERIAL PRIMARY KEY,
    sender_id    BIGINT NOT NULL REFERENCES users(id),
    receiver_id  BIGINT NOT NULL REFERENCES users(id),
    status       VARCHAR(50) DEFAULT 'PENDING',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id, status);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
    id                   BIGSERIAL PRIMARY KEY,
    reported_user_id     BIGINT NOT NULL REFERENCES users(id),
    reported_by_user_id  BIGINT NOT NULL REFERENCES users(id),
    message_id           BIGINT NOT NULL REFERENCES messages(id),
    reason               TEXT,
    status               VARCHAR(50) DEFAULT 'PENDING',
    admin_notes          TEXT,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at          TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Bans
CREATE TABLE IF NOT EXISTS bans (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    reason          TEXT,
    violation_count INTEGER DEFAULT 1,
    is_permanent    BOOLEAN DEFAULT FALSE,
    expires_at      TIMESTAMP NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bans_user_expiry ON bans(user_id, expires_at);

-- Blocked Users
CREATE TABLE IF NOT EXISTS blocked_users (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    blocked_user_id BIGINT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, blocked_user_id)
);

-- Invites / Referrals
CREATE TABLE IF NOT EXISTS invites (
    id                  BIGSERIAL PRIMARY KEY,
    invite_code         VARCHAR(50) UNIQUE NOT NULL,
    created_by_user_id  BIGINT NOT NULL REFERENCES users(id),
    used_by_user_id     BIGINT REFERENCES users(id),
    is_used             BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at             TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(invite_code);

-- Message Read Status
CREATE TABLE IF NOT EXISTS message_read_status (
    id          BIGSERIAL PRIMARY KEY,
    message_id  BIGINT NOT NULL REFERENCES messages(id),
    user_id     BIGINT NOT NULL REFERENCES users(id),
    is_read     BOOLEAN DEFAULT FALSE,
    read_at     TIMESTAMP,
    UNIQUE (message_id, user_id)
);