import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const VPS_PLANS = [
  {
    id: "starter",
    name: "Starter VPS",
    cpu: "2 vCPU",
    ram: "2 GB RAM",
    storage: "40 GB NVMe SSD",
    bandwidth: "2 TB Bandwidth",
    price: 499,
    popular: false,
  },
  {
    id: "business",
    name: "Business VPS",
    cpu: "4 vCPU",
    ram: "4 GB RAM",
    storage: "80 GB NVMe SSD",
    bandwidth: "4 TB Bandwidth",
    price: 999,
    popular: true,
  },
  {
    id: "professional",
    name: "Professional VPS",
    cpu: "6 vCPU",
    ram: "8 GB RAM",
    storage: "160 GB NVMe SSD",
    bandwidth: "8 TB Bandwidth",
    price: 1999,
    popular: false,
  },
  {
    id: "enterprise",
    name: "Enterprise VPS",
    cpu: "8 vCPU",
    ram: "16 GB RAM",
    storage: "320 GB NVMe SSD",
    bandwidth: "Unlimited",
    price: 3999,
    popular: false,
  },
];
