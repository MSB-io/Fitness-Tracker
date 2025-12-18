import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  Scale,
  Target,
  BarChart3,
  Users,
  ClipboardList,
  UserPlus,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const MainLayout = () => {
  const { user, logout, isTrainer } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userNavItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/workouts", icon: Dumbbell, label: "Workouts" },
    { to: "/nutrition", icon: Utensils, label: "Nutrition" },
    { to: "/weight", icon: Scale, label: "Weight" },
    { to: "/goals", icon: Target, label: "Goals" },
    { to: "/my-plan", icon: ClipboardList, label: "My Plan" },
    { to: "/reports", icon: BarChart3, label: "Reports" },
  ];

  const trainerNavItems = [
    {
      to: "/trainer",
      icon: LayoutDashboard,
      label: "Trainer Dashboard",
      end: true,
    },
    { to: "/trainer/requests", icon: UserPlus, label: "Requests" },
    { to: "/trainer/clients", icon: Users, label: "Clients" },
    { to: "/trainer/plans", icon: ClipboardList, label: "Plans" },
  ];

  // Group navigation items by section for trainers
  const navSections = isTrainer
    ? [
        { title: "Trainer Tools", items: trainerNavItems },
        { title: "My Fitness", items: userNavItems },
      ]
    : [{ title: null, items: userNavItems }];

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <h1 className="text-xl font-bold text-primary">FitTrack</h1>
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {navSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.title && (
                  <div className="px-4 mb-2">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                      {section.title}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary text-white"
                            : "text-secondary hover:bg-gray-100"
                        }`
                      }
                    >
                      <item.icon size={20} />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <NavLink
              to="/profile"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-2 ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-secondary hover:bg-gray-100"
                }`
              }
            >
              <User size={20} />
              Profile
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-muted">
              Welcome,{" "}
              <span className="font-medium text-primary">{user?.name}</span>
            </span>
            {isTrainer && (
              <span className="px-2 py-1 text-xs font-medium bg-primary text-white rounded">
                Trainer
              </span>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
