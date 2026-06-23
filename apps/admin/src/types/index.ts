export interface DashboardStats {
  totalUsers: number;
  messagesToday: number;
  activeSubscriptions: number;
  errorRate: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export interface UserSummary {
  id: string;
  phone: string;
  name: string | null;
  status: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  isActive: boolean;
}
