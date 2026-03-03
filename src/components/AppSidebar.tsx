import { LayoutDashboard, Settings, FileText } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useApp } from '@/contexts/AppContext';
import minsaLogo from '@/assets/minsa-logo.png';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { data } = useApp();

  const suratItems = data.settings.jenisSurat.map(js => ({
    title: js.label, url: `/surat/${js.slug}`, icon: FileText,
  }));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar/50 backdrop-blur-sm">
      <SidebarContent>
        <div className="flex flex-col items-center gap-1 px-3 py-4">
          <img src={minsaLogo} alt="MINSA" className={`rounded-full ${collapsed ? 'w-10 h-10' : 'w-20 h-20'} object-cover transition-all`} />
          {!collapsed && (
            <>
              <span className="font-bold text-base text-sidebar-foreground tracking-wide">MINSA</span>
              <span className="text-xs text-muted-foreground">Manajemen Surat</span>
            </>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold tracking-wider uppercase">
            {!collapsed && 'Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {suratItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-bold tracking-wider uppercase">
              {!collapsed && 'Surat'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {suratItems.map(item => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/pengaturan" className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                <Settings className="mr-2 h-4 w-4" />
                {!collapsed && <span>Pengaturan</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
