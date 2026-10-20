-- migrate:up

CREATE TABLE availability_exceptions (
    exception_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL
        REFERENCES professional_profiles(profile_id),
    exception_date DATE NOT NULL,
    is_available BOOLEAN NOT NULL,
    start_time TIME NULL,
    end_time TIME NULL,
    reason TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (professional_id, exception_date),

    CHECK (
        (is_available = TRUE AND start_time IS NOT NULL AND end_time IS NOT NULL)
        OR
        (is_available = FALSE AND start_time IS NULL AND end_time IS NULL)
    ),

    CHECK (
        is_available = FALSE OR end_time > start_time
    )
);

-- migrate:down

DROP TABLE availability_exceptions;