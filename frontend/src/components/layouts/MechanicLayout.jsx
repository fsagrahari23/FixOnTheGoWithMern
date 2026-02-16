import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authThunks';
import { NotificationCenter } from '../notifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { LogOut, User as UserIcon, Bell } from 'lucide-react';

export function MechanicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showFullNav, setShowFullNav] = useState(true);
  const address = useSelector((s) => s.location?.address);
  const { unreadCount } = useSelector((s) => s.notifications);
  const { user } = useSelector((s) => s.auth);

  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (err) {
      console.warn('Logout thunk failed:', err);
    } finally {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        localStorage.removeItem('email');
        localStorage.removeItem('avatar');
      } catch (e) {
        // ignore
      }
      window.location.href = '/auth/login';
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 13H10V19H4V13Z" fill="currentColor" />
          <path d="M4 5H10V11H4V5Z" fill="currentColor" />
          <path d="M14 13H20V19H14V13Z" fill="currentColor" />
          <path d="M14 5H20V11H14V5Z" fill="currentColor" />
        </svg>
      ),
      path: '/mechanic/dashboard'
    },
    {
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      notifications: true
    },
    {
      label: 'History',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      path: '/mechanic/history'
    },
    {
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      path: '/mechanic/profile'
    }
  ];

  const getUserInitials = () => {
    const name = user?.name || localStorage.getItem('name');
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`${showFullNav ? 'w-64' : 'w-16'} bg-card text-card-foreground flex flex-col border-r transition-all duration-300`}>
        {/* Logo */}
        <div className="p-4 border-b flex items-center">
          <h1 className={`font-semibold ${!showFullNav ? 'text-center' : ''}`}>
            {showFullNav ? 'FixOnTheGo' : 'FG'}
          </h1>
        </div>

        {/* User type and toggle */}
        <div className="p-3 border-b flex items-center justify-between">
          {showFullNav ? (
            <>
              <div className="flex items-center">
                <span className="ml-2 font-medium">Mechanic</span>
              </div>
              <button
                onClick={() => setShowFullNav(false)}
                aria-label="Collapse sidebar"
                className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center">
              <button
                onClick={() => setShowFullNav(true)}
                aria-label="Expand sidebar"
                className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            // Special handling for notifications - use centralized NotificationCenter
            if (item.notifications) {
              return (
                <div key="notifications" className="relative my-1 mx-2">
                  <div
                    className={`flex items-center px-4 py-2 rounded-lg w-full text-muted-foreground hover:bg-muted ${showFullNav ? '' : 'justify-center'}`}
                  >
                    <div className="relative">
                      {item.icon}
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    {showFullNav && <span className="ml-3">{item.label}</span>}
                    <div className={showFullNav ? 'ml-auto' : 'ml-0'}>
                      <NotificationCenter />
                    </div>
                  </div>
                </div>
              );
            }

            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 my-1 mx-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <div className="w-5 h-5">{item.icon}</div>
                {showFullNav && <span className="ml-3">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t">
          <Button
            variant="destructive"
            className="w-full flex items-center justify-center"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            {showFullNav && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-background">
        {/* Top header */}
        <header className="flex items-center justify-between px-6 py-3 border-b bg-card">
          <div className="flex items-center gap-4">
            <button title="Location" className="p-2 rounded-full hover:bg-muted">
              <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="8" r="2" fill="currentColor" />
              </svg>
            </button>
            <div className="px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground max-w-[720px] truncate">
              {address || 'Select service location'}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              title="Toggle theme"
              className="p-2 rounded-full hover:bg-muted"
              onClick={() => document.documentElement.classList.toggle('dark')}
            >
              <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profilePicture || user?.avatar} alt={user?.name || 'User'} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || ''}</p>
                  <p className="text-xs leading-none text-primary font-medium capitalize">Mechanic</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/mechanic/profile')}>
                  <UserIcon className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
