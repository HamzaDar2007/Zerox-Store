import { useCallback, useState, useRef } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
  accept?: string
  maxSizeMB?: number
  multiple?: boolean
  onUpload: (files: File[]) => void
  className?: string
  preview?: string | null
}

export function FileUploader({
  accept = 'image/*',
  maxSizeMB = 5,
  multiple = false,
  onUpload,
  className,
  preview,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview ?? null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validate = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files)
    const maxBytes = maxSizeMB * 1024 * 1024
    for (const f of arr) {
      if (f.size > maxBytes) {
        setError(`File "${f.name}" exceeds ${maxSizeMB}MB limit`)
        return null
      }
    }
    setError(null)
    return arr
  }, [maxSizeMB])

  const handleFiles = useCallback((files: FileList | File[]) => {
    const valid = validate(files)
    if (!valid) return
    if (valid.length > 0 && valid[0].type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(valid[0]))
    }
    onUpload(valid)
  }, [validate, onUpload])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const clearPreview = () => {
    setPreviewUrl(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
          dragActive ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50',
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {previewUrl ? (
          <div className="relative">
            <img src={previewUrl} alt="Preview" className="max-h-32 rounded-md object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6"
              onClick={(e) => { e.stopPropagation(); clearPreview() }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-full bg-muted p-3 mb-2">
              {accept?.includes('image') ? <ImageIcon className="h-6 w-6 text-muted-foreground" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
            </div>
            <p className="text-sm font-medium">Drop files here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">Max {maxSizeMB}MB per file</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
        />
      </div>
      {error && <p className="text-xs text-destructive animate-fade-in">{error}</p>}
    </div>
  )
}
