# 📄 AI Resume Builder & PDF Exporter (Complete Project Notes)

A production-ready, interactive Resume Builder web application built with **React**, **Vite**, **Tailwind CSS v4**, **Google Gemini AI**, and **jsPDF / AutoTable**.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Optional: Set Up Google Gemini API Key
To use live Google Gemini AI generation:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Put your Gemini API key in `.env`:
   ```env
   VITE_GEMINI_API_KEY=your_actual_key_here
   ```
*(Note: If no API key is provided, the application automatically uses smart template fallbacks so the app works 100% out of the box).*

### 3. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 📑 Complete Architecture & Logic Breakdown

### 1. Data Flow Pipeline
1. **User Input Phase:** User fills in Personal Details, Experience, Education, and Skills or types summary keywords.
2. **AI Enrichment Phase:**
   - On page load, `useEffect` triggers `fetchSuggestions()` to fetch 10 software developer skills.
   - Clicking **"Generate Summary"** sends the user's keywords to the Gemini API (`gemini-2.5-flash`) to generate a customized professional summary.
3. **Live Template Preview:** The right-hand column listens to React state changes and renders an A4-styled resume sheet in real time.
4. **PDF Compilation:** Clicking **"Export to PDF"** uses `jsPDF` and `jspdf-autotable` to generate a vector-sharp, professional PDF and triggers an instant download.
