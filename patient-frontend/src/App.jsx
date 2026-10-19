import { useState } from "react";
import "./App.css";

function App() {
  // =========================
  // MAIN STATE
  // =========================

  const [step, setStep] = useState(1);

  const [language, setLanguage] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [patient, setPatient] = useState(null);

  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "",
  });

  const [visitId, setVisitId] = useState(null);

  const [answer, setAnswer] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(
    "What brings you to the hospital today?"
  );

  const [interviewResponses, setInterviewResponses] =
    useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const languages = [
    "English",
    "हिन्दी",
    "বাংলা",
    "தமிழ்",
    "తెలుగు",
    "मराठी",
  ];

  // =========================
  // SEND OTP
  // =========================

  const sendOtp = async () => {
    if (!phone || phone.length !== 10) {
      setError(
        "Please enter a valid 10-digit phone number"
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/auth/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: phone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to send OTP"
        );
      }

      setStep(3);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VERIFY OTP
  // =========================

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: phone,
            otp: otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Invalid OTP"
        );
      }

      const patientResponse = await fetch(
        `http://localhost:5000/patients/phone/${phone}`
      );

      if (patientResponse.ok) {
        const patientData =
          await patientResponse.json();

        setPatient(patientData.patient);

        await createVisit(
          patientData.patient.id
        );
      } else {
        setStep(4);
      }
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CREATE PATIENT
  // =========================

  const createPatient = async () => {
    if (
      !newPatient.name ||
      !newPatient.age ||
      !newPatient.gender
    ) {
      setError("Please fill all patient details");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/patients",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newPatient.name,
            age: Number(newPatient.age),
            gender: newPatient.gender,
            phone: phone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create patient"
        );
      }

      setPatient(data);

      await createVisit(data.id);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CREATE VISIT
  // =========================

  const createVisit = async (patientId) => {
    const response = await fetch(
      "http://localhost:5000/visits",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: patientId,
          doctorId: 1,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to create visit"
      );
    }

    setVisitId(data.id);

    console.log("Visit created:", data);

    setStep(5);
  };

  // =========================
  // SEND INTERVIEW ANSWER
  // =========================

  const sendAnswer = async () => {
    if (!answer.trim()) {
      return;
    }

    if (!visitId) {
      setError("Visit ID is missing");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const questionText = String(
        currentQuestion
      );

      const response = await fetch(
        "http://localhost:5000/interviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            visitId: Number(visitId),
            question: questionText,
            answer: answer.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to process interview response"
        );
      }

      // Add patient's answer to conversation
      if (data.response) {
        setInterviewResponses(
          (previous) => [
            ...previous,
            data.response,
          ]
        );
      }

      // Get next question from backend
      if (data.nextQuestion) {
        setCurrentQuestion(
          String(data.nextQuestion)
        );
      }

      // Clear input
      setAnswer("");
    } catch (error) {
      console.error(
        "Interview error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // STEP 1
  // LANGUAGE
  // =========================

  if (step === 1) {
    return (
      <div className="patient-screen">
        <div className="patient-card">

          <div className="patient-logo">
            ॥
          </div>

          <h1>Swasthya Setu</h1>

          <p className="patient-subtitle">
            Your Digital Health Assistant
          </p>

          <div className="patient-section">

            <span className="patient-step">
              STEP 1 OF 6
            </span>

            <h2>Select Your Language</h2>

            <p>
              Choose the language you are most
              comfortable with.
            </p>

          </div>

          <div className="language-grid">

            {languages.map((lang) => (
              <button
                key={lang}
                className={`language-btn ${
                  language === lang
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setLanguage(lang)
                }
              >
                {lang}
              </button>
            ))}

          </div>

          <button
            className="continue-btn"
            disabled={!language}
            onClick={() => setStep(2)}
          >
            Continue →
          </button>

        </div>
      </div>
    );
  }

  // =========================
  // STEP 2
  // PHONE
  // =========================

  if (step === 2) {
    return (
      <div className="patient-screen">
        <div className="patient-card">

          <div className="patient-logo">
            ॥
          </div>

          <h1>Swasthya Setu</h1>

          <p className="patient-subtitle">
            Secure Patient Access
          </p>

          <div className="patient-section">

            <span className="patient-step">
              STEP 2 OF 6
            </span>

            <h2>Verify Your Phone</h2>

            <p>
              Enter your registered phone number.
            </p>

          </div>

          <div className="patient-form">

            <label>
              Phone Number
            </label>

            <input
              type="tel"
              placeholder="Enter 10-digit phone number"
              value={phone}
              maxLength="10"
              onChange={(e) => {
                setPhone(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                );
              }}
            />

            {error && (
              <p className="patient-error">
                {error}
              </p>
            )}

            <button
              className="continue-btn"
              disabled={
                loading ||
                phone.length !== 10
              }
              onClick={sendOtp}
            >
              {loading
                ? "Sending OTP..."
                : "Send OTP →"}
            </button>

          </div>

        </div>
      </div>
    );
  }

  // =========================
  // STEP 3
  // OTP
  // =========================

  if (step === 3) {
    return (
      <div className="patient-screen">
        <div className="patient-card">

          <div className="patient-logo">
            ॥
          </div>

          <h1>Swasthya Setu</h1>

          <p className="patient-subtitle">
            Secure Patient Access
          </p>

          <div className="patient-section">

            <span className="patient-step">
              STEP 3 OF 6
            </span>

            <h2>Enter OTP</h2>

            <p>
              Enter the 6-digit OTP sent to{" "}
              <strong>{phone}</strong>
            </p>

          </div>

          <div className="patient-form">

            <label>
              One-Time Password
            </label>

            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit OTP"
              value={otp}
              maxLength="6"
              onChange={(e) => {
                setOtp(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                );
              }}
            />

            {error && (
              <p className="patient-error">
                {error}
              </p>
            )}

            <button
              className="continue-btn"
              disabled={
                loading ||
                otp.length !== 6
              }
              onClick={verifyOtp}
            >
              {loading
                ? "Verifying..."
                : "Verify OTP →"}
            </button>

            <button
              className="secondary-btn"
              disabled={loading}
              onClick={sendOtp}
            >
              Resend OTP
            </button>

          </div>

        </div>
      </div>
    );
  }

  // =========================
  // STEP 4
  // NEW PATIENT
  // =========================

  if (step === 4) {
    return (
      <div className="patient-screen">
        <div className="patient-card">

          <div className="patient-logo">
            ॥
          </div>

          <h1>Swasthya Setu</h1>

          <p className="patient-subtitle">
            Create Your Patient Profile
          </p>

          <div className="patient-section">

            <span className="patient-step">
              STEP 4 OF 6
            </span>

            <h2>Patient Information</h2>

            <p>
              We need a few details to create
              your profile.
            </p>

          </div>

          <div className="patient-form">

            <label>
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={newPatient.name}
              onChange={(e) =>
                setNewPatient({
                  ...newPatient,
                  name: e.target.value,
                })
              }
            />

            <label>
              Age
            </label>

            <input
              type="number"
              placeholder="Enter your age"
              value={newPatient.age}
              onChange={(e) =>
                setNewPatient({
                  ...newPatient,
                  age: e.target.value,
                })
              }
            />

            <label>
              Gender
            </label>

            <select
              value={newPatient.gender}
              onChange={(e) =>
                setNewPatient({
                  ...newPatient,
                  gender: e.target.value,
                })
              }
            >
              <option value="">
                Select gender
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Other">
                Other
              </option>
            </select>

            {error && (
              <p className="patient-error">
                {error}
              </p>
            )}

            <button
              className="continue-btn"
              disabled={loading}
              onClick={createPatient}
            >
              {loading
                ? "Creating Profile..."
                : "Continue →"}
            </button>

          </div>

        </div>
      </div>
    );
  }

  // =========================
  // STEP 5
  // CONSENT
  // =========================

  if (step === 5) {
    return (
      <div className="patient-screen">
        <div className="patient-card">

          <div className="patient-logo">
            ॥
          </div>

          <h1>Swasthya Setu</h1>

          <p className="patient-subtitle">
            Pre-Consultation Assessment
          </p>

          <div className="patient-section">

            <span className="patient-step">
              STEP 5 OF 6
            </span>

            <h2>Consent</h2>

            <p>
              Please review the information
              before continuing.
            </p>

          </div>

          <div className="consent-box">

            <p>
              I understand that the information
              I provide will be used to prepare
              my medical case for the doctor.
            </p>

            <p>
              I consent to the collection and
              processing of my information for
              this pre-consultation assessment.
            </p>

          </div>

          <button
            className="continue-btn"
            onClick={() => setStep(6)}
          >
            I Agree & Continue →
          </button>

        </div>
      </div>
    );
  }

  // =========================
  // STEP 6
  // INTERVIEW
  // =========================

  return (
    <div className="patient-screen">

      <div className="patient-card interview-card">

        <div className="patient-logo">
          ॥
        </div>

        <h1>Swasthya Setu</h1>

        <p className="patient-subtitle">
          Your Digital Health Assistant
        </p>

        <div className="patient-section">

          <span className="patient-step">
            STEP 6 OF 6
          </span>

          <h2>Health Interview</h2>

          <p>
            Please answer a few questions
            about your health.
          </p>

        </div>

        {/* PATIENT ANSWERS */}

        {interviewResponses.map((item) => (
  <div key={item.id} className="interview-history">

    <div className="previous-question">
      <strong>Swasthya Setu Assistant</strong>
      <p>{item.question}</p>
    </div>

    <div className="patient-answer">
      <strong>You</strong>
      <p>{item.answer}</p>
    </div>

  </div>
))}


        
        {/* AI QUESTION */}

        <div className="ai-message">

          <div className="ai-avatar">
            🤖
          </div>

          <div>

            <strong>
              Swasthya Setu Assistant
            </strong>

            <p>
              Hello{" "}
              {patient?.name || "there"} 👋
              <br />
              {currentQuestion}
            </p>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <p className="patient-error">
            {error}
          </p>
        )}

        {/* ANSWER */}

        <div className="interview-input-area">

          <textarea
            rows="4"
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) =>
              setAnswer(e.target.value)
            }
          />

          <button
            className="continue-btn"
            disabled={
              loading ||
              !answer.trim()
            }
            onClick={sendAnswer}
          >
            {loading
              ? "Processing..."
              : "Send →"}
          </button>

        </div>

        <div className="visit-info">
          Visit ID: #{visitId}
        </div>

      </div>

    </div>
  );
}

export default App;