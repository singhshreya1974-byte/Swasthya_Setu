import { useState } from "react";
import "./App.css";

function PatientApp() {
  const [language, setLanguage] = useState("");

  const languages = [
    "English",
    "हिन्दी",
    "বাংলা",
    "தமிழ்",
    "తెలుగు",
    "मराठी",
  ];

  return (
    <div className="patient-screen">
      <div className="patient-card">

        <div className="patient-logo">॥</div>

        <h1>Swasthya Setu</h1>

        <p className="patient-subtitle">
          Your Digital Health Assistant
        </p>

        <div className="patient-section">
          <span className="patient-step">STEP 1 OF 6</span>

          <h2>Select Your Language</h2>

          <p>
            Choose the language you are most comfortable speaking.
          </p>
        </div>

        <div className="language-grid">
          {languages.map((lang) => (
            <button
              key={lang}
              className={`language-btn ${
                language === lang ? "selected" : ""
              }`}
              onClick={() => setLanguage(lang)}
            >
              {lang}
            </button>
          ))}
        </div>

        <button
          className="continue-btn"
          disabled={!language}
          onClick={() => console.log("Language:", language)}
        >
          Continue →
        </button>

      </div>
    </div>
  );
}

export default PatientApp;