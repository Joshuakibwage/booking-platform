-- migrate:up

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE weekly_availability (
    availability_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL
        REFERENCES professional_profiles(profile_id),
    day_of_week SMALLINT NOT NULL
        CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CHECK (end_time > start_time),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT no_overlapping_availability
        EXCLUDE USING gist (
            professional_id WITH =,
            day_of_week WITH =,
            (int4range(
                EXTRACT(EPOCH FROM start_time)::INTEGER,
                EXTRACT(EPOCH FROM end_time)::INTEGER,
                '[)'
            )) WITH &&
        )
);

-- migrate:down

DROP TABLE weekly_availability;