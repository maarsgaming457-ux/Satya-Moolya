// This file defines strict interfaces for the Seller Dashboard Module.

export type ActivityEventType = "INSPECTION_COMPLETED" | "REPORT_GENERATED" | "LISTING_PUBLISHED" | "OFFER_RECEIVED" | "OFFER_ACCEPTED";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: string; // ISO String
}

export interface DeviceListing {
  id: string;
  deviceName: string;
  inspectionStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  trustScore?: number; // 0-100
  estimatedValue?: number; // in INR
  listingStatus: "UNLISTED" | "ACTIVE" | "SOLD" | "DRAFT";
  registeredAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
}

export interface InspectionReportSummary {
  id: string;
  deviceId: string;
  deviceName: string;
  overallScore: number;
  generatedAt: string;
}

export interface MarketplaceListingSummary {
  id: string;
  deviceName: string;
  askingPrice: number;
  views: number;
  status: "ACTIVE" | "SOLD" | "PAUSED";
  publishedAt: string;
}

export interface NegotiationSummary {
  id: string;
  deviceId: string;
  deviceName: string;
  buyerName: string;
  offerAmount: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTERED";
  updatedAt: string;
}

export interface DashboardSummary {
  totalDevices: number;
  pendingInspections: number;
  activeListings: number;
  activeNegotiations: number;
  estimatedPortfolioValue: number;
  averageTrustScore: number;
  recentDevices: DeviceListing[];
  recentActivities: ActivityEvent[];
  recentNotifications: Notification[];
}
