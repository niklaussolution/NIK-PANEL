export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface VPSPlan {
  id: string;
  name: string;
  cpu: string;
  ram: string;
  storage: string;
  bandwidth: string;
  price: number;
  popular?: boolean;
}

export interface VPS {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  hostname: string;
  ipAddress: string;
  status: "active" | "stopped" | "suspended" | "provisioning";
  cpu: string;
  ram: string;
  storage: string;
  os: "AlmaLinux 9";
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "cancelled";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  hostname: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "user" | "admin";
  message: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
  amount: number;
  status: "success" | "failed";
  createdAt: string;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  hostname: string;
}

export interface AdminStats {
  totalCustomers: number;
  totalOrders: number;
  revenue: number;
  activeVPS: number;
}
