export function UserList() {
  return (
    <>
      <div className="page-header">
        <h1>Users</h1>
        <p>Manage WhatsApp users and their profiles</p>
      </div>
      <div className="card empty-state">
        <h3>No users yet</h3>
        <p>Users appear here when they send their first WhatsApp message.</p>
      </div>
    </>
  );
}
