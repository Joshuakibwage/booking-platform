-- migrate:up

CREATE TABLE services (
    service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL
        REFERENCES professional_profiles(profile_id),
    name VARCHAR(120) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL
        CHECK (duration_minutes > 0),
    price NUMERIC(10, 2) NOT NULL
        CHECK (price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- migrate:down

