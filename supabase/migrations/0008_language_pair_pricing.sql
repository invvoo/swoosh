-- Seed comprehensive language pair pricing.
-- Hub model: English ↔ every language.
-- Additionally seeds common cross-language pairs for the LA market.
-- Idempotent: ON CONFLICT updates the rate.
--
-- Rate tiers:
--   $0.18  Standard European / Latin / common languages
--   $0.24  Complex-script / right-to-left / CJK languages
--   $0.30  Rare, specialized, or low-resource languages

DO $$
DECLARE
  lang text;
  rate numeric;

  -- All languages the platform supports (mirrors src/lib/languages.ts)
  all_langs text[] := ARRAY[
    'Acholi','Afar','Afrikaans','Akan','Albanian','Amharic','Arabic','Aragonese',
    'Aramaic','Armenian','Aromanian','Assamese','Avar','Aymara','Azerbaijani',
    'Balochi','Bambara','Bashkir','Basque','Belarusian','Bengali','Bhojpuri',
    'Bosnian','Breton','Bulgarian','Burmese',
    'Cantonese','Catalan','Cebuano','Chechen','Chinese (Simplified)','Chinese (Traditional)',
    'Chuvash','Cornish','Corsican','Croatian','Czech',
    'Danish','Dari','Dinka','Dutch','Dzongkha',
    'Esperanto','Estonian','Ewe',
    'Faroese','Fijian','Finnish','Flemish','French','French Canadian','Frisian','Fulani',
    'Galician','Georgian','German','Greek','Guaraní','Gujarati',
    'Haitian Creole','Hausa','Hawaiian','Hebrew','Hindi','Hmong','Hungarian',
    'Icelandic','Igbo','Ilocano','Indonesian','Irish',
    'Japanese','Javanese',
    'Kannada','Kashmiri','Kazakh','Khmer','Kikuyu','Kinyarwanda','Korean',
    'Kurdish (Kurmanji)','Kurdish (Sorani)','Kyrgyz',
    'Lao','Latin','Latvian','Lingala','Lithuanian','Luganda','Luxembourgish',
    'Macedonian','Malagasy','Malay','Malayalam','Maltese','Manipuri','Maori',
    'Marathi','Marshallese','Mizo','Mongolian',
    'Nahuatl','Ndebele','Nepali','Norwegian',
    'Oriya','Oromo','Ottoman Turkish',
    'Pashto','Persian (Farsi)','Polish','Portuguese','Portuguese (Brazilian)','Punjabi',
    'Quechua',
    'Romanian','Romansh','Russian',
    'Samoan','Sanskrit','Scottish Gaelic','Serbian','Sesotho','Shona','Sindhi',
    'Sinhalese','Slovak','Slovenian','Somali','Spanish','Spanish (Latin American)',
    'Sundanese','Swahili','Swedish',
    'Tagalog','Tajik','Tamil','Tatar','Telugu','Thai','Tibetan','Tigrinya',
    'Tongan','Tswana','Turkish','Turkmen','Twi',
    'Ukrainian','Urdu','Uyghur','Uzbek',
    'Vietnamese',
    'Welsh','Wolof',
    'Xhosa',
    'Yiddish','Yoruba','Yucatec Maya',
    'Zulu'
  ];

  -- Complex script / CJK / RTL — $0.24 / word
  complex_langs text[] := ARRAY[
    'Arabic','Burmese','Cantonese','Chinese (Simplified)','Chinese (Traditional)',
    'Dari','Hebrew','Japanese','Khmer','Korean','Lao','Mongolian',
    'Pashto','Persian (Farsi)','Thai','Tibetan','Uyghur','Yiddish'
  ];

  -- Rare / low-resource / specialized — $0.30 / word
  rare_langs text[] := ARRAY[
    'Acholi','Afar','Avar','Aymara','Balochi','Bambara','Bashkir','Breton',
    'Cebuano','Chechen','Chuvash','Cornish','Dinka','Dzongkha','Esperanto',
    'Ewe','Faroese','Frisian','Fulani','Guaraní','Hawaiian','Hmong',
    'Ilocano','Javanese','Kashmiri','Kikuyu','Kinyarwanda','Kyrgyz',
    'Latin','Lingala','Luganda','Luxembourgish','Malagasy','Manipuri',
    'Maori','Marshallese','Mizo','Nahuatl','Ndebele','Oriya','Oromo',
    'Ottoman Turkish','Quechua','Romansh','Samoan','Sanskrit',
    'Scottish Gaelic','Sesotho','Shona','Sundanese','Tigrinya',
    'Tongan','Tswana','Turkmen','Twi','Wolof','Xhosa','Yucatec Maya'
  ];

BEGIN
  FOREACH lang IN ARRAY all_langs LOOP
    -- Determine rate
    IF lang = ANY(complex_langs) THEN
      rate := 0.24;
    ELSIF lang = ANY(rare_langs) THEN
      rate := 0.30;
    ELSE
      rate := 0.18;
    END IF;

    -- English → language
    INSERT INTO language_pairs (source_lang, target_lang, per_word_rate, is_active)
    VALUES ('English', lang, rate, true)
    ON CONFLICT (source_lang, target_lang)
    DO UPDATE SET per_word_rate = EXCLUDED.per_word_rate, is_active = true;

    -- language → English
    INSERT INTO language_pairs (source_lang, target_lang, per_word_rate, is_active)
    VALUES (lang, 'English', rate, true)
    ON CONFLICT (source_lang, target_lang)
    DO UPDATE SET per_word_rate = EXCLUDED.per_word_rate, is_active = true;
  END LOOP;
END $$;

-- ── Common cross-language pairs (no English hub) ────────────────────────────
-- LA-area market: Spanish ↔ other Romance/common languages
INSERT INTO language_pairs (source_lang, target_lang, per_word_rate, is_active) VALUES
  ('Spanish', 'French',                   0.18, true),
  ('French',  'Spanish',                  0.18, true),
  ('Spanish', 'Portuguese',               0.18, true),
  ('Portuguese', 'Spanish',               0.18, true),
  ('Spanish', 'Portuguese (Brazilian)',   0.18, true),
  ('Portuguese (Brazilian)', 'Spanish',   0.18, true),
  ('Spanish', 'Italian',                  0.18, true),
  ('Italian', 'Spanish',                  0.18, true),
  ('Spanish', 'German',                   0.18, true),
  ('German',  'Spanish',                  0.18, true),
  ('Spanish', 'Spanish (Latin American)', 0.12, true),
  ('Spanish (Latin American)', 'Spanish', 0.12, true),
  ('French',  'German',                   0.18, true),
  ('German',  'French',                   0.18, true),
  ('French',  'Italian',                  0.18, true),
  ('Italian', 'French',                   0.18, true),
  ('Russian', 'Ukrainian',                0.18, true),
  ('Ukrainian','Russian',                 0.18, true),
  ('Chinese (Simplified)', 'Chinese (Traditional)', 0.18, true),
  ('Chinese (Traditional)', 'Chinese (Simplified)', 0.18, true),
  ('Chinese (Simplified)', 'Japanese',    0.24, true),
  ('Japanese', 'Chinese (Simplified)',    0.24, true),
  ('Chinese (Traditional)', 'Japanese',   0.24, true),
  ('Japanese', 'Chinese (Traditional)',   0.24, true),
  ('Korean',   'Chinese (Simplified)',    0.24, true),
  ('Chinese (Simplified)', 'Korean',      0.24, true),
  ('Arabic',   'Persian (Farsi)',         0.24, true),
  ('Persian (Farsi)', 'Arabic',           0.24, true),
  ('Arabic',   'Hebrew',                  0.24, true),
  ('Hebrew',   'Arabic',                  0.24, true),
  ('Hindi',    'Urdu',                    0.18, true),
  ('Urdu',     'Hindi',                   0.18, true),
  ('Hindi',    'Punjabi',                 0.18, true),
  ('Punjabi',  'Hindi',                   0.18, true),
  ('Tagalog',  'Spanish',                 0.18, true),
  ('Spanish',  'Tagalog',                 0.18, true),
  ('Armenian', 'Russian',                 0.18, true),
  ('Russian',  'Armenian',                0.18, true)
ON CONFLICT (source_lang, target_lang)
DO UPDATE SET per_word_rate = EXCLUDED.per_word_rate, is_active = true;
