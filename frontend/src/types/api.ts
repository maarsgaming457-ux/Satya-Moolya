export interface User {
  id: string;
  name: string;
  email: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  avatarUrl?: string;
  verified: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  category: "SMARTPHONE" | "LAPTOP" | "WEARABLE" | "TABLET" | "ACCESSORY";
  brand: string;
  model: string;
  specifications: Record<string, string>;
  images: string[];
  condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  createdAt: string;
  updatedAt: string;
}

export interface InspectionReport {
  id: string;
  productId: string;
  trustScore: number; // 0-100
  aiConfidence: number; // 0-100
  estimatedMarketValue: number; // In INR
  functionalIssues: string[];
  cosmeticIssues: string[];
  verified: boolean;
  generatedAt: string;
}

export interface MarketplaceListing {
  id: string;
  productId: string;
  sellerId: string;
  askingPrice: number; // In INR
  status: "ACTIVE" | "IN_NEGOTIATION" | "SOLD" | "CANCELLED";
  views: number;
  likes: number;
  listedAt: string;
  product?: Product;
  inspection?: InspectionReport;
  seller?: User;
}

export interface Negotiation {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  currentOffer: number; // In INR
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTERED";
  messages: {
    senderId: string;
    content: string;
    offerAmount?: number;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  userId: string;
  totalListings: number;
  activeNegotiations: number;
  totalSalesValue: number; // In INR
  pendingInspections: number;
}
