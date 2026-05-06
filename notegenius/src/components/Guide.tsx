export default function Guide() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">Guide utilisateur 📖</h1>

      <div className="flex flex-col gap-6">
        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-lg font-bold text-primary mb-2">1. Uploader vos notes</h2>
          <p className="text-gray-600">Allez sur <strong>Accueil</strong> et glissez votre fichier PDF ou TXT dans la zone prévue.</p>
        </div>

        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-lg font-bold text-primary mb-2">2. Révision quotidienne</h2>
          <p className="text-gray-600">Allez sur <strong>Révision</strong> — cliquez sur la carte pour la retourner, puis évaluez avec Facile / À revoir / Difficile.</p>
        </div>

        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-lg font-bold text-primary mb-2">3. Quiz adaptatif</h2>
          <p className="text-gray-600">Allez sur <strong>Quiz</strong> — répondez aux questions et voyez votre score final.</p>
        </div>

        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-lg font-bold text-primary mb-2">4. Dashboard</h2>
          <p className="text-gray-600">Allez sur <strong>Dashboard</strong> — suivez votre courbe de mémorisation et votre taux de maîtrise par matière.</p>
        </div>

        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-lg font-bold text-primary mb-2">5. Planifier l'examen</h2>
          <p className="text-gray-600">Allez sur <strong>Planner</strong> — entrez votre date d'examen et obtenez un planning semaine par semaine.</p>
        </div>
      </div>
    </div>
  )
}