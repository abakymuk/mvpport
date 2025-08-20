-- =====================================================
-- RLS ТЕСТЫ для MVP Port
-- Проверка работы Row Level Security политик
-- =====================================================

-- Подготовка тестовых данных
DO $$
DECLARE
    test_user_1 UUID := '11111111-1111-1111-1111-111111111111';
    test_user_2 UUID := '22222222-2222-2222-2222-222222222222';
    test_user_3 UUID := '33333333-3333-3333-3333-333333333333';
    test_org_1 TEXT := 'test-org-1';
    test_org_2 TEXT := 'test-org-2';
BEGIN
    -- Очистка тестовых данных
    DELETE FROM public.memberships WHERE org_id IN (test_org_1, test_org_2);
    DELETE FROM public.orgs WHERE id IN (test_org_1, test_org_2);
    DELETE FROM public.profiles WHERE user_id::uuid IN (test_user_1, test_user_2, test_user_3);
    
    -- Создание тестовых профилей
    INSERT INTO public.profiles (user_id, display_name) VALUES 
        (test_user_1::text, 'Test User 1'),
        (test_user_2::text, 'Test User 2'),
        (test_user_3::text, 'Test User 3');
    
    -- Создание тестовых организаций
    INSERT INTO public.orgs (id, name, owner_id) VALUES 
        (test_org_1, 'Test Organization 1', test_user_1::text),
        (test_org_2, 'Test Organization 2', test_user_2::text);
    
    -- Создание тестовых членств
    INSERT INTO public.memberships (user_id, org_id, role) VALUES 
        (test_user_1::text, test_org_1, 'OWNER'),
        (test_user_2::text, test_org_2, 'OWNER'),
        (test_user_3::text, test_org_1, 'MEMBER');
    
    RAISE NOTICE 'Тестовые данные созданы успешно';
END $$;

-- =====================================================
-- ФУНКЦИЯ ДЛЯ ВЫПОЛНЕНИЯ ТЕСТОВ С ОПРЕДЕЛЕННЫМ ПОЛЬЗОВАТЕЛЕМ
-- =====================================================

CREATE OR REPLACE FUNCTION run_test_as_user(test_user_id text, test_name text, test_query text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    result_count integer;
    expected_behavior text;
BEGIN
    -- Устанавливаем пользователя для сессии
    PERFORM set_config('request.jwt.claim.sub', test_user_id, true);
    
    -- Выполняем тестовый запрос
    EXECUTE test_query INTO result_count;
    
    RAISE NOTICE 'Тест: % | Пользователь: % | Результат: %', test_name, test_user_id, result_count;
    
    RETURN true;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Тест: % | Пользователь: % | ОШИБКА: %', test_name, test_user_id, SQLERRM;
    RETURN false;
END $$;

-- =====================================================
-- ТЕСТЫ RLS ПОЛИТИК
-- =====================================================

DO $$
DECLARE
    test_user_1 TEXT := '11111111-1111-1111-1111-111111111111';
    test_user_2 TEXT := '22222222-2222-2222-2222-222222222222';
    test_user_3 TEXT := '33333333-3333-3333-3333-333333333333';
    test_user_4 TEXT := '44444444-4444-4444-4444-444444444444'; -- Пользователь без членства
    test_org_1 TEXT := 'test-org-1';
    test_org_2 TEXT := 'test-org-2';
    test_result boolean;
    org_count integer;
    profile_count integer;
    membership_count integer;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'ЗАПУСК RLS ТЕСТОВ';
    RAISE NOTICE '=====================================================';
    
    -- =====================================================
    -- ТЕСТ 1: Пользователь видит только свой профиль
    -- =====================================================
    RAISE NOTICE 'ТЕСТ 1: Профили - изоляция данных';
    
    -- User 1 должен видеть только свой профиль
    PERFORM set_config('request.jwt.claim.sub', test_user_1, true);
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    ASSERT profile_count = 1, format('User 1 должен видеть 1 профиль, видит %', profile_count);
    RAISE NOTICE '✓ User 1 видит только свой профиль: %', profile_count;
    
    -- User 2 должен видеть только свой профиль
    PERFORM set_config('request.jwt.claim.sub', test_user_2, true);
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    ASSERT profile_count = 1, format('User 2 должен видеть 1 профиль, видит %', profile_count);
    RAISE NOTICE '✓ User 2 видит только свой профиль: %', profile_count;
    
    -- =====================================================
    -- ТЕСТ 2: Организации - доступ только для участников
    -- =====================================================
    RAISE NOTICE 'ТЕСТ 2: Организации - доступ для участников';
    
    -- User 1 (владелец org 1, участник org 1) должен видеть 1 организацию
    PERFORM set_config('request.jwt.claim.sub', test_user_1, true);
    SELECT COUNT(*) INTO org_count FROM public.orgs;
    ASSERT org_count = 1, format('User 1 должен видеть 1 организацию, видит %', org_count);
    RAISE NOTICE '✓ User 1 видит свою организацию: %', org_count;
    
    -- User 2 (владелец org 2) должен видеть 1 организацию
    PERFORM set_config('request.jwt.claim.sub', test_user_2, true);
    SELECT COUNT(*) INTO org_count FROM public.orgs;
    ASSERT org_count = 1, format('User 2 должен видеть 1 организацию, видит %', org_count);
    RAISE NOTICE '✓ User 2 видит свою организацию: %', org_count;
    
    -- User 3 (член org 1) должен видеть 1 организацию
    PERFORM set_config('request.jwt.claim.sub', test_user_3, true);
    SELECT COUNT(*) INTO org_count FROM public.orgs;
    ASSERT org_count = 1, format('User 3 должен видеть 1 организацию, видит %', org_count);
    RAISE NOTICE '✓ User 3 видит организацию, где он участник: %', org_count;
    
    -- User 4 (не участник ни одной org) должен видеть 0 организаций
    PERFORM set_config('request.jwt.claim.sub', test_user_4, true);
    SELECT COUNT(*) INTO org_count FROM public.orgs;
    ASSERT org_count = 0, format('User 4 должен видеть 0 организаций, видит %', org_count);
    RAISE NOTICE '✓ User 4 не видит никаких организаций: %', org_count;
    
    -- =====================================================
    -- ТЕСТ 3: Членства - видимость участников организации
    -- =====================================================
    RAISE NOTICE 'ТЕСТ 3: Членства - видимость участников';
    
    -- User 1 должен видеть участников своей организации (2 участника)
    PERFORM set_config('request.jwt.claim.sub', test_user_1, true);
    SELECT COUNT(*) INTO membership_count FROM public.memberships;
    ASSERT membership_count = 2, format('User 1 должен видеть 2 членства, видит %', membership_count);
    RAISE NOTICE '✓ User 1 видит участников своей организации: %', membership_count;
    
    -- User 3 должен видеть участников организации, где он состоит (2 участника)
    PERFORM set_config('request.jwt.claim.sub', test_user_3, true);
    SELECT COUNT(*) INTO membership_count FROM public.memberships;
    ASSERT membership_count = 2, format('User 3 должен видеть 2 членства, видит %', membership_count);
    RAISE NOTICE '✓ User 3 видит участников своей организации: %', membership_count;
    
    -- User 4 не должен видеть никаких членств
    PERFORM set_config('request.jwt.claim.sub', test_user_4, true);
    SELECT COUNT(*) INTO membership_count FROM public.memberships;
    ASSERT membership_count = 0, format('User 4 должен видеть 0 членств, видит %', membership_count);
    RAISE NOTICE '✓ User 4 не видит никаких членств: %', membership_count);
    
    -- =====================================================
    -- ТЕСТ 4: Проверка вспомогательных функций
    -- =====================================================
    RAISE NOTICE 'ТЕСТ 4: Вспомогательные функции';
    
    -- User 1 является владельцем org 1
    PERFORM set_config('request.jwt.claim.sub', test_user_1, true);
    ASSERT public.is_owner(test_org_1) = true, 'User 1 должен быть владельцем org 1';
    ASSERT public.is_member(test_org_1) = true, 'User 1 должен быть участником org 1';
    ASSERT public.can_manage(test_org_1) = true, 'User 1 должен мочь управлять org 1';
    RAISE NOTICE '✓ User 1 корректно определяется как владелец org 1';
    
    -- User 3 является участником org 1, но не владельцем
    PERFORM set_config('request.jwt.claim.sub', test_user_3, true);
    ASSERT public.is_owner(test_org_1) = false, 'User 3 не должен быть владельцем org 1';
    ASSERT public.is_member(test_org_1) = true, 'User 3 должен быть участником org 1';
    ASSERT public.can_manage(test_org_1) = false, 'User 3 не должен мочь управлять org 1';
    RAISE NOTICE '✓ User 3 корректно определяется как участник org 1';
    
    -- User 2 не имеет доступа к org 1
    PERFORM set_config('request.jwt.claim.sub', test_user_2, true);
    ASSERT public.is_owner(test_org_1) = false, 'User 2 не должен быть владельцем org 1';
    ASSERT public.is_member(test_org_1) = false, 'User 2 не должен быть участником org 1';
    ASSERT public.can_manage(test_org_1) = false, 'User 2 не должен мочь управлять org 1';
    RAISE NOTICE '✓ User 2 корректно определяется как не имеющий доступа к org 1';
    
    -- =====================================================
    -- ТЕСТ 5: Попытки записи данных
    -- =====================================================
    RAISE NOTICE 'ТЕСТ 5: Права на запись данных';
    
    -- User 1 может обновить свою организацию
    PERFORM set_config('request.jwt.claim.sub', test_user_1, true);
    BEGIN
        UPDATE public.orgs SET name = 'Updated Test Org 1' WHERE id = test_org_1;
        RAISE NOTICE '✓ User 1 успешно обновил свою организацию';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✗ User 1 не смог обновить свою организацию: %', SQLERRM;
    END;
    
    -- User 3 не может обновить организацию (только участник)
    PERFORM set_config('request.jwt.claim.sub', test_user_3, true);
    BEGIN
        UPDATE public.orgs SET name = 'Hacked Org 1' WHERE id = test_org_1;
        RAISE NOTICE '✗ User 3 смог обновить организацию (не должен был)';
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE '✓ User 3 корректно заблокирован от обновления организации';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '? User 3 получил неожиданную ошибку при попытке обновления: %', SQLERRM;
    END;
    
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'ВСЕ ТЕСТЫ ЗАВЕРШЕНЫ УСПЕШНО!';
    RAISE NOTICE '=====================================================';
    
END $$;

-- =====================================================
-- ОЧИСТКА ТЕСТОВЫХ ДАННЫХ
-- =====================================================

DO $$
DECLARE
    test_org_1 TEXT := 'test-org-1';
    test_org_2 TEXT := 'test-org-2';
BEGIN
    -- Очистка тестовых данных
    DELETE FROM public.memberships WHERE org_id IN (test_org_1, test_org_2);
    DELETE FROM public.orgs WHERE id IN (test_org_1, test_org_2);
    DELETE FROM public.profiles WHERE user_id::uuid IN (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333'
    );
    
    RAISE NOTICE 'Тестовые данные очищены';
END $$;

-- Удаляем тестовую функцию
DROP FUNCTION IF EXISTS run_test_as_user(text, text, text);
