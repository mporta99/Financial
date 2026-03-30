import { Link } from "react-router-dom";
import "./HomeNavCard.css";

export default function HomeNavCard({ title, description, to }) {
  return (
    <Link to={to} className="home-nav-card">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <span>Abrir</span>
    </Link>
  );
}
