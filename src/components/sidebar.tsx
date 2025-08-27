"use client";

import React from 'react';
import Link from 'next/link';
import { Home, Settings, Users, ChevronDown } from 'lucide-react';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { teams } from '@/lib/data';

const NavLink = ({ href, children, icon: Icon, badge }: { href: string; children: React.ReactNode; icon: React.ElementType; badge?: string | number; }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-muted text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
      {badge && <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{badge}</Badge>}
    </Link>
  );
};

export default function Sidebar() {
  const [isTeamsOpen, setIsTeamsOpen] = React.useState(true);

  return (
    <aside className="hidden border-r bg-background lg:block lg:w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6 text-primary" />
            <span className="">TeamFlow</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            <NavLink href="/" icon={Home}>Dashboard</NavLink>
             <Collapsible open={isTeamsOpen} onOpenChange={setIsTeamsOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                  <Users className="h-4 w-4" />
                  Teams
                  <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    {teams.length}
                  </Badge>
                  <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", isTeamsOpen && "rotate-180")} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid gap-1 px-8 py-2">
                  {teams.map(team => (
                    <Link
                      key={team.id}
                      href="#"
                      className="block rounded-md px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                    >
                      {team.name}
                    </Link>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
            <NavLink href="#" icon={Settings}>Settings</NavLink>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Upgrade to Pro</CardTitle>
              <CardDescription>
                Unlock all features and get unlimited access to our support
                team.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                Upgrade
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </aside>
  );
}
