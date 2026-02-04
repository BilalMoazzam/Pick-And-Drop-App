import { Home, Users, Car, FileText, CalendarDays } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Car, label: 'Rides', path: '/rides' },
  { icon: Users, label: 'Clients', path: '/passengers' },
  { icon: CalendarDays, label: 'Calendar', path: '/calendar' },
  { icon: FileText, label: 'Billing', path: '/billing' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn('nav-item', isActive && 'active')}
          >
            <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-sm font-semibold">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
