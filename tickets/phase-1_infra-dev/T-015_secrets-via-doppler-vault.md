[T-015] Secrets via Doppler/Vault

Why: Хранить секреты в .env небезопасно. Doppler/Vault позволяют централизовать управление секретами, синхронизацию dev/staging/prod.

Scope:
• Подключить Doppler CLI (или Vault).
• Хранить все секреты (Supabase, Sentry, SMTP, Stripe) там.
• Интеграция с GitHub Actions (OIDC).
• .env.example остаётся только как справочник.

Tasks:
• Зарегистрировать проект в Doppler.
• Добавить секреты: SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY, SENTRY_DSN.
• Настроить локально:

doppler run -- pnpm dev

    •	Интегрировать в CI (GitHub OIDC → Doppler).
    •	Документация по работе с Doppler в /docs/runbook.md.

Acceptance Criteria:
• Локально doppler run pnpm dev запускает проект с секретами.
• GitHub Actions получает секреты без .env.
• .env не коммитится в git.
