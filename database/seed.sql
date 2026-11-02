-- =============================================================
-- Demo data. Run AFTER schema.sql (or after the backend started once).
--   Admin login : admin@testimonial.local / Admin@12345   (http://localhost:5000/admin)
--   Demo user   : demo@testimonial.local       / Demo@12345    (http://localhost:5000/login)
-- =============================================================
INSERT INTO admins (name, email, password)
VALUES ('Super Admin', 'admin@testimonial.local', '$2b$10$NmxEnP..OZUQT8XcUD.l1uabO4Z3TPVAtUvzDCNOjVm6iTRDOaw4.')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password, company)
VALUES ('Demo User', 'demo@testimonial.local', '$2b$10$t25z8M1ZYaUaRZ3N9PywYuUZHzMcajYnmPdjt2B6wwTz3Edp6sOLa', 'Acme Inc.')
ON CONFLICT (email) DO NOTHING;

INSERT INTO spaces (name, slug, header_title, custom_message, questions, owner_id)
SELECT 'Acme Inc.', 'acme', 'Share your experience with Acme',
       'We would love to hear what you think. It only takes a minute!',
       '["How has Acme helped you?","What is the best thing about it?"]'::jsonb,
       id FROM users WHERE email = 'demo@testimonial.local'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO testimonials (space_id, type, name, email, job_title, company, rating, message, is_liked)
SELECT s.id, 'text', v.name, v.email, v.job, v.company, v.rating, v.message, v.liked
FROM spaces s,
(VALUES
  ('Sarah Johnson','sarah@bloom.io','Founder','Bloom Studio',5,'We had our Wall of Love live on the website by lunch. Incredible.',true),
  ('Daniel Kim','daniel@nova.co','Product Manager','Nova',5,'Our customers love how easy it is to leave a testimonial.',true),
  ('Aisha Rahman','aisha@greenly.com','Marketing Lead','Greenly',4,'Clean, fast and no learning curve.',false)
) AS v(name,email,job,company,rating,message,liked)
WHERE s.slug = 'acme'
AND NOT EXISTS (SELECT 1 FROM testimonials t WHERE t.space_id = s.id);
