-- Module-level progress tracking

ALTER TABLE phase_progress ADD COLUMN IF NOT EXISTS module_id INT NOT NULL DEFAULT 1 CHECK (module_id BETWEEN 1 AND 12);
ALTER TABLE phase_progress DROP CONSTRAINT IF EXISTS phase_progress_module_phase_unique;
ALTER TABLE phase_progress ADD CONSTRAINT phase_progress_module_phase_unique UNIQUE (student_id, module_id, phase);

-- Update leaderboard phase_xp default to include module scope
ALTER TABLE leaderboard ALTER COLUMN phase_xp SET DEFAULT '{}';

-- Function to upsert phase progress
CREATE OR REPLACE FUNCTION upsert_phase_progress(
  p_student_id UUID,
  p_module_id INT,
  p_phase INT,
  p_status TEXT
) RETURNS void SECURITY DEFINER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO phase_progress (student_id, module_id, phase, status, started_at, time_spent_seconds)
  VALUES (p_student_id, p_module_id, p_phase, p_status, 
    CASE WHEN p_status = 'in_progress' THEN NOW() ELSE NULL END,
    0)
  ON CONFLICT (student_id, module_id, phase) DO UPDATE SET
    status = CASE 
      WHEN phase_progress.status = 'completed' AND p_status != 'completed' THEN phase_progress.status
      ELSE p_status
    END,
    completed_at = CASE WHEN p_status = 'completed' THEN NOW() ELSE phase_progress.completed_at END;
END;
$$;
