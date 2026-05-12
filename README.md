# notegenius
🧠 NoteGenius
AI-Powered Smart Learning & Revision Platform








# 📌 Overview
NoteGenius is an intelligent study platform designed to help students learn faster and retain information more efficiently.
The application combines:

	• 🤖 Artificial Intelligence
	
	• 🧠 SM-2 Spaced Repetition Algorithm
	
	• 📊 Learning Analytics
	
	• 📚 Interactive Flashcards & Quizzes
	
	• 📄 PDF Processing
	
	• 🎯 Personalized Exam Planning
	
Users can upload course materials or PDFs and instantly generate:

	• Smart flashcards
	
	• AI-powered quizzes
	
	• Structured summaries
	
	• Adaptive revision schedules
	
All learning data is stored locally using IndexedDB, ensuring privacy and offline accessibility.

# 🚀 Main Features
🤖 AI-Powered Learning

	• Automatic flashcard generation from notes or PDFs
	
	• AI-generated quizzes with adaptive difficulty
	
	• Smart educational summaries
	
	• Personalized exam revision planning
	
🧠 Spaced Repetition System

	• Implementation of the SM-2 algorithm
	
	• Dynamic review intervals
	
	• Daily revision queue
	
	• Learning progression tracking
	
📊 Analytics Dashboard

	• Memorization statistics
	
	• Activity heatmaps
	
	• Subject mastery tracking
	
	• Learning performance indicators
	
📚 Subject Management

	• Create and organize subjects
	
	• Upload and manage PDFs
	
	• Track revision progress by subject
	
	• Search and filter learning materials
	
🎨 Modern User Experience

	• Responsive design
	
	• Dark / Light mode
	
	• Smooth animations with Framer Motion
	
	• Clean and intuitive interface
	
🔒 Privacy-Focused Architecture

	• 100% client-side application
	
	• No external database required
	
	• Local IndexedDB storage
	
	• No tracking or telemetry

# 🛠️ Tech Stack
Technology	Role

React 19    	Frontend Framework

TypeScript  	Type Safety

Vite	        Build Tool

TailwindCSS  	Styling

Groq API	    AI Generation

IndexedDB	    Local Database

Framer Motion	Animations

PDF.js	        PDF Text Extraction

Vitest	        Testing




# 🚀 Live Demo
The application is deployed and accessible online:

👉 https://notegenuis.netlify.app

# ⚡ Local Installation
If you want to run the project locally:
# Clone repository
git clone   https://github.com/FatimaZahra-maker/notegenius.git
# Navigate to project
cd notegenius
# Install dependencies
npm install
# Start development server
npm run dev

Application runs on:

http://localhost:5173
# 🔑 Environment Variables
To use AI-powered features locally, create a .env file at the root of the project:

VITE_GROQ_API_KEY=your_api_key_here

Get your free API key from:

https://console.groq.com

 

# 📁 Project Structure
src/

├── algorithms/

├── assets/

├── components/

├── hooks/ 

├──pages/

├──services/

├── types/

├──utils/

├──App.css

├──App.tsx

├──index.css

└── main.tsx

# 🧠 Core Concept
NoteGenius uses the SM-2 spaced repetition algorithm, originally developed for SuperMemo, to optimize revision intervals and improve long-term memory retention.

The more successfully a user recalls a flashcard, the longer the interval before the next review.

This creates:

	• Better retention
	
	• Reduced unnecessary repetition
	
	• Faster learning efficiency

# 👥 Authors
Developed by

	• Radoui Fatima Zahra
	
	• Atoufi Wassila
# Institution
ENSA Berrechid — Hassan First University

Academic Year
2025 — 2026

# 📄 License
This project is licensed under the MIT License.

⭐ If you like this project, consider giving it a star on GitHub!
Built with ❤️ using React, TypeScript and AI.

