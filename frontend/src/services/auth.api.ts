import axios from "axios";
import { 
  LoginFormData, 
  RegisterFormData, 
  ForgotPasswordFormData, 
  ResetPasswordFormData, 
  CompleteProfileFormData 
} from "@/lib/validations/auth.schema";
import { User } from "@/types/api";

const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_URL not defined");
  return `${url}/auth`;
};

const authClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

authClient.interceptors.request.use((config) => {
  config.baseURL = getApiUrl();
  return config;
});

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    // In a real app, this hits the backend. We'll simulate the contract strictly.
    const response = await authClient.post<AuthResponse>("/login", data);
    return response.data;
  },

  register: async (data: Omit<RegisterFormData, "confirmPassword" | "acceptTerms">): Promise<AuthResponse> => {
    const response = await authClient.post<AuthResponse>("/register", data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordFormData): Promise<{ message: string }> => {
    const response = await authClient.post<{ message: string }>("/forgot-password", data);
    return response.data;
  },

  resetPassword: async (token: string, data: Omit<ResetPasswordFormData, "confirmPassword">): Promise<{ message: string }> => {
    const response = await authClient.post<{ message: string }>("/reset-password", { token, ...data });
    return response.data;
  },

  verifyEmail: async (token: string): Promise<{ message: string; verified: boolean }> => {
    const response = await authClient.post<{ message: string; verified: boolean }>("/verify-email", { token });
    return response.data;
  },

  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await authClient.post<{ message: string }>("/resend-verification", { email });
    return response.data;
  },
  
  completeProfile: async (data: CompleteProfileFormData): Promise<User> => {
    const response = await authClient.post<User>("/complete-profile", data);
    return response.data;
  }
};
