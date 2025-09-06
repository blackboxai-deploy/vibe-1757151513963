'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface DashboardTab {
  id: string;
  label: string;
  icon: string;
  available: boolean;
}

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: readonly DashboardTab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount?: number;
}

export default function DashboardSidebar({ 
  isOpen, 
  onClose, 
  tabs, 
  activeTab, 
  onTabChange, 
  alertCount = 0 
}: DashboardSidebarProps) {
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const showBadge = tab.id === 'alerts' && alertCount > 0;
          
          return (
            <Button
              key={tab.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left h-12",
                isActive && "bg-blue-600 text-white hover:bg-blue-700"
              )}
              onClick={() => {
                onTabChange(tab.id);
                onClose();
              }}
            >
              <span className="mr-3 text-lg">{tab.icon}</span>
              <span className="flex-1">{tab.label}</span>
              {showBadge && (
                <Badge 
                  variant={isActive ? "secondary" : "destructive"} 
                  className="ml-2 h-5 min-w-5 text-xs"
                >
                  {alertCount > 99 ? '99+' : alertCount}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t bg-gray-50">
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-800">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">24</div>
              <div className="text-xs text-gray-600">Vehicles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">18</div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{alertCount}</div>
              <div className="text-xs text-gray-600">Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">85%</div>
              <div className="text-xs text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Actions */}
      <div className="p-4 border-t">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-800">Emergency</h4>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
          >
            <span className="mr-2">🆘</span>
            Emergency Mode
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <span className="mr-2">🚨</span>
            Panic Alert
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col bg-white border-r shadow-lg h-full">
          <ScrollArea className="flex-1">
            <SidebarContent />
          </ScrollArea>
        </div>
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isOpen && window.innerWidth < 1024} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-64">
          <SheetHeader className="px-4 py-6 border-b">
            <SheetTitle className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">VTS</span>
              </div>
              <span>Navigation</span>
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 h-[calc(100vh-80px)]">
            <SidebarContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}