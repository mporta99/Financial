import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./AppShell.css";

const navigationItems = [
  { to: "/", label: "Home" },
  { to: "/carteiras", label: "Carteiras" },
  { to: "/subcontas", label: "Subcontas" },
  { to: "/categorias", label: "Categorias" },
  { to: "/lancamentos", label: "Lançamentos" },
  { to: "/transferencias", label: "Transferências" },
  { to: "/movimentar-dinheiro", label: "Movimentar Dinheiro" }
];

export default function AppShell() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand-block">
          <span className="brand-kicker">Financial App</span>
          <h1>Controle pessoal com estrutura clara.</h1>
          <p>Home, CRUDs e movimentação visual prontos para crescer junto com as regras do domínio.</p>
        </div>

        <nav className="main-nav">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <span className="page-kicker">Workspace</span>
            <strong>{navigationItems.find((item) => item.to === location.pathname)?.label ?? "Painel"}</strong>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
