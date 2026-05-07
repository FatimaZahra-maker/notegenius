import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const steps = [
  {
    number: '01',
    icon: '📚',
    title: 'Créez vos matières',
    desc: 'Organisez vos cours par matière. Chaque matière a son propre espace de flashcards et de statistiques.',
    color: 'from-violet-500 to-purple-600'
  },
  {
    number: '02',
    icon: '📄',
    title: 'Uploadez vos notes',
    desc: 'Glissez votre PDF ou copiez votre texte. L\'IA analyse le contenu automatiquement.',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    number: '03',
    icon: '🤖',
    title: 'L\'IA génère pour vous',
    desc: 'Gemini AI crée vos flashcards, questions de quiz et résumés en quelques secondes.',
    color: 'from-emerald-500 to-green-600'
  },
  {
    number: '04',
    icon: '🧠',
    title: 'Révisez intelligemment',
    desc: 'L\'algorithme SM-2 planifie vos révisions au moment optimal pour mémoriser durablement.',
    color: 'from-amber-500 to-orange-600'
  },
  {
    number: '05',
    icon: '📊',
    title: 'Suivez vos progrès',
    desc: 'Le dashboard affiche votre courbe de mémorisation, streak et taux de maîtrise.',
    color: 'from-rose-500 to-pink-600'
  },
]

const faqs = [
  {
    q: 'Comment fonctionne l\'algorithme SM-2 ?',
    a: 'SM-2 (SuperMemo 2) est un algorithme scientifique de répétition espacée. Selon votre évaluation (Facile / Difficile / À revoir), il calcule la prochaine date de révision optimale. Plus vous trouvez une carte facile, plus l\'intervalle augmente — vous révisez moins souvent ce que vous maîtrisez.'
  },
  {
    q: 'Mes données sont-elles en sécurité ?',
    a: 'Oui ! Toutes vos données (flashcards, sessions, stats) sont stockées uniquement sur votre appareil via IndexedDB. Rien n\'est envoyé sur un serveur externe. Seul le texte de vos notes est envoyé à Gemini AI pour générer les flashcards.'
  },
  {
    q: 'Quels formats de fichiers sont acceptés ?',
    a: 'Vous pouvez uploader des fichiers PDF ou TXT. Vous pouvez aussi coller directement votre texte dans la zone de saisie. Les fichiers jusqu\'à 8000 caractères sont traités en une seule fois.'
  },
  {
    q: 'Combien de flashcards sont générées par PDF ?',
    a: 'Par défaut, Gemini génère 15 flashcards par upload. La qualité dépend de la clarté du contenu. Vous pouvez modifier ou supprimer les cartes dans l\'éditeur.'
  },
  {
    q: 'Que se passe-t-il si je rate une session de révision ?',
    a: 'Les cartes dues s\'accumulent et restent disponibles. Vous pouvez voir le nombre de cartes à réviser dans chaque matière. L\'algorithme réajuste automatiquement après votre prochaine session.'
  },
]

export default function Guide() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white py-24 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm font-medium px-4 py-2 rounded-full mb-8 border border-white/20">
            📖 Guide complet
          </div>
          <h1 className="text-5xl font-black mb-6">
            Maîtrisez NoteGenius<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
              en 5 minutes
            </span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">
            Tout ce que vous devez savoir pour transformer vos notes en mémoire permanente.
          </p>
          <button
            onClick={() => navigate('/subjects')}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all hover:-translate-y-1"
          >
            🚀 Commencer maintenant
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-20">

        {/* Étapes */}
        <div className="mb-20">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-gray-500 text-center mb-12">5 étapes simples pour mémoriser efficacement</p>

          <div className="flex flex-col gap-6">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-6 items-start bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className={`w-14 h-14 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-black text-gray-300 tracking-widest">{step.number}</span>
                    <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SM-2 Explication */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-10 border border-violet-100 mb-20">
          <h2 className="text-2xl font-black text-violet-900 mb-4">
            🧠 L'algorithme SM-2 expliqué
          </h2>
          <p className="text-violet-700 mb-8 leading-relaxed">
            SM-2 (SuperMemo 2) est basé sur la courbe d'oubli d'Ebbinghaus. L'idée : réviser juste avant d'oublier.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { emoji: '😰', label: 'À revoir (0)', desc: 'La carte revient dans 1 jour. Vous n\'avez pas su répondre.', color: 'bg-red-100 border-red-200' },
              { emoji: '🤔', label: 'Difficile (1)', desc: 'La carte revient dans 1-2 jours. Réponse approximative.', color: 'bg-amber-100 border-amber-200' },
              { emoji: '😊', label: 'Facile (2)', desc: 'L\'intervalle multiplie par le facteur d\'aisance. Révision espacée.', color: 'bg-emerald-100 border-emerald-200' },
            ].map(grade => (
              <div key={grade.label} className={`${grade.color} border rounded-2xl p-5`}>
                <div className="text-3xl mb-3">{grade.emoji}</div>
                <p className="font-bold text-gray-800 mb-2">{grade.label}</p>
                <p className="text-gray-600 text-sm">{grade.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-20">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12">
            Questions fréquentes
          </h2>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-all"
                >
                  <span className="font-bold text-gray-800">{faq.q}</span>
                  <span className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl p-12 text-white text-center">
          <h2 className="text-3xl font-black mb-4">Prêt à commencer ?</h2>
          <p className="text-white/70 mb-8 text-lg">
            Créez votre première matière et uploadez vos notes en moins de 2 minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/subjects')}
              className="bg-white text-violet-700 px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all">
              📚 Mes matières
            </button>
            <button onClick={() => navigate('/pdf')}
              className="bg-white/20 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/30 transition-all border border-white/30">
              📄 Uploader un PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}