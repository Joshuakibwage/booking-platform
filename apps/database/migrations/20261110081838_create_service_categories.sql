-- migrate:up

CREATE TABLE service_categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0
        CHECK (display_order >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO service_categories (
    name,
    slug,
    description,
    image_url,
    display_order
)
VALUES
    (
        'Beauty & personal care',
        'beauty-personal-care',
        'Find professionals for grooming, beauty treatments, and personal care.',
        '/images/categories/beauty.jpg',
        1
    ),
    (
        'Health & wellness',
        'health-wellness',
        'Connect with people who support your wellbeing and healthier routines.',
        '/images/categories/wellness.jpg',
        2
    ),
    (
        'Learning & coaching',
        'learning-coaching',
        'Discover tutors, instructors, and coaches who help you grow.',
        '/images/categories/learning.jpg',
        3
    ),
    (
        'Home services',
        'home-services',
        'Find skilled professionals for everyday tasks and home projects.',
        '/images/categories/home-services.jpg',
        4
    ),
    (
        'Business & consulting',
        'business-consulting',
        'Connect with independent experts offering professional services.',
        '/images/categories/business.jpg',
        5
    ),
    (
        'Events & creativity',
        'events-creativity',
        'Discover creative talent for events, photography, and special occasions.',
        '/images/categories/events.jpg',
        6
    );

ALTER TABLE services
ADD COLUMN category_id UUID
REFERENCES service_categories(category_id)
ON DELETE RESTRICT;

CREATE INDEX idx_services_category_id
ON services(category_id)
WHERE category_id IS NOT NULL;

-- migrate:down

DROP INDEX IF EXISTS idx_services_category_id;

ALTER TABLE services
DROP COLUMN category_id;

DROP TABLE service_categories;
