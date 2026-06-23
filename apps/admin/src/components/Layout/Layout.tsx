import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/users", label: "Users", icon: "👥" },
  { to: "/subscriptions", label: "Subscriptions", icon: "💳" },
  { to: "/broadcasts", label: "Broadcasts", icon: "📢" },
  { to: "/greetings", label: "Greetings", icon: "🌅" },
  { to: "/integrations", label: "Integrations", icon: "🔌" },
  { to: "/logs", label: "Logs", icon: "📋" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>✦</span> Saaya AI
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <span className="topbar-title">Admin Dashboard</span>
          <span className="badge badge-muted">Phase 0</span>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
