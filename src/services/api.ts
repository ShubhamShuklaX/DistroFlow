const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('distroflow_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('distroflow_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('distroflow_token');
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  // Auth
  login: (email: string, password?: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  switchRole: (role: string) =>
    apiFetch('/auth/switch-role', { method: 'POST', body: JSON.stringify({ role }) }),
  getMe: () => apiFetch('/auth/me'),
  getDemoUsers: () => apiFetch('/auth/demo-users'),

  // Staff
  getStaff: () => apiFetch('/staff'),
  createStaff: (data: any) => apiFetch('/staff', { method: 'POST', body: JSON.stringify(data) }),
  updateStaffStatus: (id: string, status: string) =>
    apiFetch(`/staff/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getMyStats: () => apiFetch('/staff/my-stats'),

  // Retailers
  getRetailers: () => apiFetch('/retailers'),
  getRetailer: (id: string) => apiFetch(`/retailers/${id}`),
  createRetailer: (data: any) => apiFetch('/retailers', { method: 'POST', body: JSON.stringify(data) }),
  updateRetailer: (id: string, data: any) =>
    apiFetch(`/retailers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Products
  getProducts: (params?: { category?: string; lowStock?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.lowStock) q.set('lowStock', 'true');
    return apiFetch(`/products?${q.toString()}`);
  },
  createProduct: (data: any) => apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
  adjustStock: (id: string, data: { quantity: number; mode: 'add' | 'set'; notes?: string }) =>
    apiFetch(`/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify(data) }),
  bulkImportProducts: (products: any[]) =>
    apiFetch('/products/bulk-import', { method: 'POST', body: JSON.stringify({ products }) }),

  // Orders
  getOrders: (params?: { status?: string; paymentStatus?: string; hasBackorder?: boolean; retailerId?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.paymentStatus) q.set('paymentStatus', params.paymentStatus);
    if (params?.hasBackorder) q.set('hasBackorder', 'true');
    if (params?.retailerId) q.set('retailerId', params.retailerId);
    return apiFetch(`/orders?${q.toString()}`);
  },
  getOrder: (id: string) => apiFetch(`/orders/${id}`),
  createOrder: (data: { retailerId?: string; items: { productId: string; qty: number }[]; notes?: string }) =>
    apiFetch('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id: string, status: string) =>
    apiFetch(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getBackorders: () => apiFetch('/orders/pipeline/backorders'),

  // Payments & Ledger
  getPayments: (retailerId?: string) =>
    apiFetch(`/payments${retailerId ? `?retailerId=${retailerId}` : ''}`),
  recordPayment: (data: { retailerId: string; orderId?: string; amount: number; mode: string; referenceNo?: string }) =>
    apiFetch('/payments', { method: 'POST', body: JSON.stringify(data) }),
  getAgingReport: () => apiFetch('/payments/reports/aging'),
  sendPaymentReminder: (retailerId: string, message?: string) =>
    apiFetch('/payments/remind', { method: 'POST', body: JSON.stringify({ retailerId, message }) }),

  // Analytics & Forecast
  getDashboardAnalytics: () => apiFetch('/analytics/dashboard'),
  getDemandForecast: () => apiFetch('/analytics/demand-forecast'),
  getRouteOptimization: () => apiFetch('/analytics/route-optimization'),

  // Notifications
  getNotifications: () => apiFetch('/notifications'),
  markNotificationsRead: () => apiFetch('/notifications/mark-read', { method: 'PATCH' }),

  // Audit Logs
  getAuditLogs: (params?: { search?: string; action?: string; role?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.action) q.set('action', params.action);
    if (params?.role) q.set('role', params.role);
    return apiFetch(`/audit?${q.toString()}`);
  },
};
