import "./PageHeader.css";

export default function PageHeader({ title, description, actions }) {
  return (
    <header className="page-header-card">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </header>
  );
}
