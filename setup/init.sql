-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    age INTEGER,
    city VARCHAR(100)
);

-- Create a trigger function
CREATE OR REPLACE FUNCTION notify_user_change() RETURNS trigger AS $$
DECLARE
  payload json;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    payload = json_build_object(
      'operation', 'DELETE',
      'id', OLD.id,
      'name', OLD.name,
      'age', OLD.age,
      'city', OLD.city
    );
  ELSIF (TG_OP = 'UPDATE') THEN
    payload = json_build_object(
      'operation', 'UPDATE',
      'id', NEW.id,
      'name', NEW.name,
      'age', NEW.age,
      'city', NEW.city
    );
  ELSIF (TG_OP = 'INSERT') THEN
    payload = json_build_object(
      'operation', 'INSERT',
      'id', NEW.id,
      'name', NEW.name,
      'age', NEW.age,
      'city', NEW.city
    );
  END IF;
  
  PERFORM pg_notify('user_change', payload::text);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS user_change_trigger ON users;

-- Create the trigger
CREATE TRIGGER user_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION notify_user_change();
