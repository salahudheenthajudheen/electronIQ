import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useXpToast } from '@/hooks/useXpToast'
import { Button } from '@/components/ui/button'

interface PadletEmbedProps {
  studentId: string
}

interface PadletUpload {
  id: string
  student_id: string
  image_url: string
  caption: string
  created_at: string
  student_name?: string
}

export function PadletEmbed({ studentId }: PadletEmbedProps) {
  const [padletUrl, setPadletUrl] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [peerUpload, setPeerUpload] = useState<PadletUpload | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { awardAndToast } = useXpToast()

  useEffect(() => {
    supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'padlet_url')
      .single()
      .then(({ data }) => {
        if (data) setPadletUrl(data.value)
      })
  }, [])

  useEffect(() => {
    if (!submitted) return
    supabase
      .from('padlet_uploads')
      .select('*, profiles!inner(name)')
      .neq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const random = data[Math.floor(Math.random() * data.length)]
          setPeerUpload({
            id: random.id,
            student_id: random.student_id,
            image_url: random.image_url,
            caption: random.caption,
            created_at: random.created_at,
            student_name: (random as any).profiles?.name,
          })
        }
      })
  }, [submitted, studentId])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(selected)
  }, [])

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const filePath = `padlet/${studentId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath)

      await supabase.from('padlet_uploads').insert({
        student_id: studentId,
        image_url: publicUrl,
        caption,
      })

      await awardAndToast(studentId, 25, 2, 'Padlet upload submitted!')
      setSubmitted(true)
      setShowUpload(false)
      setPreview(null)
      setFile(null)
      setCaption('')
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Class Padlet</h2>
        {!submitted && (
          <Button onClick={() => setShowUpload(true)} variant="default" size="sm">
            Upload Photo
          </Button>
        )}
      </div>

      {padletUrl && (
        <div className="overflow-hidden rounded-xl border border-surface">
          <iframe
            src={padletUrl}
            className="h-[500px] w-full"
            allow="camera; microphone"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="w-full max-w-md rounded-t-2xl bg-surface p-6"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Upload to Padlet
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!preview ? (
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  Choose from Gallery
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = fileInputRef.current
                    if (input) {
                      input.removeAttribute('capture')
                      input.setAttribute('capture', 'environment')
                      input.click()
                    }
                  }}
                  className="flex-1"
                >
                  Take Photo
                </Button>
              </div>
            ) : (
              <div className="mb-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 w-full rounded-lg object-cover"
                />
                <button
                  onClick={() => { setPreview(null); setFile(null) }}
                  className="text-sm text-red-500 mt-1"
                >
                  Remove
                </button>
              </div>
            )}

            <input
              type="text"
              placeholder="Add a caption..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="w-full rounded-lg border border-primary/20 bg-surface px-4 py-3 mb-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
            />

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1"
              >
                {uploading ? 'Uploading...' : 'Submit'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setShowUpload(false); setPreview(null); setFile(null); setCaption('') }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {peerUpload && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-surface bg-surface/50 p-4"
        >
          <h3 className="text-sm font-semibold text-text-muted mb-2">
            A classmate's observation
          </h3>
          <img
            src={peerUpload.image_url}
            alt={peerUpload.caption}
            className="max-h-48 w-full rounded-lg object-cover mb-2"
          />
          {peerUpload.caption && (
            <p className="text-sm text-text-primary">{peerUpload.caption}</p>
          )}
          <p className="text-xs text-text-muted mt-1">
            — {peerUpload.student_name || 'Anonymous'}
          </p>
        </motion.div>
      )}
    </div>
  )
}
