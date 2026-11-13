-- migrate:up

ALTER TABLE professional_profiles
ADD COLUMN image_url TEXT NULL,
ADD COLUMN image_public_id VARCHAR(255) NULL;

-- migrate:down

ALTER TABLE professional_profiles
DROP COLUMN image_public_id,
DROP COLUMN image_url;