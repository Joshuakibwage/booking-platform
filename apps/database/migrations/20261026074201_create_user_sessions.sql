
-- migrate:up

CREATE TABLE user_sessions (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMPTZ NOT NULL
);

CREATE INDEX user_sessions_expire_idx
    ON user_sessions (expire);

-- migrate:down

DROP TABLE user_sessions;
