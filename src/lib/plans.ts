import { VPSPlan } from "@/types";

export const VPS_PLANS: VPSPlan[] = [
  {
    id: "starter",
    name: "Starter",
    cpu: "2 vCPU",
    ram: "4 GB RAM",
    storage: "40 GB NVMe SSD",
    bandwidth: "2 TB",
    price: 499,
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    cpu: "4 vCPU",
    ram: "8 GB RAM",
    storage: "60 GB NVMe SSD",
    bandwidth: "8 TB",
    price: 1499,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    cpu: "8 vCPU",
    ram: "16 GB RAM",
    storage: "100 GB NVMe SSD",
    bandwidth: "Unlimited",
    price: 3999,
    popular: false,
  },
];
