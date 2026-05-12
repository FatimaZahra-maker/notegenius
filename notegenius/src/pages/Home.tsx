
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
const BADGE_MESSAGES = [
  "🧠 Basé sur la science de la mémoire",
  "⚡ Apprenez 3x plus vite",
  "🚀 Conçu pour étudiants ambitieux",
  "✨ Vos données restent sur votre appareil",
]
export default function Home() {
  const navigate = useNavigate()
  const [badgeIndex, setBadgeIndex] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setBadgeIndex(i => (i + 1) % BADGE_MESSAGES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Hero */}
      <div className="text-center py-28 px-6 relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-violet-600/15 blur-[120px] rounded-full pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          {/* Badge dynamique */}
          <div className="inline-flex items-center justify-center gap-2 bg-white/5 text-white/65 text-sm font-medium px-5 py-2 rounded-full mb-10 border border-white/10 backdrop-blur hover:bg-white/10 transition min-w-[280px]">
            <AnimatePresence mode="wait">
              <motion.span
                key={badgeIndex}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.35 }}
              >
                {BADGE_MESSAGES[badgeIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
          {/* Titre */}
          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
            Apprenez
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
              intelligemment
            </span>
          </h1>
          {/* Sous-titre */}
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Transformez vos cours en flashcards, quiz et planning optimisé.
            Mémorisez plus vite grâce à un système intelligent basé sur la répétition espacée.
          </p>
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-3">
            <button
              onClick={() => navigate('/subjects')}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 hover:-translate-y-0.5 transition-all shadow-lg shadow-purple-500/30"
            >
              🚀 Commencer gratuitement
            </button>
            <button
              onClick={() => navigate('/guide')}
              className="bg-white/8 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/15 transition border border-white/15"
            >
              📖 Voir comment ça marche
            </button>
          </div>
          <p className="text-xs text-white/25 tracking-wide">Aucune carte bancaire requise</p>
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 mt-14 pt-10 border-t border-white/6">
            {[
              { value: '3x', label: 'Plus rapide' },
              { value: 'SM-2', label: 'Méthode scientifique' },
              { value: '100%', label: 'Privé' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
                <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      {/* Features */}
      <div className="px-8 pb-24 max-w-6xl mx-auto">
        <p className="text-center text-xs font-bold text-white/30 uppercase tracking-widest mb-10">
          Tout ce dont vous avez besoin
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '🤖', title: 'Génération IA', desc: 'Vos notes analysées en secondes — flashcards, quiz et résumés générés automatiquement.' },
            { icon: '🧠', title: 'Algorithme SM-2', desc: 'Répétition espacée scientifique — révisez au bon moment pour mémoriser durablement.' },
            { icon: '📊', title: 'Dashboard complet', desc: 'Suivez votre progression avec graphiques, heatmap et taux de maîtrise.' },
            { icon: '📅', title: 'Planning intelligent', desc: "Entrez votre date d'examen — l'IA crée votre planning optimal." },
            { icon: '🔒', title: '100% Privé', desc: 'Toutes vos données restent sur votre appareil. Aucun serveur externe.' },
            { icon: '📱', title: 'Responsive', desc: "Mobile, tablette ou desktop — l'expérience est parfaite partout." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/[0.06] hover:border-white/[0.13] transition-all cursor-default"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
      {/* CTA finale */}
      <div className="text-center pb-24 px-8">
        <div className="bg-gradient-to-r from-violet-600/15 to-cyan-600/15 rounded-3xl p-12 max-w-3xl mx-auto border border-white/8">
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Prêt à réviser intelligemment ?</h2>
          <p className="text-gray-500 mb-8 text-sm">Créez votre première matière en moins de 2 minutes.</p>
          <button
            onClick={() => navigate('/subjects')}
            className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 hover:-translate-y-0.5 transition-all"
          >
            ✨ Créer ma première matière
          </button>
        </div>
      </div>
    </div>
  )
}
