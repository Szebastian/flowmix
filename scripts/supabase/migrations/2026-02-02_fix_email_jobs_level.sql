-- FIX email_jobs constraints
-- Make 'level' nullable since not all email jobs require a membership level (e.g. system notifications)

ALTER TABLE email_jobs ALTER COLUMN level DROP NOT NULL;
