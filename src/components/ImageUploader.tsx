"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Camera, Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// ─── Types ──────────────────────────────────────────────────
type Props = {
  onImageSelect: (file: File | null) => void
  loading:       boolean
}

// ─── Main Component ──────────────────────────────────────────
export default function ImageUploader({ onImageSelect, loading }: Props) {
  const [preview,  setPreview]  = useState<string | null>(null)
  const fileInputRef            = useRef<HTMLInputElement>(null)

  // ── Handle dropped / selected file ────────────────────────
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      onImageSelect(file)
    },
    [onImageSelect]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles:    1,
    maxSize:     10 * 1024 * 1024, // 10MB
    noClick:     true,
    noKeyboard:  true,
  })

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onDrop([file])
  }

  const clearImage = () => {
    setPreview(null)
    onImageSelect(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ── Preview mode ───────────────────────────────────────────
  if (preview) {
    return (
      <div className="relative w-full aspect-video bg-muted rounded-2xl overflow-hidden border border-border">
        <Image
          src={preview}
          alt="Pantry preview"
          fill
          className="object-cover"
        />

        {/* Clear button */}
        {!loading && (
          <button
            onClick={clearImage}
            className="absolute top-3 right-3 bg-background/90 hover:bg-background p-1.5 rounded-full shadow-md transition-all"
            aria-label="Remove image"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
            <p className="text-white text-sm font-medium">
              Analysing ingredients...
            </p>
          </div>
        )}
      </div>
    )
  }

  // ── Upload mode ────────────────────────────────────────────
  return (
    <>
      <div
        {...getRootProps()}
        className={`relative w-full aspect-square border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-secondary hover:border-primary/50 hover:bg-primary/5"
        }`}
      >
        <input {...getInputProps()} />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">

          {/* Icon */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isDragActive
                ? "bg-primary scale-110"
                : "bg-primary/10"
            }`}
          >
            {isDragActive ? (
              <ImageIcon className="w-8 h-8 text-white" />
            ) : (
              <Camera className="w-8 h-8 text-primary" />
            )}
          </div>

          {/* Text */}
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-foreground">
              {isDragActive ? "Drop your image here" : "Scan Your Pantry"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              {isDragActive
                ? "Release to upload"
                : "Take a photo or drag & drop an image of your fridge or pantry"}
            </p>
          </div>

          {/* Buttons */}
          {!isDragActive && (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Camera — opens device camera on mobile */}
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                className="bg-primary hover:bg-primary/90 text-white rounded-full gap-2 shadow-[0_4px_12px_rgba(232,82,10,0.3)]"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </Button>

              {/* Browse — opens file picker */}
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  open()
                }}
                className="rounded-full border-border hover:border-primary hover:text-primary gap-2"
              >
                <Upload className="w-4 h-4" />
                Browse Files
              </Button>
            </div>
          )}

          {/* Helper text */}
          <p className="text-xs text-muted-foreground">
            Supports JPG, PNG, WebP • Max 10MB
          </p>
        </div>
      </div>

      {/* Hidden camera input — capture="environment" opens rear camera on mobile */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </>
  )
}