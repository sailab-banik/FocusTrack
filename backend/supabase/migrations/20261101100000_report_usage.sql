-- What the admin overview reads about each report: what it used and how
-- writing it went. Reports written before this have nulls and one attempt.
-- last_error is a short category set by the app, never a provider's raw
-- message, which could quote session content.
alter table public.reports
  add column input_tokens integer check (input_tokens >= 0),
  add column output_tokens integer check (output_tokens >= 0),
  add column write_ms integer check (write_ms >= 0),
  add column attempts integer not null default 1 check (attempts >= 1),
  add column last_error text check (char_length(last_error) <= 60),
  add column last_failed_at timestamptz;
