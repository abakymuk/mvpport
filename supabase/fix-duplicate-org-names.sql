-- =====================================================
-- Исправление дублирующихся названий организаций
-- =====================================================

-- Находим дублирующиеся названия организаций
WITH duplicates AS (
  SELECT name, COUNT(*) as count
  FROM public.orgs
  GROUP BY name
  HAVING COUNT(*) > 1
)
SELECT name, count FROM duplicates;

-- Обновляем дублирующиеся названия, добавляя номер
UPDATE public.orgs 
SET name = name || ' (' || 
  (SELECT COUNT(*) + 1 
   FROM public.orgs o2 
   WHERE o2.name = public.orgs.name 
   AND o2.created_at <= public.orgs.created_at) || ')'
WHERE name IN (
  SELECT name 
  FROM public.orgs 
  GROUP BY name 
  HAVING COUNT(*) > 1
);

-- Проверяем, что дубликаты исправлены
SELECT name, COUNT(*) as count
FROM public.orgs
GROUP BY name
HAVING COUNT(*) > 1;

-- Теперь можно создать уникальный индекс
CREATE UNIQUE INDEX IF NOT EXISTS orgs_name_unique ON public.orgs (name);
