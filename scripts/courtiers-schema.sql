CREATE TABLE IF NOT EXISTS courtier_skills (
  name TEXT PRIMARY KEY,
  position INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS courtier_applications (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  portfolio TEXT NOT NULL DEFAULT '',
  skills JSONB NOT NULL CHECK (jsonb_typeof(skills) = 'array'),
  answers JSONB NOT NULL CHECK (jsonb_typeof(answers) = 'object'),
  commitment BOOLEAN NOT NULL CHECK (commitment = TRUE),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  review_notes TEXT NOT NULL DEFAULT '',
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  version INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS courtier_applications_review_idx ON courtier_applications (status, created_at DESC, id);
