import axios from "axios";
import { 
  DashboardSummary,
  DeviceListing,
  InspectionReportSummary,
  MarketplaceListingSummary,
  NegotiationSummary,
  Notification
} from "@/types/dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL not defined");

const dashboardClient = axios.create({
  baseURL: `${API_URL}/dashboard`,
  headers: {
    "Content-Type": "application/json",
  },
  // In a real app, an interceptor injects the Bearer token here.
});

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await dashboardClient.get<DashboardSummary>("/summary");
    return response.data;
  },

  getDevices: async (): Promise<DeviceListing[]> => {
    const response = await dashboardClient.get<DeviceListing[]>("/devices");
    return response.data;
  },

  getReports: async (): Promise<InspectionReportSummary[]> => {
    const response = await dashboardClient.get<InspectionReportSummary[]>("/reports");
    return response.data;
  },

  getListings: async (): Promise<MarketplaceListingSummary[]> => {
    const response = await dashboardClient.get<MarketplaceListingSummary[]>("/listings");
    return response.data;
  },

  getNegotiations: async (): Promise<NegotiationSummary[]> => {
    const response = await dashboardClient.get<NegotiationSummary[]>("/negotiations");
    return response.data;
  },

  getNotifications: async (): Promise<Notification[]> => {
    const response = await dashboardClient.get<Notification[]>("/notifications");
    return response.data;
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await dashboardClient.put(`/notifications/${id}/read`);
  }
};
