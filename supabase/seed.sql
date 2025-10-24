-- Insert test user (assuming auth.users already has a test user)
-- Replace with actual test user UUID
INSERT INTO public.users (id, email, name, total_rounds, total_wins, total_losses)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'test@charmdojo.com', 'Test User', 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Insert a test game round
INSERT INTO public.game_rounds (
    id, user_id, girl_name, girl_image_url, girl_description,
    initial_meter, final_meter, result, message_count, started_at, completed_at
)
VALUES (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Emma',
    'https://placeholder.com/girl1.jpg',
    'A beautiful woman with long blonde hair and blue eyes...',
    20,
    75,
    'win',
    12,
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '30 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- Insert test messages for the round
INSERT INTO public.messages (round_id, role, content, success_delta, meter_after, category, created_at)
VALUES 
    ('10000000-0000-0000-0000-000000000001', 'user', 'Hey! I love your hiking photos', 5, 25, 'good', NOW() - INTERVAL '55 minutes'),
    ('10000000-0000-0000-0000-000000000001', 'assistant', 'Thanks! Do you hike too?', NULL, 25, NULL, NOW() - INTERVAL '54 minutes'),
    ('10000000-0000-0000-0000-000000000001', 'user', 'Yeah, just did Eagle Peak last weekend', 6, 31, 'good', NOW() - INTERVAL '50 minutes')
ON CONFLICT (id) DO NOTHING;
