import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Users', path: '/admin/users' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-dark-950 font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 dark:bg-dark-900 text-white flex flex-col shadow-xl border-r border-white/5">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 dark:border-white/5 tracking-wider">
          <Link to="/">FLIPKO <span className="text-blue-500 text-sm align-top">ADMIN</span></Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive ? 'bg-blue-600 shadow-md text-white' : 'text-slate-300 hover:bg-slate-800 dark:hover:bg-dark-800 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700 dark:border-white/5">
          <Link to="/" className="block text-center px-4 py-2 bg-slate-800 dark:bg-dark-800 hover:bg-slate-700 dark:hover:bg-dark-700 rounded text-sm text-gray-300 transition-colors">
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-dark-900 shadow-sm flex items-center justify-between px-8 z-10 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {navItems.find(i => location.pathname === i.path || (i.path !== '/admin' && location.pathname.startsWith(i.path)))?.name || 'Admin'}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-bold">Administrator</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-dark-950 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
