-- Insert admin roles for the three specified users
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('617c2f53-acc2-4e25-bfab-c40bd7040c05', 'admin'),
  ('b18582a1-1ac5-4cd3-9615-df6d4e127efe', 'admin'),
  ('d208aea8-1aa5-44b1-93f9-8f69d986aba4', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;