import { useEffect, useState } from "react";
import "./App.css";

const statusLabel = {
  WAITING: "Waiting",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

function App() {
const [visitId, setVisitId] = useState(1);
const [visit, setVisit] = useState(null);
const [visits, setVisits] = useState([]);
const [error, setError] = useState("");

const [theme, setTheme] = useState("forest");


useEffect(() => {
  fetch("http://localhost:5000/visits")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch queue");
      }

      return response.json();
    })
    .then((data) => {
      setVisits(data);
    })
    .catch((error) => {
      console.error(error);
    });
}, []);



  useEffect(() => {
    setVisit(null);
    setError("");

    fetch(`http://localhost:5000/visits/${visitId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Patient case not found");
        }

        return response.json();
      })
      .then((data) => {
        setVisit(data);
      })
      .catch((error) => {
        console.error(error);
        setError("Unable to load patient case");
      });
  }, [visitId]);

  if (error) {
    return <div className="error-screen">{error}</div>;
  }

  if (!visit) {
    return <div className="loading-screen">Loading patient case...</div>;
  }

  return (
    <div className={`app theme-${theme}`}>

      {/* HEADER */}

      <div className="topbar">

        <div className="brand">

          <span className="brand-mark">॥</span>

          <div>
            <h1>Swasthya Setu</h1>
            <p className="subtitle">Doctor Dashboard</p>
          </div>

        </div>


        <div className="topbar-right">

          <div className="theme-switcher">

            <button
              className={`theme-dot ${
                theme === "forest" ? "active" : ""
              }`}
              data-theme="forest"
              onClick={() => setTheme("forest")}
              style={{ "--dot": "#4ADE80" }}
              aria-label="Forest theme"
            />

            <button
              className={`theme-dot ${
                theme === "ocean" ? "active" : ""
              }`}
              data-theme="ocean"
              onClick={() => setTheme("ocean")}
              style={{ "--dot": "#60A5FA" }}
              aria-label="Ocean theme"
            />

            <button
              className={`theme-dot ${
                theme === "sun" ? "active" : ""
              }`}
              data-theme="sun"
              onClick={() => setTheme("sun")}
              style={{ "--dot": "#F5A623" }}
              aria-label="Sun theme"
            />

            <button
              className={`theme-dot ${
                theme === "orchid" ? "active" : ""
              }`}
              data-theme="orchid"
              onClick={() => setTheme("orchid")}
              style={{ "--dot": "#B07CF7" }}
              aria-label="Orchid theme"
            />

            <button
              className={`theme-dot ${
                theme === "midnight" ? "active" : ""
              }`}
              data-theme="midnight"
              onClick={() => setTheme("midnight")}
              style={{ "--dot": "#EAB308" }}
              aria-label="Midnight theme"
            >
              ☾
            </button>

          </div>

        </div>

      </div>


      {/* MAIN LAYOUT */}

      <main className="layout">

        {/* QUEUE */}

        <aside className="queue">

          <p className="queue-label">
            Today's Queue
          </p>

          <div className="queue-list">

  {visits.map((item) => (

    <div
      className={`queue-item ${
        item.id === visitId ? "active" : ""
      }`}
      key={item.id}
      onClick={() => setVisitId(item.id)}
    >

      <span
        className={`queue-dot ${
          item.status === "WAITING"
            ? "waiting"
            : ""
        }`}
      ></span>

      <div>

        <div className="queue-item-name">
          {item.patient.name}
        </div>

        <div className="queue-item-sub">
          Visit #{item.id} ·{" "}
          {statusLabel[item.status] || item.status}
        </div>

      </div>

    </div>

  ))}

</div>

        </aside>


        {/* MAIN COLUMN */}

        <div className="main-column">

          {/* PATIENT + VISIT */}

          <section className="card header-card">

            <div className="header-grid">

              <div className="patient-block">

                <div className="patient-name-row">

                  <h2>
                    {visit.patient.name}
                  </h2>

                  <span className="status-pill">
                    {statusLabel[visit.status] || visit.status}
                  </span>

                </div>

                <div className="meta-row">

                  <span>
                    {visit.patient.age} yrs ·{" "}
                    {visit.patient.gender} ·{" "}
                    {visit.patient.phone}
                  </span>

                </div>

              </div>


              <div className="visit-block">

                <div className="visit-field">

                  <span className="field-label">
                    Doctor
                  </span>

                  <span className="field-value">
                    {visit.doctor.name}
                  </span>

                </div>


                <div className="visit-field">

                  <span className="field-label">
                    Department
                  </span>

                  <span className="field-value">
                    {visit.doctor.department}
                  </span>

                </div>


                <div className="visit-field">

                  <span className="field-label">
                    Visit ID
                  </span>

                  <span className="field-value">
                    #{visit.id}
                  </span>

                </div>

              </div>

            </div>

          </section>


          <div className="two-col">

            {/* LEFT COLUMN */}

            <div className="col-main">

              {/* INTERVIEW */}

              <section className="card">

                <h3 className="section-title">
                  Patient Interview
                </h3>

                <div className="qa-list">

                  {visit.interviewResponses.length > 0 ? (

                    visit.interviewResponses.map((item) => (

                      <div
                        className="qa-item"
                        key={item.id}
                      >

                        <div className="qa-q">
                          {item.question}
                        </div>

                        <div className="qa-a">
                          {item.answer}
                        </div>

                      </div>

                    ))

                  ) : (

                    <p>
                      No interview responses yet.
                    </p>

                  )}

                </div>

              </section>


              {/* AYUSH */}

              <section className="card">

                <div className="section-title-row">

                  <h3 className="section-title">
                    AYUSH Assessment
                  </h3>

                  <span className="section-note">
                    Ayurvedic constitution &amp; signs
                  </span>

                </div>


                <div className="ayush-grid">

                  <AyushCard
                    icon="🌿"
                    label="Prakriti"
                    value={visit.ayushAssessment?.prakriti}
                    status="ok"
                  />

                  <AyushCard
                    icon="⚖️"
                    label="Vikriti"
                    value={visit.ayushAssessment?.vikriti}
                    status="mild"
                  />

                  <AyushCard
                    icon="💓"
                    label="Pulse"
                    value={visit.ayushAssessment?.pulse}
                    status="ok"
                  />

                  <AyushCard
                    icon="👅"
                    label="Tongue"
                    value={visit.ayushAssessment?.tongue}
                    status="mild"
                  />

                  <AyushCard
                    icon="◉"
                    label="Appearance"
                    value={visit.ayushAssessment?.appearance}
                    status="ok"
                  />

                  <AyushCard
                    icon="🍽️"
                    label="Appetite"
                    value={visit.ayushAssessment?.appetite}
                    status="alert"
                  />

                  <AyushCard
                    icon="◒"
                    label="Sleep"
                    value={visit.ayushAssessment?.sleep}
                    status="mild"
                  />

                  <AyushCard
                    icon="◉"
                    label="Bowel"
                    value={visit.ayushAssessment?.bowel}
                    status="ok"
                  />

                </div>

              </section>

            </div>


            {/* RIGHT COLUMN */}

            <div className="col-side">

              {/* VITALS */}

              <section className="card">

                <h3 className="section-title">
                  Vitals Snapshot
                </h3>

                <div className="vitals-list">

                  <div className="vital-row">
  <span className="vital-name">
    Temperature
  </span>

  <span className="vital-val">
    {visit.vitals?.temperature || "Not available"}
  </span>
</div>

<div className="vital-row">
  <span className="vital-name">
    BP
  </span>

  <span className="vital-val">
    {visit.vitals?.bloodPressure || "Not available"}
  </span>
</div>

<div className="vital-row">
  <span className="vital-name">
    Pulse rate
  </span>

  <span className="vital-val">
    {visit.vitals?.pulseRate || "Not available"}
  </span>
</div>

<div className="vital-row">
  <span className="vital-name">
    SpO2
  </span>

  <span className="vital-val">
    {visit.vitals?.spo2 || "Not available"}
  </span>
</div>

                  
                </div>

              </section>


              {/* DOCUMENTS */}

              <section className="card">

                <h3 className="section-title">
                  Previous Documents
                </h3>

                <div className="doc-list">

                  {visit.documents.length > 0 ? (

                    visit.documents.map((doc) => (

                      <div
                        className="doc-row"
                        key={doc.id}
                      >

                        <span className="doc-icon">
                          📄
                        </span>

                        <span className="doc-name">
                          {doc.fileName}
                        </span>

                        <span className="doc-date">
                          {new Date(
                            doc.uploadedAt
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>

                      </div>

                    ))

                  ) : (

                    <p>
                      No documents uploaded yet.
                    </p>

                  )}

                </div>

              </section>

            </div>

          </div>


          {/* VISIT ID */}

          <div className="visit-selector">

            <label>
              Select Visit:
            </label>

            <input
              type="number"
              min="1"
              value={visitId}
              onChange={(e) => {
                setVisitId(Number(e.target.value));
              }}
            />

          </div>

        </div>

      </main>

    </div>
  );
}


function AyushCard({
  icon,
  label,
  value,
  status,
}) {
  const tagText = {
    ok: "Balanced",
    mild: "Mild",
    alert: "Attention",
  };

  return (
    <div className={`ayush-card status-${status}`}>

      <span className="ayush-icon">
        {icon}
      </span>

      <div className="ayush-label">
        {label}
      </div>

      <div className="ayush-value">
        {value || "Not available"}
      </div>

      <span className="ayush-tag">
        {tagText[status]}
      </span>

    </div>
  );
}


export default App;