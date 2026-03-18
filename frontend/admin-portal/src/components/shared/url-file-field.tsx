import { useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { uploadApi } from '@/services/api'
import { toast } from 'sonner'

interface UrlFileFieldProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
  accept?: string
}

export function UrlFileField({ value, onChange, placeholder = 'https://...', accept = 'image/*' }: UrlFileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { url } = await uploadApi.image(fd)
      onChange(url)
      toast.success('File uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        title="Upload file"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      </Button>
    </div>
  )
}
