import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FileUploaderProps {
  onFile: (file: File, text: string) => void
  accept?: string[]
  maxSizeMB?: number
  isLoading?: boolean
}

type UploadState = 'idle' | 'dragging' | 'loading' | 'success' | 'error'

export default function FileUploader({
  onFile,
  accept = ['application/pdf', 'text/plain'],
  maxSizeMB = 10,
  isLoading = false
}: FileUploaderProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; type: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const processFile = useCallback(async (file: File) => {
    setError(null)

    // Validation type
    const isValid = accept.some(type => {
      if (type === 'application/pdf') return file.type === 'application/pdf' || file.name.endsWith('.pdf')
      if (type === 'text/plain') return file.type === 'text/plain' || file.name.endsWith('.txt')
      return file.type === type
    })

    if (!isValid) {
      setError('Format non supporté. Utilisez un fichier PDF ou TXT.')
      setState('error')
      return
    }

    // Validation taille
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Fichier trop lourd. Maximum ${maxSizeMB}MB.`)
      setState('error')
      return
    }

    setState('loading')
    setFileInfo({
      name: file.name,
      size: formatSize(file.size),
      type: file.name.endsWith('.pdf') ? 'PDF' : 'TXT'
    })

    try {
      let text = ''
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        text = await file.text()
      }
      // Pour PDF, on passe le file brut — PDFExtractor gère l'extraction
      setState('success')
      onFile(file, text)
    } catch {
      setError('Erreur lors de la lecture du fichier.')
      setState('error')
    }
  }, [accept, maxSizeMB, onFile])

  // ── Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setState('dragging')
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Vérifier qu'on quitte vraiment la zone (pas juste un enfant)
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setState(prev => prev === 'dragging' ? 'idle' : prev)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setState('idle')
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    // Reset input pour permettre re-sélection du même fichier
    e.target.value = ''
  }, [processFile])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setState('idle')
    setFileInfo(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const isDragging = state === 'dragging'
  const isSuccess = state === 'success'
  const isError = state === 'error'
  const isProcessing = state === 'loading' || isLoading

  return (
    <div className="w-full">
      {/* Zone principale */}
      <motion.div
        animate={{
          scale: isDragging ? 1.02 : 1,
        }}
        transition={{ duration: 0.15 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isSuccess ? handleClick : undefined}
        className={`
          relative w-full rounded-2xl border-2 border-dashed p-8 text-center
          transition-all duration-200 cursor-pointer select-none
          ${isDragging
            ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20'
            : isSuccess
            ? 'border-emerald-500 bg-emerald-500/10 cursor-default'
            : isError
            ? 'border-red-500 bg-red-500/10'
            : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/5'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={handleInputChange}
          className="hidden"
          aria-label="Sélectionner un fichier"
        />

        <AnimatePresence mode="wait">
          {/* État drag actif */}
          {isDragging && (
            <motion.div
              key="dragging"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📥</span>
              </div>
              <p className="text-violet-600 dark:text-violet-400 font-bold text-lg">
                Relâchez pour uploader
              </p>
            </motion.div>
          )}

          {/* État loading */}
          {isProcessing && !isDragging && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Lecture du fichier...
              </p>
            </motion.div>
          )}

          {/* État succès */}
          {isSuccess && !isProcessing && !isDragging && fileInfo && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">
                  {fileInfo.type === 'PDF' ? '📄' : '📝'}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-gray-900 dark:text-white truncate">
                  {fileInfo.name}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {fileInfo.type} · {fileInfo.size}
                </p>
              </div>
              <button
                onClick={handleRemove}
                className="w-8 h-8 bg-gray-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                title="Supprimer"
              >
                ✕
              </button>
            </motion.div>
          )}

          {/* État idle / error */}
          {(state === 'idle' || isError) && !isDragging && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center
                ${isError ? 'bg-red-100 dark:bg-red-500/20' : 'bg-gray-100 dark:bg-slate-800'}`}>
                <span className="text-3xl">{isError ? '❌' : '☁️'}</span>
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-white text-base">
                  Glissez votre fichier ici
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  ou <span className="text-violet-600 dark:text-violet-400 font-semibold underline">cliquez pour sélectionner</span>
                </p>
              </div>
              <div className="flex gap-2">
                {['PDF', 'TXT'].map(fmt => (
                  <span key={fmt} className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-lg font-medium">
                    {fmt}
                  </span>
                ))}
                <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-lg font-medium">
                  Max {maxSizeMB}MB
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Message d'erreur */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-3"
          >
            <span className="text-red-500">⚠️</span>
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}