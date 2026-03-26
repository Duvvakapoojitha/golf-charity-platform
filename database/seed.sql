-- Seed Data

-- Charities
INSERT INTO charities (id, name, description, image_url, category, is_active) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'Green Earth Foundation', 'Dedicated to environmental conservation and reforestation projects worldwide.', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', 'Environment', TRUE),
('a1b2c3d4-0002-0002-0002-000000000002', 'Children First', 'Supporting underprivileged children with education and healthcare.', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400', 'Children', TRUE),
('a1b2c3d4-0003-0003-0003-000000000003', 'Ocean Rescue Alliance', 'Protecting marine ecosystems and cleaning ocean plastic pollution.', 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400', 'Environment', TRUE),
('a1b2c3d4-0004-0004-0004-000000000004', 'Hunger Relief Network', 'Providing meals and nutrition programs to food-insecure communities.', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400', 'Humanitarian', TRUE),
('a1b2c3d4-0005-0005-0005-000000000005', 'Mental Health Matters', 'Raising awareness and funding mental health support services.', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', 'Health', TRUE),
('a1b2c3d4-0006-0006-0006-000000000006', 'Animal Sanctuary Trust', 'Rescuing and rehabilitating abandoned and abused animals.', 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400', 'Animals', TRUE),
('a1b2c3d4-0007-0007-0007-000000000007', 'Education For All', 'Building schools and providing scholarships in developing nations.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400', 'Education', TRUE),
('a1b2c3d4-0008-0008-0008-000000000008', 'Clean Water Initiative', 'Delivering clean drinking water to remote and rural communities.', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', 'Humanitarian', TRUE);

-- Admin user (password: Admin@123)
INSERT INTO users (id, email, password, full_name, role, charity_id, donation_percentage) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@golfcharity.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin User', 'ADMIN', 'a1b2c3d4-0001-0001-0001-000000000001', 10);

-- Test user (password: User@123)
INSERT INTO users (id, email, password, full_name, role, charity_id, donation_percentage) VALUES
('00000000-0000-0000-0000-000000000002', 'user@golfcharity.com', '$2a$10$8K1p/a0dR1xqM8K3Qe6MouQ8lVqMqMqMqMqMqMqMqMqMqMqMqMqMq', 'Test User', 'USER', 'a1b2c3d4-0002-0002-0002-000000000002', 15);
