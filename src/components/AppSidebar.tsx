import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home,
  FileText,
  Activity,
  Settings,
  Database,
  RefreshCw,
  LogOut
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const navigationItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Logs', url: '/logs', icon: FileText },
];

interface AppSidebarProps {
  onLogout?: () => void;
}

export function AppSidebar({ onLogout }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-gray-200 text-gray-900 font-mono' : 'hover:bg-gray-100 text-gray-700 font-mono';

  return (
    <Sidebar className={`${collapsed ? 'w-14' : 'w-64'} bg-white border-r border-gray-200`} collapsible="icon">
      <SidebarTrigger className="m-2 self-end text-gray-600 hover:text-gray-900" />
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-mono text-xs uppercase tracking-wider px-3 py-2">
            {collapsed ? 'NAV' : 'Navigation'}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${getNavClass}`}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span className="font-mono">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {onLogout && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={onLogout}
                    className="flex items-center px-3 py-2 rounded-md text-sm transition-colors hover:bg-gray-100 text-gray-700 font-mono"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    {!collapsed && <span className="font-mono">Logout</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
