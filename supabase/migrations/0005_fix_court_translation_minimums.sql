-- Fix court-certified translation minimums
-- (Court interpreter rate of $550 is separate and already correct in interpretation_rate_court)

UPDATE system_settings SET value = '275', description = 'Court certification minimum — most languages'
WHERE key = 'translation_minimum_court';

UPDATE system_settings SET value = '450', description = 'Court certification minimum — Japanese & Hebrew'
WHERE key = 'translation_minimum_court_premium';
