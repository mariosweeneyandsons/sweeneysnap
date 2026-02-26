"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminProfile } from "@/types/database";
import { UserProfilePopover } from "./UserProfilePopover";
import { ThemeToggle } from "./ThemeToggle";

interface UserIdentity {
  name: string | null;
  email: string | null;
  image: string | null;
}

interface AdminSidebarProps {
  profile: AdminProfile;
  userIdentity?: UserIdentity | null;
  open?: boolean;
  onClose?: () => void;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
  { href: "/admin/presets", label: "Presets", icon: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" },
  { href: "/admin/accounts", label: "Accounts", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
];

export function AdminSidebar({ profile, userIdentity, open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 w-64 bg-secondary border-r border-border flex flex-col p-4 z-40 transition-transform duration-200 ${
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-foreground">SweeneySnap</h2>
          <p className="text-foreground-muted text-sm">Admin Panel</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-xs text-foreground-muted hover:text-foreground hover:bg-surface transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xs text-sm transition-colors ${
                isActive
                  ? "bg-surface text-foreground-emphasis"
                  : "text-foreground-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border pt-4 mt-4 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {userIdentity ? (
            <UserProfilePopover
              identity={userIdentity}
              displayName={profile.displayName}
            />
          ) : (
            <p className="text-sm text-foreground-muted">{profile.displayName}</p>
          )}
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
