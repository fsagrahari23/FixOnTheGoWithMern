import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authThunks';
import { useLocation as useAppLocation } from '../../contexts/LocationContext';

export function MechanicLayout() {
  const location = useLocation();
  const [showFullNav, setShowFullNav] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const address = useSelector((s) => s.location?.address);

  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (err) {
      // If logout fails, still clear local storage
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
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 17H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 8C18 5.23858 15.7614 3 13 3H11C8.23858 3 6 5.23858 6 8V11C6 13.7614 4 15 4 15H20C20 15 18 13.7614 18 11V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21C13.5547 21.3033 13.3017 21.5547 12.9966 21.7356C12.6915 21.9166 12.3466 22.0211 11.9966 22.0401C11.6467 22.059 11.3015 21.9921 10.9866 21.8456C10.6718 21.6991 10.3989 21.4762 10.1893 21.1921" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
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

  // Access socket from LocationContext to receive realtime notifications
  const appCtx = useAppLocation();
  const socket = appCtx?.socket;

  // listen for incoming notifications from server
  useEffect(() => {
    if (!socket) return;
    const pushNotification = (type, payload) => {
      setNotifications((prev) => [{ id: Date.now() + Math.random(), type, title: payload.title || type, message: payload.message || JSON.stringify(payload), time: Date.now(), read: false }, ...prev]);
    };

    socket.on('notification', (payload) => pushNotification('notification', payload));
    socket.on('service-request', (payload) => pushNotification('service-request', payload));
    socket.on('payment', (payload) => pushNotification('payment', payload));
    socket.on('profile-updated', (payload) => pushNotification('profile-updated', payload));

    return () => {
      try { socket.off('notification'); socket.off('service-request'); socket.off('payment'); socket.off('profile-updated'); } catch (e) { }
    };
  }, [socket]);

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

  {/* User type and toggle placed below the logo */}
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
            // Special handling for notifications entry
            if (item.notifications) {
              const unread = notifications.filter(n => !n.read).length;
              return (
                <div key="notifications" className="relative my-1 mx-2">
                  <button
                    onClick={() => {
                      setNotifOpen((v) => !v);
                      // mark all as read when opening
                      if (!notifOpen) setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
                    }}
                    className={`flex items-center px-4 py-2 rounded-lg w-full text-left ${showFullNav ? '' : 'justify-center'}`}
                  >
                    <div className="w-5 h-5 relative">{item.icon}
                      {unread > 0 && <span className="absolute -right-1 -top-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{unread}</span>}
                    </div>
                    {showFullNav && <span className="ml-3">{item.label}</span>}
                  </button>

                  {notifOpen && showFullNav && (
                    <div className="absolute left-full ml-2 top-0 w-80 bg-popover text-popover-foreground border rounded-md shadow-lg z-50 p-2">
                      <div className="flex items-center justify-between px-2 py-1 border-b">
                        <div className="font-medium">Notifications</div>
                        <button className="text-sm text-muted-foreground" onClick={() => setNotifications([])}>Clear</button>
                      </div>
                      <div className="max-h-64 overflow-auto mt-2">
                        {notifications.length === 0 && <div className="p-3 text-sm text-muted-foreground">No notifications</div>}
                        {notifications.map((n) => (
                          <div key={n.id} className={`p-2 border-b last:border-b-0 ${n.read ? 'opacity-70' : ''}`}>
                            <div className="text-sm font-medium">{n.title || n.type}</div>
                            <div className="text-xs text-muted-foreground">{n.message}</div>
                            <div className="text-xs text-muted-foreground mt-1">{new Date(n.time).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {showFullNav && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-background">
        {/* Top header similar to user dashboard */}
        <header className="flex items-center justify-between px-6 py-3 border-b bg-card">
          <div className="flex items-center gap-4">
            <button
              title="Location"
              className="p-2 rounded-full hover:bg-muted"
            >
              <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="8" r="2" fill="currentColor" />
              </svg>
            </button>
            <div className="px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground max-w-[720px] truncate">
              {address || 'Select service location'}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme toggle (stub) */}
            <button
              title="Toggle theme"
              className="p-2 rounded-full hover:bg-muted"
              onClick={() => document.documentElement.classList.toggle('dark')}
            >
              <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Avatar + dropdown */}
            <UserMenu />
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const address = useSelector((s) => s.location?.address);
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
      } catch (e) {}
      window.location.href = '/auth/login';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-muted"
        aria-expanded={open}
      >
        <img src={localStorage.getItem('avatar') || '/src/assets/avatar.png'} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-popover text-popover-foreground border rounded-md shadow-lg z-50">
          <div className="p-3 border-b">
            <p className="font-medium">{localStorage.getItem('name') || 'John Doe'}</p>
            <p className="text-xs text-muted-foreground truncate">{localStorage.getItem('email') || 'email@example.com'}</p>
          </div>
          <div className="p-2">
            <Link to="/mechanic/profile" className="block px-3 py-2 rounded hover:bg-muted">Profile</Link>
            <Link to="/mechanic/settings" className="block px-3 py-2 rounded hover:bg-muted">Settings</Link>
          </div>
          <div className="border-t p-2">
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-destructive rounded hover:bg-muted">Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}