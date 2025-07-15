import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  FileText, 
  Users, 
  Briefcase, 
  Image, 
  MessageSquare, 
  UserCog,
  Settings,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  {
    id: "content",
    label: "Content Management",
    icon: FileText,
    items: [
      { id: "hero", label: "Hero Section", icon: Home },
      { id: "about", label: "About Section", icon: FileText },
      { id: "services", label: "Services", icon: Briefcase },
      { id: "portfolio", label: "Portfolio", icon: Image },
    ]
  },
  {
    id: "communication",
    label: "Communication",
    icon: MessageSquare,
    items: [
      { id: "contact", label: "Contact Submissions", icon: MessageSquare },
    ]
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
    items: [
      { id: "users-list", label: "All Users", icon: Users },
      { id: "user-roles", label: "User Roles", icon: UserCog },
    ]
  },
  {
    id: "system",
    label: "System",
    icon: Settings,
    items: [
      { id: "settings", label: "Settings", icon: Settings },
    ]
  }
];

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["content", "communication", "users"]);
  
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isGroupExpanded = (groupId: string) => expandedGroups.includes(groupId);

  return (
    <div className="w-64 bg-card border-r border-border h-full">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Admin Panel
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Management Dashboard</p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          {menuItems.map((group) => (
            <Collapsible
              key={group.id}
              open={isGroupExpanded(group.id)}
              onOpenChange={() => toggleGroup(group.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-left font-medium"
                >
                  <div className="flex items-center gap-2">
                    <group.icon className="h-4 w-4" />
                    <span>{group.label}</span>
                  </div>
                  {isGroupExpanded(group.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-1 ml-6 mt-1">
                {group.items.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start text-left",
                      activeSection === item.id && "bg-secondary text-secondary-foreground"
                    )}
                    onClick={() => onSectionChange(item.id)}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}