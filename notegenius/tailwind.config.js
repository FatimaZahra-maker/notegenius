export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6C63FF",      // violet — couleur principale
        secondary: "#F5F3FF",    // violet clair — backgrounds
        easy: "#22C55E",         // vert — bouton Facile
        hard: "#EF4444",         // rouge — bouton Difficile
        review: "#F97316",       // orange — bouton À revoir
      }
    }
  }
}