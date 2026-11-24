BEGIN;

CREATE SCHEMA IF NOT EXISTS impactsphere_ai;

-- Slot zero is the global UTC-day counter. Slots 1..65536 are private,
-- pseudonymous visitor minute buckets. A new time window reuses the same row.
CREATE TABLE IF NOT EXISTS impactsphere_ai.quota (
  slot integer PRIMARY KEY CHECK (slot BETWEEN 0 AND 65536),
  window_id bigint NOT NULL,
  attempts integer NOT NULL CHECK (attempts BETWEEN 0 AND 200)
);

INSERT INTO impactsphere_ai.quota (slot, window_id, attempts)
VALUES (0, -1, 0)
ON CONFLICT (slot) DO NOTHING;

CREATE OR REPLACE FUNCTION impactsphere_ai.reserve(visitor_slot integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
SET lock_timeout = '2s'
AS $function$
DECLARE
  daily impactsphere_ai.quota%ROWTYPE;
  epoch_seconds bigint;
  utc_day bigint;
  utc_minute bigint;
BEGIN
  IF visitor_slot IS NULL OR visitor_slot NOT BETWEEN 1 AND 65536 THEN
    RAISE EXCEPTION 'Invalid quota bucket';
  END IF;

  -- Every reservation locks the global row first. This keeps the two counters
  -- atomic across function instances and only creates rows for accepted calls.
  SELECT * INTO STRICT daily FROM impactsphere_ai.quota WHERE slot = 0 FOR UPDATE;
  epoch_seconds := floor(extract(epoch FROM clock_timestamp()))::bigint;
  utc_day := epoch_seconds / 86400;
  utc_minute := epoch_seconds / 60;
  IF daily.window_id = utc_day AND daily.attempts >= 200 THEN
    RETURN (86400 - epoch_seconds % 86400)::integer;
  END IF;

  INSERT INTO impactsphere_ai.quota AS q (slot, window_id, attempts)
  VALUES (visitor_slot, utc_minute, 1)
  ON CONFLICT (slot) DO UPDATE SET
    window_id = EXCLUDED.window_id,
    attempts = CASE WHEN q.window_id = EXCLUDED.window_id THEN q.attempts + 1 ELSE 1 END
  WHERE q.window_id <> EXCLUDED.window_id OR q.attempts < 8;
  IF NOT FOUND THEN
    RETURN (60 - epoch_seconds % 60)::integer;
  END IF;

  UPDATE impactsphere_ai.quota
  SET window_id = utc_day,
      attempts = CASE WHEN daily.window_id = utc_day THEN daily.attempts + 1 ELSE 1 END
  WHERE slot = 0;
  RETURN 0;
END;
$function$;

REVOKE ALL ON FUNCTION impactsphere_ai.reserve(integer) FROM PUBLIC;
COMMIT;
