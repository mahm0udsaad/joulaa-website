BEGIN;

-- First, create a temporary table to store the most recent active cart for each user
WITH latest_active_carts AS (
  SELECT DISTINCT ON (user_id)
    id,
    user_id,
    created_at
  FROM carts
  WHERE status = 'active'
  ORDER BY user_id, created_at DESC
)

-- Update all carts to be inactive except the most recent one for each user
UPDATE carts
SET status = 'inactive'
WHERE id NOT IN (SELECT id FROM latest_active_carts)
AND status = 'active';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_one_active_cart_trigger ON carts;
DROP FUNCTION IF EXISTS ensure_one_active_cart();

-- Create the trigger function
CREATE OR REPLACE FUNCTION ensure_one_active_cart()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    -- Set all other active carts for this user to inactive
    UPDATE carts
    SET status = 'inactive'
    WHERE user_id = NEW.user_id
    AND status = 'active'
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER ensure_one_active_cart_trigger
  BEFORE INSERT OR UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION ensure_one_active_cart();

-- Add a unique constraint to prevent multiple active carts per user
ALTER TABLE carts
ADD CONSTRAINT one_active_cart_per_user UNIQUE (user_id, status)
WHERE status = 'active';

-- Add an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_carts_user_status ON carts(user_id, status);

COMMIT; 