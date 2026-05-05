import NoteUploader from '../components/NoteUploader'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-purple-950 to-dark">
      {/* Hero */}
      <div className="text-center py-20 px-8">
        <div className="inline-block bg-accent/20 text-accent text-sm font-semibold px-4 py-2 rounded-full mb-6">
          ✨ Révision intelligente avec IA
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">
          Apprends plus vite<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            avec NoteGenius
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
          Upload tes notes, génère des flashcards automatiquement et révise intelligemment.
        </p>
        <div className="max-w-2xl mx-auto">
          <NoteUploader />
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-20 max-w-5xl mx-auto">
        {[
          { icon: '🤖', title: 'IA Génération', desc: 'Claude génère tes flashcards automatiquement' },
          { icon: '🧠', title: 'Algorithme SM-2', desc: 'Révision espacée pour mémoriser efficacement' },
          { icon: '📊', title: 'Dashboard', desc: 'Suis ta progression et tes stats' },
        ].map(f => (
          <div key={f.title} className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-primary/50 transition-all">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}