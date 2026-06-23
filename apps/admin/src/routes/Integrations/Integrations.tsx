const INTEGRATIONS = [
  { name: "WhatsApp Cloud API", phase: "0", status: "Active" },
  { name: "OpenAI", phase: "0", status: "Active" },
  { name: "News API", phase: "3", status: "Planned" },
  { name: "Weather API", phase: "3", status: "Planned" },
  { name: "Market Data", phase: "3", status: "Planned" },
];

export function Integrations() {
  return (
    <>
      <div className="page-header">
        <h1>Integrations</h1>
        <p>External API connections and health</p>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Integration</th>
              <th>Phase</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {INTEGRATIONS.map((item) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>Phase {item.phase}</td>
                <td>
                  <span className={`badge${item.status === "Planned" ? " badge-muted" : ""}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
