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
  disabled?: boolean;
  couponCode?: string;
  couponDiscount?: number;
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

// ── UPI Payment System ────────────────────────────────────────────────────────

export type UPIPaymentStatus = "Pending" | "Under Review" | "Approved" | "Rejected";
export type UPIOrderStatus   = "Pending Verification" | "Active" | "Cancelled";

export interface UPIPaymentProof {
  utrNumber: string;
  screenshotUrl: string;
  notes?: string;
  submittedAt: string;
}

export interface UPIOrder {
  orderId: string;          // NIK-YYYYMMDD-XXXX  (also the Firestore doc ID)
  userId: string;
  userName: string;
  email: string;
  phone: string;
  planId: string;
  planName: string;
  planType: string;         // e.g. "VPS"
  billingCycle: string;     // e.g. "Monthly"
  amount: number;
  os: string;               // CyberPanel / Docker / Ubuntu
  couponCode?: string;
  couponDiscount?: number;
  paymentMethod: "UPI";
  paymentStatus: UPIPaymentStatus;
  orderStatus: UPIOrderStatus;
  paymentProof?: UPIPaymentProof;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UPITransaction {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  utrNumber: string;
  paymentMethod: "UPI";
  approvedBy: string;
  approvedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: "payment_approved" | "payment_rejected" | "info";
  orderId?: string;
  createdAt: string;
}
