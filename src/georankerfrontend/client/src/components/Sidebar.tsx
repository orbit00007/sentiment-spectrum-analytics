import { Target, Search, Users, Eye, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [, setLocation] = useLocation();

  const handleQuickAccess = (type: string) => {
    switch (type) {
      case 'topics':
        setLocation('/settings');
        break;
      case 'ai-search':
        setLocation('/analytics');
        // Small delay to ensure navigation completes before setting URL
        setTimeout(() => {
          window.history.replaceState({}, '', '/analytics?tab=ai-search');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }, 50);
        break;
      case 'community':
        setLocation('/analytics');
        setTimeout(() => {
          window.history.replaceState({}, '', '/analytics?tab=community');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }, 50);
        break;
      case 'competitor':
        setLocation('/analytics');
        setTimeout(() => {
          window.history.replaceState({}, '', '/analytics?tab=competitor');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }, 50);
        break;
    }
  };

  const quickAccessItems = [
    { icon: Target, label: "Tracked Topics & Conversations", action: () => handleQuickAccess('topics') },
    { icon: Search, label: "AI Search Visibility", action: () => handleQuickAccess('ai-search') },
    { icon: Users, label: "Community Monitoring", action: () => handleQuickAccess('community') },
    { icon: Eye, label: "Competitor Watch", action: () => handleQuickAccess('competitor') }
  ];

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 z-40">
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Quick Access
            </h3>
            <ul className="space-y-2">
              {quickAccessItems.map((item, index) => (
                <li key={index}>
                  <button onClick={item.action} className="sidebar-link w-full text-left">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Account
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/settings">
                  <span className="sidebar-link cursor-pointer">
                    <Settings className="w-4 h-4" />
                    Settings
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}
