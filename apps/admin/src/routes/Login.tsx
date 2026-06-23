import { Link } from "react-router-dom";
import "./Login.css";

export function Login() {
  return (
    <div className="login-page">
      <div className="card login-card">
        <h1>Saaya AI Admin</h1>
        <p className="subtitle">Sign in to manage your platform</p>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="admin@saayaai.com" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Sign In
          </button>
        </form>
        <p className="note">
          Auth ships in Phase 6.{" "}
          <Link to="/dashboard">Continue to dashboard →</Link>
        </p>
      </div>
    </div>
  );
}
