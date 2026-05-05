import { useState } from 'react'

export default function NoteUploader() {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const acceptedTypes = ['application/pdf', 'text/plain']

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  function handleFile(file: File) {
    if (!acceptedTypes.includes(file.type)) {
      setError('❌ Fichier non supporté — PDF ou TXT seulement')
      setFileName(null)
      return
    }
    setError(null)
    setFileName(file.name)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-4 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all
        ${isDragging ? 'border-primary bg-secondary' : 'border-gray-300 bg-white'}`}
    >
      {fileName ? (
        <p className="text-green-600 font-bold text-lg">✅ {fileName}</p>
      ) : (
        <p className="text-gray-400 text-lg">📂 Glissez votre PDF ou TXT ici</p>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}