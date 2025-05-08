
-- Configure email validation to accept all domains
UPDATE auth.config
SET
  -- Allow all email domains by setting empty block list
  email_domain_blocklist = '{}',
  -- Allow all domains by setting NULL allowlist (disables domain checking)
  email_domain_allowlist = NULL,
  -- Set to false to skip strict email validation entirely
  enable_email_domain_allowlist = false,
  enable_email_domain_blocklist = false,
  -- Disable email confirmation requirement for faster testing
  enable_confirmations = false,
  -- IMPORTANT: Set the email validation regex to be extremely permissive
  -- This will accept any string containing an @ symbol
  email_regex = '^.+@.+$';

