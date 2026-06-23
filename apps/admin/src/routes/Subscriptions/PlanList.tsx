const PLANS = [
  { name: "Free", slug: "free", price: 0, messages: "20/day" },
  { name: "Basic", slug: "basic", price: 299, messages: "100/day" },
  { name: "Pro", slug: "pro", price: 599, messages: "500/day" },
  { name: "Business", slug: "business", price: 999, messages: "Unlimited" },
];

export function PlanList() {
  return (
    <>
      <div className="page-header">
        <h1>Subscription Plans</h1>
        <p>Manage pricing tiers and feature access</p>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Slug</th>
              <th>Price (INR)</th>
              <th>Messages</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {PLANS.map((plan) => (
              <tr key={plan.slug}>
                <td>{plan.name}</td>
                <td><code>{plan.slug}</code></td>
                <td>₹{plan.price}</td>
                <td>{plan.messages}</td>
                <td><span className="badge">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
