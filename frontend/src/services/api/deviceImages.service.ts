import { apiClient } from "@/lib/api-client"
import { ApiResponse } from "@/types/api/common"

export const deviceImagesService = {
  uploadImages: async (deviceId: string, files: File[]): Promise<ApiResponse<{ uploadedUrls: string[] }>> => {
    const uploadedUrls: string[] = []
    
    // Upload files sequentially to match backend contract which expects a single 'image'
    for (const file of files) {
      const formData = new FormData()
      formData.append("image", file)

      const response: any = await apiClient.post(`/devices/${deviceId}/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      if (response.data && response.data.image_url) {
        uploadedUrls.push(response.data.image_url)
      }
    }
    
    return { data: { uploadedUrls }, message: "Images uploaded successfully" }
  },

  deleteImage: async (deviceId: string, imageId: string): Promise<ApiResponse<void>> => {
    await apiClient.delete(`/devices/${deviceId}/images/${imageId}`)
    return { data: undefined }
  }
}
