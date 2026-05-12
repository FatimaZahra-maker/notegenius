
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
const steps = [
  { number: '01', icon: '📚', title: 'Créez vos matières', desc: 'Organisez vos cours par matière. Chaque matière a son propre espace de flashcards et de statistiques.', color: 'from-violet-500 to-purple-600' },
  { number: '02', icon: '📄', title: 'Uploadez vos notes', desc: 'Glissez votre PDF ou copiez votre texte. L\'IA analyse le contenu automatiquement.', color: 'from-cyan-500 to-blue-600' },
  { number: '03', icon: '🤖', title: 'L\'IA génère pour vous', desc: 'L\'IA crée vos flashcards, questions de quiz et résumés en quelques secondes — vous n\'avez rien à faire.', color: 'from-emerald-500 to-green-600' },
  { number: '04', icon: '🔁', title: 'Révisez intelligemment', desc: 'L\'algorithme SM-2 planifie vos révisions au moment optimal pour mémoriser durablement.', color: 'from-amber-500 to-orange-600' },
  { number: '05', icon: '📊', title: 'Suivez vos progrès', desc: 'Le dashboard affiche votre courbe de mémorisation, streak et taux de maîtrise en temps réel.', color: 'from-rose-500 to-pink-600' },
]
const faqs = [
  { q: 'Comment fonctionne l\'algorithme SM-2 ?', a: 'SM-2 est un algorithme scientifique de répétition espacée. Selon votre évaluation, il calcule la prochaine date de révision optimale. Plus une carte est facile, plus l\'intervalle augmente.' },
  { q: 'Mes données sont-elles en sécurité ?', a: 'Oui ! Toutes vos données sont stockées sur votre appareil via IndexedDB. Rien n\'est envoyé sur un serveur externe. Seul le texte est envoyé à Groq AI pour générer les flashcards.' },
  { q: 'Quels formats de fichiers sont acceptés ?', a: 'PDF et TXT. Vous pouvez aussi coller directement votre texte dans la zone de saisie.' },
  { q: 'Combien de flashcards sont générées par PDF ?', a: 'Par défaut, 15 flashcards sont générées. Vous pouvez les modifier dans l\'éditeur.' },
  { q: 'Que se passe-t-il si je rate une session ?', a: 'Les cartes dues s\'accumulent et restent disponibles. L\'algorithme réajuste automatiquement après votre prochaine session.' },
]
const avantItems = [
  'Relire passivement sans retenir',
  'Réviser la veille dans la panique',
  'Oublier 80% en 48h',
  'Prendre des notes sans les revoir',
]
const apresItems = [
  'Mémoriser activement par répétition',
  'Planning intelligent calé sur votre exam',
  'Rétention à long terme prouvée',
  '3x moins de temps pour 3x plus de résultats',
]
export default function Guide() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── HERO ── */}
      <div className="relative overflow-hidden py-24 px-8">
        {/* Glow orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Social proof */}
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-xs font-medium px-4 py-2 rounded-full mb-10 border border-white/15">
              ✨ Utilisé par des étudiants ambitieux
            </div>
            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
              De la prise de notes<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
                à la mémorisation<br />permanente
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Découvrez comment un système scientifique peut transformer chaque heure de révision en mémoire durable.
            </p>
            <button
              onClick={() => navigate('/subjects')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all hover:-translate-y-1 shadow-lg shadow-violet-900/50"
            >
              🚀 Commencer maintenant
            </button>
          </motion.div>
        </div>
      </div>
      {/* ── AVANT / APRÈS ── */}
      <div className="max-w-5xl mx-auto px-8 pb-20">
        <div className="text-center mb-10">
          <span className="text-xs font-black tracking-widest text-gray-500 uppercase">☰ CE QUE ÇA CHANGE CONCRÈTEMENT</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AVANT */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-red-400 font-black text-sm">✕ AVANT</span>
            </div>
            <div className="flex flex-col gap-3">
              {avantItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-gray-400 text-sm">
                  <span className="mt-0.5 text-gray-600 flex-shrink-0">▪</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          {/* APRÈS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-emerald-400 font-black text-sm">● APRÈS</span>
            </div>
            <div className="flex flex-col gap-3">
              {apresItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                  <span className="mt-0.5 text-emerald-500 flex-shrink-0">▪</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* ── ÉTAPES ── */}
      <div className="max-w-5xl mx-auto px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white">Comment ça marche ?</h2>
          <p className="text-gray-500 mt-2 text-sm">5 étapes simples pour mémoriser efficacement</p>
        </div>
        <div className="relative flex flex-col gap-4">
          {/* Timeline line */}
          <div className="absolute left-[27px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-violet-500/50 via-violet-500/20 to-transparent z-0" />
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative z-10 flex gap-5 items-start bg-slate-900 border border-slate-800 rounded-3xl p-6
                hover:border-violet-500/30 hover:scale-[1.01] transition-all duration-200"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
                {step.icon}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-black text-slate-600 tracking-widest">{step.number}</span>
                  <h3 className="font-bold text-white">{step.title}</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      {/* ── SM-2 ── */}
      <div className="max-w-5xl mx-auto px-8 pb-20">
        <div className="bg-slate-900 border border-violet-500/20 rounded-3xl p-10">
          <h2 className="text-2xl font-black text-white mb-2">🧠 L'algorithme SM-2 expliqué</h2>
          <p className="text-gray-400 mb-8 leading-relaxed text-sm">
            SM-2 est basé sur la courbe d'oubli d'Ebbinghaus : réviser juste avant d'oublier. Plus vous
            révisez une carte, plus l'intervalle s'allonge — jusqu'à des mois sans effort.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { emoji: '😰', label: 'À revoir (0)', desc: 'La carte revient demain. Répétition immédiate pour ancrer.', color: 'border-slate-700 bg-slate-800/50' },
              { emoji: '😅', label: 'Difficile (1)', desc: 'Revient dans 1–2 jours. Intervalle court, renforcement actif.', color: 'border-slate-700 bg-slate-800/50' },
              { emoji: '😊', label: 'Facile (2)', desc: 'L\'intervalle augmente progressivement. Moins d\'effort, plus de rétention.', color: 'border-slate-700 bg-slate-800/50' },
            ].map(grade => (
              <motion.div
                key={grade.label}
                whileHover={{ scale: 1.04 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`${grade.color} border rounded-2xl p-5 cursor-default`}
              >
                <div className="text-3xl mb-3">{grade.emoji}</div>
                <p className="font-bold text-white mb-2 text-sm">{grade.label}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{grade.desc}</p>
              </motion.div>
            ))}
          </div>
          {/* Simulation timeline */}
          <div className="flex items-center gap-2 flex-wrap">
            {['J+1', 'J+3', 'J+7', 'J+14', 'J+30'].map((day, i) => (
              <div key={day} className="flex items-center gap-2">
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="bg-slate-800 border border-slate-700 text-violet-400 text-xs font-bold px-3 py-1 rounded-full"
                >
                  {day}
                </motion.span>
                {i < 4 && <span className="text-slate-600 text-xs">→</span>}
              </div>
            ))}
            <span className="text-emerald-400 text-xs font-semibold ml-2">Mémoire permanente ✓</span>
          </div>
        </div>
      </div>
      {/* ── FAQ ── */}
      <div className="max-w-5xl mx-auto px-8 pb-20">
        <h2 className="text-3xl font-black text-white text-center mb-12">Questions fréquentes</h2>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/50 transition-colors"
              >
                <span className="font-bold text-white pr-4 text-sm">{faq.q}</span>
                <span className={`text-violet-400 font-bold text-lg flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>
                  {openFaq === i ? '✕' : '+'}
                </span>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed border-t border-slate-800 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
      {/* ── CTA FINAL ── */}
      <div className="max-w-5xl mx-auto px-8 pb-24">
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-900 border border-slate-800 rounded-3xl p-16 text-center overflow-hidden">
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-violet-900/10 to-transparent pointer-events-none rounded-3xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white mb-3 leading-tight">
              Arrêtez de relire.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
                Commencez à mémoriser.
              </span>
            </h2>
            <p className="text-gray-500 text-sm mb-10">
              Créez votre première matière en moins de 2 minutes.<br />Votre futur vous remerciera.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => navigate('/subjects')}
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-7 py-3.5 rounded-2xl font-bold hover:opacity-90 transition-all hover:-translate-y-0.5 text-sm"
              >
                📚 Mes matières
              </button>
              <button
                onClick={() => navigate('/pdf')}
                className="inline-flex items-center gap-2 bg-slate-800 text-white px-7 py-3.5 rounded-2xl font-bold hover:bg-slate-700 transition-all border border-slate-700 text-sm"
              >
                📄 Uploader un PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
