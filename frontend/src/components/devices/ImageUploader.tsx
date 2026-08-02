"use client"

import { useState, useRef, useCallback } from "react"
import { deviceImagesService } from "@/services/api/deviceImages.service"
import { Button } from "@/components/ui/button"
import { UploadCloud, X, AlertCircle, FileImage, CheckCircle2 } from "lucide-react"
import { Fade } from "@/components/animations/Fade"

const MAX_IMAGES = 10
const MIN_IMAGES = 5
const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/webp"]

interface ImageUploaderProps {
  deviceId: string
  onUploadSuccess: () => void
}

interface SelectedFile {
  id: string
  file: File
  preview: string
}

export function ImageUploader({ deviceId, onUploadSuccess }: ImageUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const validateFiles = (files: File[]): File[] => {
    setUploadError(null)
    const validFiles: File[] = []
    
    for (const file of files) {
      if (!SUPPORTED_FORMATS.includes(file.type)) {
        setUploadError(`File ${file.name} is not a supported format (JPEG, PNG, WEBP).`)
        continue
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError(`File ${file.name} exceeds the ${MAX_FILE_SIZE_MB}MB limit.`)
        continue
      }
      // Check for duplicates by name and size just in the currently selected queue
      if (selectedFiles.some(f => f.file.name === file.name && f.file.size === file.size)) {
        continue // Skip duplicate
      }
      validFiles.push(file)
    }

    if (selectedFiles.length + validFiles.length > MAX_IMAGES) {
      setUploadError(`You can only upload a maximum of ${MAX_IMAGES} images.`)
      // Return only as many as allowed
      return validFiles.slice(0, MAX_IMAGES - selectedFiles.length)
    }

    return validFiles
  }

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const validFiles = validateFiles(fileArray)

    const newSelected = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file)
    }))

    setSelectedFiles(prev => [...prev, ...newSelected])
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }, [selectedFiles])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
    // Reset input so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (id: string) => {
    setSelectedFiles(prev => {
      const target = prev.find(f => f.id === id)
      if (target) {
        URL.revokeObjectURL(target.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const filesToUpload = selectedFiles.map(sf => sf.file)
      await deviceImagesService.uploadImages(deviceId, filesToUpload)
      
      // Cleanup previews
      selectedFiles.forEach(sf => URL.revokeObjectURL(sf.preview))
      setSelectedFiles([])
      
      onUploadSuccess()
    } catch (err: any) {
      setUploadError(err.message || "An error occurred while uploading. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full">
      {uploadError && (
        <Fade className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {uploadError}
        </Fade>
      )}

      {/* Dropzone */}
      {selectedFiles.length < MAX_IMAGES && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center text-center
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border/60 bg-card hover:bg-secondary/10 hover:border-primary/50'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={SUPPORTED_FORMATS.join(",")}
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Click or drag images here</h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-4">
            At least 5 images are required for AI inspection (Front, Back, Left, Right, Screen on). 
          </p>
          <div className="flex gap-4 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-success" /> JPG, PNG, WEBP</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-success" /> Max {MAX_FILE_SIZE_MB}MB</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-success" /> Max {MAX_IMAGES} images</span>
          </div>
        </div>
      )}

      {/* Selected Files Grid */}
      {selectedFiles.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold">Selected Images ({selectedFiles.length}/{MAX_IMAGES})</h4>
            {selectedFiles.length > 0 && (
              <Button onClick={handleUpload} isLoading={isUploading} disabled={isUploading} className="gap-2">
                <UploadCloud className="w-4 h-4" /> Upload All
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {selectedFiles.map((file) => (
              <Fade key={file.id} className="relative group rounded-xl overflow-hidden border border-border aspect-square bg-secondary/20">
                <img 
                  src={file.preview} 
                  alt={file.file.name} 
                  className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-50' : ''}`}
                />
                
                {/* Remove Button */}
                {!isUploading && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-destructive text-white p-1.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                {/* Upload Overlay Overlay */}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </Fade>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
