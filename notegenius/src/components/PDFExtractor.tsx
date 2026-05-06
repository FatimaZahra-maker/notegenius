import { useState } from 'react'
<<<<<<< HEAD
=======
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()
>>>>>>> c3b3447d4911c9ed8f5231a389fc151be7dd6efd

export default function PDFExtractor() {
  const [progress, setProgress] = useState(0)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setProgress(0)
    setExtractedText(null)

    try {
      const pdfjsLib = await import('pdfjs-dist')
      
      // ✅ Version 5.x utilise .mjs pas .js
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).href

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const totalPages = pdf.numPages
      let fullText = ''

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
          .map((item) => 'str' in item ? item.str : '')
          .join(' ')
        fullText += pageText + '\n'
        setProgress(Math.round((i / totalPages) * 100))
      }

      setExtractedText(fullText)
    } catch (error) {
      console.error('Erreur PDF:', error)
      alert('Erreur lors de la lecture du PDF. Voir la console.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">Extraction PDF 📄</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFile}
        className="mb-6 block"
      />

      {isLoading && (
        <div className="mb-6">
          <p className="text-gray-600 mb-2">Extraction en cours... {progress}%</p>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-primary h-4 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {extractedText && (
        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-700 mb-2">Aperçu du texte :</h2>
          <div className="bg-secondary p-4 rounded-lg max-h-64 overflow-y-auto text-sm text-gray-600">
            {extractedText}...
          </div>
        </div>
      )}
    </div>
  )
}