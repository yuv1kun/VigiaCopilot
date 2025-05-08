
-- Configure basic email validation to be more permissive
UPDATE auth.config
SET
  -- Allow any domain in email addresses
  email_domain_blocklist = '{}',
  -- Skip strict email validation checks
  email_domain_allowlist = NULL;
