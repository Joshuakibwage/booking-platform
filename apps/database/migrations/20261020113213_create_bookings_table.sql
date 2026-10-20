
-- migrate:up

CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Customer and professional relationships
    customer_id UUID NOT NULL
        REFERENCES users(user_id) ON DELETE RESTRICT,

    professional_id UUID NOT NULL
        REFERENCES professional_profiles(profile_id) ON DELETE RESTRICT,

    service_id UUID NOT NULL
        REFERENCES services(service_id) ON DELETE RESTRICT,

    -- Snapshot of the service at booking time
    service_name VARCHAR(120) NOT NULL,

    service_duration_minutes INTEGER NOT NULL
        CHECK (service_duration_minutes > 0),

    service_price NUMERIC(10, 2) NOT NULL
        CHECK (service_price >= 0),

    -- Appointment start and end instants
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,

    CONSTRAINT valid_booking_duration
        CHECK (
            end_time = start_time
                + service_duration_minutes * INTERVAL '1 minute'
        ),

    -- Booking lifecycle
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed'
        CHECK (
            status IN (
                'confirmed',
                'cancelled',
                'completed',
                'no_show'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent overlapping confirmed bookings for the same professional
    CONSTRAINT no_overlapping_active_bookings
        EXCLUDE USING gist (
            professional_id WITH =,
            (tstzrange(start_time, end_time, '[)')) WITH &&
        )
        WHERE (status = 'confirmed')
);

-- migrate:down

DROP TABLE bookings;
