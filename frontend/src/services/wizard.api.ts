import axios from "axios"
import { DeviceRegistrationRequest, DeviceRegistrationResponse } from "@/types/wizard"

const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_URL not defined");
  return url;
};

export const wizardApi = {
  registerDevice: async (data: DeviceRegistrationRequest): Promise<DeviceRegistrationResponse> => {
    // const API_URL = getApiUrl();
    // return axios.post(`${API_URL}/devices/register`, data).then(res => res.data)
    
    // MOCK API Response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: "DEV_" + Math.random().toString(36).substring(2, 9).toUpperCase(),
          status: "AI_INSPECTION_READY",
          registeredAt: new Date().toISOString(),
        })
      }, 1500)
    })
  }
}
