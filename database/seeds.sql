-- Seed data for RITAM REVIEW AGENCY (Educational Simulation)

-- 1. Default Admin: Ritam / Ritam@1234
INSERT INTO admins (id, username, name, password_hash, role)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Ritam',
    'Ritam Administrator',
    'f9b7c89d892d3f7429d3810ec5a8bc33$e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'superadmin'
) ON CONFLICT (username) DO NOTHING;

-- 2. Demo accounts deleted as requested. Pure registration state.

-- 3. Initial Simulation Task (Educational review task with mock map link)
INSERT INTO tasks (
    id, name, mock_business_name, mock_location, mock_map_link, description,
    total_slots, claimed_slots, completed_slots, payment_per_completion,
    start_date, end_date, status
) VALUES (
    't0000000-0000-0000-0000-000000000001',
    'ABC Business Educational Simulation',
    'ABC Enterprises (Simulated)',
    'Agartala, Tripura',
    '/mock-map/t0000000-0000-0000-0000-000000000001',
    'Educational practice module simulating customer feedback analysis and review verification for regional retail and electronics businesses.',
    3, 0, 0, 10.00,
    '2026-09-01', '2026-10-31', 'active'
) ON CONFLICT (id) DO NOTHING;

-- 3 Sample Comments (Exactly 3 fictional comments for 3 slots)
INSERT INTO task_comments (id, task_id, comment_text, status)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'Sample 1: Prompt customer support and polite staff at the Agartala branch. The billing process was smooth and hassle-free.', 'AVAILABLE'),
    ('c0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000002', 'Sample 2: Well-organized demo counter and knowledgeable team members. Appreciate the clear warranty guidelines provided.', 'AVAILABLE'),
    ('c0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000003', 'Sample 3: Clean ambience, good parking arrangement, and genuine product catalog. A commendable local business experience.', 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;
