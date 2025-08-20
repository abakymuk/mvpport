-- Демо данные для MVP Port
-- Выполните этот файл в Supabase SQL Editor после создания схемы

-- Внимание: Эти данные созданы для тестирования
-- В продакшене используйте реальных пользователей

-- Создание демо пользователей (если они еще не существуют)
-- Примечание: ID пользователей должны соответствовать реальным пользователям в auth.users

-- Демо профили (раскомментируйте и измените user_id на реальные ID)
-- INSERT INTO public.profiles (user_id, display_name, locale) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'Demo User 1', 'ru'),
--   ('00000000-0000-0000-0000-000000000002', 'Demo User 2', 'ru')
-- ON CONFLICT (user_id) DO NOTHING;

-- Демо организации
INSERT INTO public.orgs (id, name, owner_id) VALUES
  ('demo-organization-id', 'Demo Organization', '00000000-0000-0000-0000-000000000001'),
  ('test-company-id', 'Test Company', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- Демо членства
INSERT INTO public.memberships (user_id, org_id, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo-organization-id', 'OWNER'),
  ('00000000-0000-0000-0000-000000000002', 'test-company-id', 'OWNER'),
  ('00000000-0000-0000-0000-000000000002', 'demo-organization-id', 'MEMBER')
ON CONFLICT (user_id, org_id) DO NOTHING;

-- Проверка созданных данных
SELECT 
  'profiles' as table_name,
  COUNT(*) as record_count
FROM public.profiles
UNION ALL
SELECT 
  'orgs' as table_name,
  COUNT(*) as record_count
FROM public.orgs
UNION ALL
SELECT 
  'memberships' as table_name,
  COUNT(*) as record_count
FROM public.memberships;
