import NoteUploader from '../components/NoteUploader'

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">Accueil 🏠</h1>
      <NoteUploader />
    </div>
  )
}