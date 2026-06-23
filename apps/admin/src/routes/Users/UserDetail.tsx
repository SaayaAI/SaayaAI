import { useParams, Link } from "react-router-dom";

export function UserDetail() {
  const { id } = useParams();

  return (
    <>
      <div className="page-header">
        <Link to="/users" style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          ← Back to users
        </Link>
        <h1>User Detail</h1>
        <p>ID: {id}</p>
      </div>
      <div className="card empty-state">
        <h3>Coming in Phase 6</h3>
        <p>User profile, memory, and message history will appear here.</p>
      </div>
    </>
  );
}
