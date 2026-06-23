import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Dashboard } from "./routes/Dashboard";
import { Login } from "./routes/Login";
import { UserList } from "./routes/Users/UserList";
import { UserDetail } from "./routes/Users/UserDetail";
import { PlanList } from "./routes/Subscriptions/PlanList";
import { Broadcasts } from "./routes/Broadcasts/Broadcasts";
import { Integrations } from "./routes/Integrations/Integrations";
import { Logs } from "./routes/Logs/Logs";
import { Greetings } from "./routes/Greetings/Greetings";
import { Settings } from "./routes/Settings/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserList />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="subscriptions" element={<PlanList />} />
        <Route path="broadcasts" element={<Broadcasts />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="logs" element={<Logs />} />
        <Route path="greetings" element={<Greetings />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
