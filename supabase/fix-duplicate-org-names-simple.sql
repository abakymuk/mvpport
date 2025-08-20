-- =====================================================
-- Упрощенное исправление дублирующихся названий организаций
-- =====================================================

-- Показываем все организации с их названиями
SELECT id, name, created_at FROM public.orgs ORDER BY name, created_at;

-- Обновляем названия, добавляя ID для уникальности
UPDATE public.orgs 
SET name = name || ' (ID: ' || id || ')'
WHERE name IN (
  SELECT name 
  FROM public.orgs 
  GROUP BY name 
  HAVING COUNT(*) > 1
);

-- Проверяем результат
SELECT id, name, created_at FROM public.orgs ORDER BY name, created_at;

-- Создаем уникальный индекс
CREATE UNIQUE INDEX IF NOT EXISTS orgs_name_unique ON public.orgs (name);
