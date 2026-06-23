import { useEffect, useState } from "react";
import { api, type ReadyResponse } from "../services/api.client";

export function Dashboard() {
  const [health, setHealth] = useState<ReadyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .ready()
      .then(setHealth)
      .catch(() => setError("Unable to reach API"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>System overview and health status</p>
      </div>

      <div className="grid-stats">
        <div className="card stat-card">
          <h3>Total Users</h3>
          <div className="value">—</div>
        </div>
        <div className="card stat-card">
          <h3>Messages Today</h3>
          <div className="value">—</div>
        </div>
        <div className="card stat-card">
          <h3>Active Plans</h3>
          <div className="value">4</div>
        </div>
        <div className="card stat-card">
          <h3>API Status</h3>
          <div className="value" style={{ fontSize: "1.25rem" }}>
            {loading ? "…" : error ? "Offline" : health?.status ?? "—"}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>
          Service Health
        </h2>
        {loading && <p className="empty-state">Checking services…</p>}
        {error && (
          <p className="empty-state">
            {error}. Start the API with <code>pnpm dev</code>.
          </p>
        )}
        {health && (
          <table className="table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(health.checks).map(([service, ok]) => (
                <tr key={service}>
                  <td style={{ textTransform: "capitalize" }}>{service}</td>
                  <td>
                    <span className={`badge${ok ? "" : " badge-muted"}`}>
                      {ok ? "Healthy" : "Unavailable"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
