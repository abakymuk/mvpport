отлично, давай доведём [T-041] до боевого состояния прямо на твоём коде: уберём дубли, добавим выбор компании (org switcher), нормальный header, аккуратные скелетоны/ошибки, и подготовим точки интеграции c Supabase.

ниже — готовые вставки. копируй по файлам 1:1.

⸻

1. app/(app)/dashboard/page.tsx — серверный экран с header (org switcher + breadcrumbs)

// app/(app)/dashboard/page.tsx
import { Suspense } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { HeaderBar } from "./\_parts/header-bar"
import { DashboardGrid } from "./\_parts/dashboard-grid"
import { SkeletonGrid } from "./\_parts/skeletons"
import { getCurrentUser, getUserOrgs, getActiveOrg } from "@/lib/auth-org"

export default async function Page() {
// server-side fetch (Supabase/DB)
const user = await getCurrentUser()
const orgs = user ? await getUserOrgs(user.id) : []
const activeOrg = user ? await getActiveOrg(user.id, orgs) : null

return (
<SidebarProvider>
<AppSidebar user={user} orgs={orgs} activeOrgId={activeOrg?.id ?? null} />
<SidebarInset>
<HeaderBar user={user} orgs={orgs} activeOrg={activeOrg} />

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Suspense fallback={<SkeletonGrid />}>
            <DashboardGrid orgId={activeOrg?.id ?? undefined} />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>

)
}

⸻

2. app/(app)/dashboard/\_parts/header-bar.tsx — заголовок: триггер сайдбара, хлебные крошки, переключатель компании, юзер-меню

// app/(app)/dashboard/\_parts/header-bar.tsx
"use client"

import { usePathname } from "next/navigation"
import {
SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
Breadcrumb, BreadcrumbItem, BreadcrumbLink,
BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { OrgSwitcher } from "@/components/org-switcher"
import { NavUser } from "@/components/nav-user"

type HeaderBarProps = {
user: { id: string; name?: string; email?: string; avatarUrl?: string } | null
orgs: { id: string; name: string }[]
activeOrg: { id: string; name: string } | null
}

export function HeaderBar({ user, orgs, activeOrg }: HeaderBarProps) {
const pathname = usePathname()
const parts = pathname.split("/").filter(Boolean)

return (
<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear px-4">
<SidebarTrigger className="-ml-1" />
<Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb className="hidden md:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          {parts.slice(2).map((p, i, arr) => (
            <div key={i} className="flex items-center">
              <BreadcrumbSeparator />
              {i === arr.length - 1 ? (
                <BreadcrumbItem><BreadcrumbPage>{p}</BreadcrumbPage></BreadcrumbItem>
              ) : (
                <BreadcrumbItem><BreadcrumbLink href={"/" + parts.slice(0, i + 3).join("/")}>{p}</BreadcrumbLink></BreadcrumbItem>
              )}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <OrgSwitcher orgs={orgs} activeOrgId={activeOrg?.id ?? null} />
        <NavUser user={{
          name: user?.name ?? "User",
          email: user?.email ?? "",
          avatar: user?.avatarUrl ?? "/avatars/placeholder.png",
        }}/>
      </div>
    </header>

)
}

⸻

3. components/org-switcher.tsx — переключатель компании (UX: поиск + метки)

// components/org-switcher.tsx
"use client"

import \* as React from "react"
import { ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command"
import {
Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import { saveActiveOrg } from "@/lib/org-client"

type Org = { id: string; name: string }

export function OrgSwitcher({
orgs,
activeOrgId,
}: {
orgs: Org[]
activeOrgId: string | null
}) {
const [open, setOpen] = React.useState(false)
const active = orgs.find(o => o.id === activeOrgId) ?? null

const handleSelect = async (orgId: string) => {
await saveActiveOrg(orgId) // client action → сервер сохранит и перерендерит
setOpen(false)
}

return (
<Popover open={open} onOpenChange={setOpen}>
<PopoverTrigger asChild>
<Button variant="outline" size="sm" role="combobox" aria-expanded={open} className="w-56 justify-between">
<span className="truncate">{active?.name ?? "Select company"}</span>
<ChevronsUpDown className="ml-2 size-4 opacity-50" />
</Button>
</PopoverTrigger>
<PopoverContent className="w-64 p-0" sideOffset={8}>
<Command>
<CommandInput placeholder="Search company..." />
<CommandList>
<CommandEmpty>No companies found.</CommandEmpty>
<CommandGroup heading="Companies">
{orgs.map((org) => (
<CommandItem
key={org.id}
onSelect={() => handleSelect(org.id)}
className="cursor-pointer" >
<Check className={cn("mr-2 size-4", activeOrgId === org.id ? "opacity-100" : "opacity-0")} />
<span className="truncate">{org.name}</span>
</CommandItem>
))}
</CommandGroup>
<CommandGroup heading="Actions">
<CommandItem onSelect={() => location.assign("/settings/organization?new=1")}> + Create organization
</CommandItem>
<CommandItem onSelect={() => location.assign("/settings/organization")}>
Manage organizations
</CommandItem>
</CommandGroup>
</CommandList>
</Command>
</PopoverContent>
</Popover>
)
}

⸻

4. components/app-sidebar.tsx — сайдбар: используем твои NavMain/NavProjects/NavUser (убираем дубликат NavUser), поддержка орг‑контекста

// components/app-sidebar.tsx
"use client"

import \* as React from "react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { GalleryVerticalEnd, AudioWaveform, Command } from "lucide-react"

const defaultNav = [
{ title: "Dashboard", url: "/dashboard", icon: GalleryVerticalEnd, isActive: true, items: [] },
{ title: "Reports", url: "/dashboard/reports", icon: AudioWaveform, items: [] },
{ title: "Settings", url: "/settings", icon: Command, items: [
{ title: "General", url: "/settings" },
{ title: "Members", url: "/members" },
{ title: "Billing", url: "/settings/billing" },
]},
]

export function AppSidebar({
user,
orgs,
activeOrgId,
...props
}: React.ComponentProps<typeof Sidebar> & {
user: { name?: string; email?: string; avatarUrl?: string } | null
orgs: { id: string; name: string }[]
activeOrgId: string | null
}) {
return (
<Sidebar collapsible="icon" {...props}>
<SidebarHeader>
{/_ место для логотипа/названия приложения _/}
<div className="px-2 py-3 text-sm font-semibold">YourApp</div>
</SidebarHeader>
<SidebarContent>
<NavMain items={defaultNav} />
<NavProjects projects={orgs.map(o => ({ name: o.name, url: `/dashboard?org=${o.id}`, icon: GalleryVerticalEnd }))}/>
</SidebarContent>
<SidebarFooter>
<NavUser user={{
          name: user?.name ?? "User",
          email: user?.email ?? "",
          avatar: user?.avatarUrl ?? "/avatars/placeholder.png",
        }}/>
</SidebarFooter>
<SidebarRail />
</Sidebar>
)
}

Примечание: твои компоненты NavMain, NavProjects, NavUser из сообщения подходят — просто перестань экспортировать AppSidebar внутри того же файла (разнесли), и убери второй дубликат NavUser из конца сообщения.

⸻

5. Скрин‑каркас и грид

// app/(app)/dashboard/\_parts/skeletons.tsx
export function SkeletonGrid() {
return (
<div className="flex flex-1 flex-col gap-4">
<div className="grid auto-rows-min gap-4 md:grid-cols-3">
<div className="bg-muted/50 aspect-video rounded-xl animate-pulse" />
<div className="bg-muted/50 aspect-video rounded-xl animate-pulse" />
<div className="bg-muted/50 aspect-video rounded-xl animate-pulse" />
</div>
<div className="bg-muted/50 min-h-[60vh] flex-1 rounded-xl animate-pulse" />
</div>
)
}

// app/(app)/dashboard/\_parts/dashboard-grid.tsx
"use client"

import { useEffect } from "react"

export function DashboardGrid({ orgId }: { orgId?: string }) {
useEffect(() => {
// здесь можно дернуть kpi fetch по orgId
}, [orgId])

return (
<div className="flex flex-1 flex-col gap-4">
<div className="grid auto-rows-min gap-4 md:grid-cols-3">
<div className="rounded-xl border p-4">KPI #1</div>
<div className="rounded-xl border p-4">KPI #2</div>
<div className="rounded-xl border p-4">KPI #3</div>
</div>
<div className="rounded-xl border p-4 min-h-[60vh]">Main content</div>
</div>
)
}

⸻

6. Клиентские действия для смены компании

// lib/org-client.ts
"use server"

import { cookies } from "next/headers"
import { setActiveOrgServer } from "./org-server"

// server action, вызывается из OrgSwitcher
export async function saveActiveOrg(orgId: string) {
await setActiveOrgServer(orgId)
// опционально: положить cookie для SSR-подсказки
cookies().set("active_org_id", orgId, { httpOnly: true, sameSite: "lax", path: "/" })
}

// lib/auth-org.ts (server)
import { cookies } from "next/headers"
// импортируй supabase server client
export async function getCurrentUser() {
// верни { id, name, email, avatarUrl }
return null // TODO: интеграция с Supabase
}

export async function getUserOrgs(userId: string) {
// верни [{id,name},...]
return []
}

export async function getActiveOrg(userId: string, orgs: {id:string;name:string}[]) {
const cookieId = cookies().get("active_org_id")?.value
const candidate = (cookieId && orgs.find(o => o.id === cookieId)) || orgs[0]
return candidate ?? null
}

// фактическое сохранение (в профиле пользователя)
export async function setActiveOrgServer(orgId: string) {
// update profiles.active_org_id = orgId
}

⸻

7. UX и мелкие правки
   • ARIA/клавиатура: у OrgSwitcher и NavUser есть фокус‑состояния и понятные aria-\*.
   • Брейкпоинт: сайдбар сворачивается на md и ниже; SidebarTrigger всегда доступен.
   • Навигация: в NavProjects проекты — это компании (быстрый переход), но активная компания меняется через OrgSwitcher, чтобы UX был консистентным.
   • Дубли кода: в твоём фрагменте NavUser определён дважды — оставь один экспорт.
   • Breadcrumbs: теперь строятся автоматически от pathname, «Dashboard › ».

⸻

если хочешь, продолжу и добавлю:
• готовый KpiCard + DateRangePicker (shadcn),
• серверные ручки /api/kpi с кэшем,
• и мок‑данные для демо‑организации из [T‑043].
