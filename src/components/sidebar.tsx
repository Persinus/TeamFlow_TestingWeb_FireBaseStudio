"use client";

import React from 'react';
import Link from 'next/link';
import { Home, Settings, Users, ChevronDown, PanelLeft } from 'lucide-react';
import { Logo } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { teams } from '@/lib/data';
import { Sidebar as RootSidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, useSidebar } from '@/components/ui/sidebar';

const NavLink = ({ href, children, icon: Icon, badge, exact = false, tooltip }: { href: string; children: React.ReactNode; icon: React.ElementType; badge?: string | number; exact?: boolean; tooltip?: string; }) => {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return (
    <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} tooltip={tooltip}>
            <Link href={href}>
                <Icon />
                <span>{children}</span>
                {badge && <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{badge}</Badge>}
            </Link>
        </SidebarMenuButton>
    </SidebarMenuItem>
  );
};


export default function Sidebar() {
  const pathname = usePathname();
  const [isTeamsOpen, setIsTeamsOpen] = React.useState(pathname.startsWith('/teams'));
  const { state } = useSidebar();


  return (
    <RootSidebar collapsible="icon" className="hidden lg:flex">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6 text-primary" />
            {state === 'expanded' && <span className="text-lg">TeamFlow</span>}
          </Link>
      </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                <NavLink href="/" icon={Home} exact tooltip="Dashboard">Dashboard</NavLink>
                <SidebarGroup>
                    <SidebarMenuButton onClick={() => setIsTeamsOpen(!isTeamsOpen)} tooltip="Teams">
                        <Users/>
                        <span>Teams</span>
                        <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", isTeamsOpen && "rotate-180")} />
                    </SidebarMenuButton>
                    {isTeamsOpen && state === 'expanded' && (
                        <div className="grid gap-1 px-8 py-2">
                        {teams.map(team => (
                            <Link
                            key={team.id}
                            href={`/teams/${team.id}`}
                            className={cn(
                                "block rounded-md px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-primary",
                                pathname === `/teams/${team.id}` && "bg-muted text-primary font-semibold"
                                )}
                            >
                            {team.name}
                            </Link>
                        ))}
                        </div>
                    )}
                </SidebarGroup>
                <NavLink href="/settings" icon={Settings} tooltip="Settings">Settings</NavLink>
            </SidebarMenu>
        </SidebarContent>
    </RootSidebar>
  );
}

export { SidebarTrigger } from '@/components/ui/sidebar';
