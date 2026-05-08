import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 transition-colors duration-300">

      {/* Hero */}
      <div className="text-center py-24 px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-violet-500/20 text-violet-300 text-sm font-semibold px-4 py-2 rounded-full mb-8 border border-violet-500/30">
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            Propulsé par Groq AI · Llama 3.3
          </div>

          <h1 className="text-6xl font-black text-white mb-6 leading-tight">
            Transformez vos notes<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
              en génie
            </span>
          </h1>

          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Uploadez vos cours — l'IA génère flashcards, quiz et planning de révision.
            Mémorisez 3x plus vite avec l'algorithme SM-2.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate('/subjects')}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all hover:-translate-y-1 shadow-lg shadow-purple-500/30"
            >
              🚀 Commencer maintenant
            </button>
            <button
              onClick={() => navigate('/guide')}
              className="bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all border border-white/20"
            >
              📖 Comment ça marche
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-16">
            {[
              { value: 'SM-2', label: 'Algorithme scientifique' },
              { value: 'IA', label: 'Groq Llama 3.3' },
              { value: '100%', label: 'Gratuit & privé' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div className="px-8 pb-24 max-w-6xl mx-auto">
        <h2 className="text-center text-2xl font-bold text-white mb-12">
          Tout ce dont vous avez besoin
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '🤖', title: 'Génération IA', desc: 'Groq analyse vos notes et génère flashcards, quiz et résumés en secondes.', color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30' },
            { icon: '🧠', title: 'Algorithme SM-2', desc: 'Répétition espacée scientifique — révisez au bon moment pour mémoriser durablement.', color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' },
            { icon: '📊', title: 'Dashboard complet', desc: 'Suivez votre progression avec graphiques, heatmap et taux de maîtrise.', color: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/30' },
            { icon: '📅', title: 'Planning intelligent', desc: 'Entrez votre date d\'examen — l\'IA crée votre planning optimal.', color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30' },
            { icon: '🔒', title: '100% Privé', desc: 'Toutes vos données restent sur votre appareil. Aucun serveur externe.', color: 'from-rose-500/20 to-pink-500/20', border: 'border-rose-500/30' },
            { icon: '📱', title: 'Responsive', desc: 'Mobile, tablette ou desktop — l\'expérience est parfaite partout.', color: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/30' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${f.color} backdrop-blur rounded-2xl p-6 border ${f.border} hover:scale-105 transition-all cursor-default`}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pb-24 px-8">
        <div className="bg-gradient-to-r from-violet-600/20 to-cyan-600/20 rounded-3xl p-12 max-w-3xl mx-auto border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à réviser intelligemment ?</h2>
          <p className="text-gray-400 mb-8">Créez votre première matière en moins de 2 minutes.</p>
          <button
            onClick={() => navigate('/subjects')}
            className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all hover:-translate-y-1"
          >
            ✨ Créer ma première matière
          </button>
        </div>
      </div>
    </div>
  )
}