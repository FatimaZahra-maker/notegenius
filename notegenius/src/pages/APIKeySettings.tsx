import { useState } from 'react'

export default function APIKeySettings() {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (!apiKey.trim()) return
    localStorage.setItem('claude_api_key', apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-purple-950 to-dark flex items-center justify-center p-8">
      <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔑</div>
          <h1 className="text-3xl font-extrabold text-white mb-2">NoteGenius</h1>
          <p className="text-gray-400">Entre ta clé API Claude pour commencer</p>
        </div>

        <input
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder="sk-ant-..."
          className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary mb-4"
        />

        <button
          onClick={handleSave}
          className="w-full bg-primary hover:bg-violet-700 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-primary/30"
        >
          {saved ? '✅ Sauvegardé!' : 'Commencer →'}
        </button>

        <p className="text-gray-500 text-xs text-center mt-4">
          Ta clé est stockée localement et ne quitte jamais ton appareil
        </p>
      </div>
    </div>
  )
}