
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Settings, Users, ChevronDown, PlusCircle, HelpCircle, LayoutDashboard } from 'lucide-react';
import { Logo } from '@/components/icons';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Team } from '@/types';
import { Sidebar as RootSidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, useSidebar, SidebarFooter } from '@/components/ui/sidebar';
import CreateTeamDialog from './create-team-dialog';
import { Button } from './ui/button';

const NavLink = ({ href, children, icon: Icon, exact = false, tooltip }: { href: string; children: React.ReactNode; icon: React.ElementType; exact?: boolean; tooltip?: string; }) => {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return (
    <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} tooltip={tooltip}>
            <Link href={href}>
                <Icon />
                <span>{children}</span>
            </Link>
        </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

interface SidebarProps {
  teams: Team[];
  onTeamChange: () => void;
  onShowTour: () => void;
}


export function MobileSidebar({ teams, onTeamChange, onShowTour }: SidebarProps) {
  const pathname = usePathname();
  const [isTeamsOpen, setIsTeamsOpen] = React.useState(pathname.startsWith('/teams'));
  const [isManageTeamsOpen, setManageTeamsOpen] = useState(false);

  return (
    <div className="flex h-full w-full flex-col">
       <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6 text-primary" />
            <span className="text-lg text-foreground">TeamFlow</span>
          </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
            <NavLink href="/" icon={Home} exact tooltip="Trang chủ">Trang chủ</NavLink>
            <NavLink href="/board" icon={LayoutDashboard} tooltip="Bảng điều khiển">Bảng điều khiển</NavLink>
            <SidebarGroup className="px-0">
                <SidebarMenuButton onClick={() => setIsTeamsOpen(!isTeamsOpen)} className="w-full">
                    <Users/>
                    <span>Các đội</span>
                    <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", isTeamsOpen && "rotate-180")} />
                </SidebarMenuButton>
                {isTeamsOpen && (
                    <div className="grid gap-1 pl-7 py-2">
                        {teams.map(team => (
                            <Link
                            key={team.id}
                            href={`/teams/${team.id}`}
                            className={cn(
                                "block rounded-md px-3 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                pathname === `/teams/${team.id}` && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                )}
                            >
                            {team.tenNhom}
                            </Link>
                        ))}
                         <CreateTeamDialog onTeamCreated={onTeamChange}>
                            <button className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                <PlusCircle className="h-4 w-4" />
                                <span>Tạo đội mới</span>
                            </button>
                        </CreateTeamDialog>
                    </div>
                )}
            </SidebarGroup>
            <NavLink href="/settings" icon={Settings}>Cài đặt</NavLink>
        </SidebarMenu>
      </SidebarContent>
       <SidebarFooter className="p-2">
        <Button variant="ghost" onClick={onShowTour} className="w-full justify-start gap-3 p-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <HelpCircle className="h-5 w-5" />
            <span>Hướng dẫn</span>
        </Button>
         <div className="flex items-center gap-3 p-2">
             <Logo className="h-7 w-7 text-primary" />
             <span className="font-semibold text-sidebar-foreground">TeamFlow</span>
         </div>
       </SidebarFooter>
    </div>
  );
}


export default function Sidebar({ teams, onTeamChange, onShowTour }: SidebarProps) {
  const pathname = usePathname();
  const [isTeamsOpen, setIsTeamsOpen] = React.useState(pathname.startsWith('/teams'));
  const { state } = useSidebar();

  return (
    <RootSidebar collapsible="icon" className="hidden lg:flex flex-col">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo className="h-8 w-8 text-primary" />
            {state === 'expanded' && <span className="text-lg text-sidebar-foreground">TeamFlow</span>}
          </Link>
      </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                <NavLink href="/" icon={Home} exact tooltip="Trang chủ">Trang chủ</NavLink>
                <NavLink href="/board" icon={LayoutDashboard} tooltip="Bảng điều khiển">Bảng điều khiển</NavLink>
                <SidebarGroup>
                    <SidebarMenuButton onClick={() => setIsTeamsOpen(!isTeamsOpen)} tooltip="Các đội">
                        <Users/>
                        <span>Các đội</span>
                        <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", isTeamsOpen && "rotate-180")} />
                    </SidebarMenuButton>
                    {isTeamsOpen && state === 'expanded' && (
                        <div className="grid gap-1 pl-8 py-2">
                            {teams.map(team => (
                                <Link
                                key={team.id}
                                href={`/teams/${team.id}`}
                                className={cn(
                                    "block rounded-md px-3 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    pathname === `/teams/${team.id}` && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                    )}
                                >
                                {team.tenNhom}
                                </Link>
                            ))}
                              <CreateTeamDialog onTeamCreated={onTeamChange}>
                                <button className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Tạo đội mới</span>
                                </button>
                            </CreateTeamDialog>
                        </div>
                    )}
                </SidebarGroup>
                <NavLink href="/settings" icon={Settings} tooltip="Cài đặt">Cài đặt</NavLink>
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenuButton tooltip="Hướng dẫn" className="w-full text-sidebar-foreground" onClick={onShowTour}>
                <HelpCircle />
                <span>Hướng dẫn</span>
            </SidebarMenuButton>
            <div className={cn("flex items-center gap-2 p-2 text-sidebar-foreground", state === 'collapsed' && 'justify-center')}>
                <Logo className="h-7 w-7 text-primary flex-shrink-0" />
                {state === 'expanded' && <span className="font-semibold text-sm">TeamFlow v1.0</span>}
            </div>
        </SidebarFooter>
    </RootSidebar>
  );
}

export { SidebarTrigger } from '@/components/ui/sidebar';
