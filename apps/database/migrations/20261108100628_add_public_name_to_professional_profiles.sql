-- migrate:up

ALTER TABLE professional_profiles
ADD COLUMN public_name VARCHAR(100);

UPDATE professional_profiles AS pp
SET public_name = u.display_name
FROM users AS u
WHERE u.user_id = pp.user_id;

ALTER TABLE professional_profiles
ALTER COLUMN public_name SET NOT NULL;

-- migrate:down

ALTER TABLE professional_profiles
DROP COLUMN public_name;