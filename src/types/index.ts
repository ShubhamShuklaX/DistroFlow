export type UserRole =
  | 'distributor'
  | 'sales_exec'
  | 'warehouse_manager'
  | 'accountant'
  | 'delivery_person'
  | 'retailer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  staffProfile?: StaffProfile;
  retailer?: Retailer;
}

export interface StaffProfile {
  id: string;
  userId: string;
  zone: string;
  salary: number;
  commissionPercent: number;
  status: 'active' | 'inactive';
  hiredOn: string;
  metrics?: {
    ordersClosed: number;
    salesValue: number;
    deliveriesDone: number;
    packsDone: number;
    collectionsTotal: number;
  };
}

export interface Retailer {
  id: string;
  userId?: string;
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  gstNo: string;
  address: string;
  city: string;
  zone: string;
  creditLimit: number;
  outstandingBalance: number;
  tag: 'Premium' | 'Standard' | 'High Risk' | 'New';
  status: 'active' | 'inactive' | 'blocked';
  assignedSalesExecId?: string;
  creditUtilizationPercent?: number;
  totalOrdersCount?: number;
  createdAt: string;
  orders?: Order[];
  payments?: Payment[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  taxPercent: number;
  stockQty: number;
  reorderThreshold: number;
  warehouseLocation: string;
  imageUrl?: string;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  qty: number;
  fulfilledQty: number;
  backorderedQty: number;
  unitPrice: number;
  totalPrice: number;
  product?: Product;
}

export type OrderStatus =
  | 'Placed'
  | 'Confirmed'
  | 'Packed'
  | 'Dispatched'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid' | 'Overdue';

export interface Order {
  id: string;
  retailerId: string;
  retailer: Retailer;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  hasBackorder: boolean;
  notes?: string;
  deliveryZone?: string;
  placedByStaffId?: string;
  placedBy?: { id: string; name: string; role: string };
  packedByStaffId?: string;
  packedBy?: { id: string; name: string; role: string };
  deliveredByStaffId?: string;
  deliveredBy?: { id: string; name: string; role: string };
  items: OrderItem[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  retailerId: string;
  retailer?: Retailer;
  orderId?: string;
  order?: Order;
  amount: number;
  mode: 'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque';
  referenceNo?: string;
  date: string;
  status: string;
  collectedByStaffId?: string;
  collectedBy?: { id: string; name: string; role: string };
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  targetRole: string;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'payment' | 'system';
  read: boolean;
  createdAt: string;
}

export interface AnalyticsData {
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    pendingDispatchCount: number;
    backorderOrdersCount: number;
    totalOutstandingDebt: number;
    lowStockCount: number;
    activeRetailersCount: number;
  };
  revenueTrend: Array<{ month: string; revenue: number; orders: number }>;
  categoryDistribution: Array<{ name: string; value: number }>;
  topProducts: Array<{ name: string; sku: string; qty: number; revenue: number; stock: number }>;
  topRetailers: Array<{ name: string; zone: string; orders: number; revenue: number; balance: number }>;
  zoneHeatmap: Array<{ zone: string; revenue: number; retailers: number; orders: number }>;
  staffLeaderboard: Array<{
    id: string;
    name: string;
    role: string;
    zone: string;
    ordersPlaced: number;
    salesValue: number;
    ordersPacked: number;
    ordersDelivered: number;
    paymentsCollected: number;
  }>;
}

export interface DemandForecastItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  reorderThreshold: number;
  historicalSales30d: number;
  forecastedDemandNextMonth: number;
  recommendedReorderQty: number;
  estimatedCost: number;
  urgency: string;
}
