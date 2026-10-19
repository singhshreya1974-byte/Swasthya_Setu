import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";


import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";




function analyzeInterview(answer, previousResponses) {
    const allAnswers = [
        ...previousResponses.map((item) => item.answer),
        answer,
    ];

    const combinedText = allAnswers
        .join(" ")
        .toLowerCase();

    const state = {
        chiefComplaint: null,
        duration: null,
        onset: null,
        severity: null,
        location: null,
        pattern: null,
        triggers: [],
        relievingFactors: [],
        associatedSymptoms: [],
        medicines: [],
        allergies: null,
        medicalHistory: [],
        previousSimilarEpisodes: null,
        redFlags: [],
        questionsAsked: previousResponses.map(
            (item) => item.question
        ),
    };

    // =========================================
    // CHIEF COMPLAINT
    // =========================================
    
    // Try to extract the complaint from the
    // patient's first answer rather than limiting
    // ourselves to specific diseases.
    
    if (allAnswers.length > 0) {
        const firstAnswer = allAnswers[0].trim();

        if (firstAnswer.length > 0) {
            state.chiefComplaint = firstAnswer;
        }
    }

    // =========================================
    // DURATION
    // =========================================

    const durationMatch = combinedText.match(
        /(?:for|since|from|about|around)\s+(\d+)\s+(day|days|week|weeks|month|months|year|years)/
    );

    if (durationMatch) {
        state.duration =
            `${durationMatch[1]} ${durationMatch[2]}`;
    }

    // =========================================
    // ONSET
    // =========================================

    if (
        combinedText.includes("suddenly") ||
        combinedText.includes("sudden")
    ) {
        state.onset = "Sudden";
    } else if (
        combinedText.includes("gradually") ||
        combinedText.includes("gradual")
    ) {
        state.onset = "Gradual";
    }

    // =========================================
    // SEVERITY
    // =========================================

    if (
        combinedText.includes("severe") ||
        combinedText.includes("unbearable") ||
        combinedText.includes("extreme")
    ) {
        state.severity = "Severe";
    } else if (
        combinedText.includes("moderate")
    ) {
        state.severity = "Moderate";
    } else if (
        combinedText.includes("mild")
    ) {
        state.severity = "Mild";
    }

    // Numeric pain scale
    const painScaleMatch =
        combinedText.match(
            /(?:pain|severity).*?(\d+)\s*(?:\/\s*10|out of 10)/
        );

    if (painScaleMatch) {
        state.severity =
            `${painScaleMatch[1]}/10`;
    }

    // =========================================
    // PATTERN
    // =========================================

    if (
        combinedText.includes("comes and goes") ||
        combinedText.includes("intermittent")
    ) {
        state.pattern = "Intermittent";
    } else if (
        combinedText.includes("constant") ||
        combinedText.includes("continuous")
    ) {
        state.pattern = "Constant";
    }

    // =========================================
    // LOCATION
    // =========================================

    const locations = [
        "chest",
        "abdomen",
        "stomach",
        "head",
        "neck",
        "back",
        "shoulder",
        "arm",
        "leg",
        "knee",
        "hip",
        "throat",
        "ear",
        "eye",
        "skin",
    ];

    locations.forEach((location) => {
        if (combinedText.includes(location)) {
            if (!state.location) {
                state.location = location;
            }
        }
    });

    // =========================================
    // TRIGGERS
    // =========================================

    const triggerPhrases = [
        "after eating",
        "before eating",
        "while eating",
        "after exercise",
        "during exercise",
        "while walking",
        "when walking",
        "while climbing stairs",
        "after taking medicine",
        "at night",
        "in the morning",
        "in the evening",
        "when lying down",
        "when standing",
    ];

    triggerPhrases.forEach((trigger) => {
        if (combinedText.includes(trigger)) {
            state.triggers.push(trigger);
        }
    });

    // =========================================
    // RELIEVING FACTORS
    // =========================================

    const relievingPhrases = [
        "gets better with rest",
        "better with rest",
        "improves with rest",
        "gets better after medicine",
        "better after medicine",
        "improves after medicine",
        "gets better when lying down",
        "better when lying down",
    ];

    relievingPhrases.forEach((factor) => {
        if (combinedText.includes(factor)) {
            state.relievingFactors.push(factor);
        }
    });

    // =========================================
    // ASSOCIATED SYMPTOMS
    // =========================================

    const symptoms = [
        "fever",
        "headache",
        "cough",
        "cold",
        "nausea",
        "vomiting",
        "dizziness",
        "chills",
        "weakness",
        "fatigue",
        "body pain",
        "breathing difficulty",
        "shortness of breath",
        "sweating",
        "palpitations",
        "diarrhea",
        "loose motion",
        "constipation",
        "abdominal pain",
        "loss of appetite",
        "loss of consciousness",
        "blurred vision",
        "rash",
        "swelling",
        "bleeding",
    ];

    symptoms.forEach((symptom) => {
        if (combinedText.includes(symptom)) {
            if (
                !state.associatedSymptoms.includes(
                    symptom
                )
            ) {
                state.associatedSymptoms.push(
                    symptom
                );
            }
        }
    });

    // =========================================
    // MEDICINES
    // =========================================

    if (
        combinedText.includes("medicine") ||
        combinedText.includes("medication") ||
        combinedText.includes("tablet") ||
        combinedText.includes("capsule")
    ) {
        state.medicines.push(
            "Patient reported taking or using medication"
        );
    }

    // =========================================
    // ALLERGIES
    // =========================================

    if (
        combinedText.includes("no allergy") ||
        combinedText.includes("no known allergy") ||
        combinedText.includes("not allergic")
    ) {
        state.allergies = "No allergy reported";
    } else if (
        combinedText.includes("allergic") ||
        combinedText.includes("allergy")
    ) {
        state.allergies =
            "Possible allergy mentioned — details require clarification";
    }

    // =========================================
    // PREVIOUS EPISODES
    // =========================================

    if (
        combinedText.includes("first time") ||
        combinedText.includes("never happened before")
    ) {
        state.previousSimilarEpisodes = false;
    } else if (
        combinedText.includes("happened before") ||
        combinedText.includes("had this before") ||
        combinedText.includes("similar episode")
    ) {
        state.previousSimilarEpisodes = true;
    }

    // =========================================
    // MEDICAL HISTORY
    // =========================================

    const conditions = [
        "diabetes",
        "hypertension",
        "high blood pressure",
        "asthma",
        "thyroid",
        "heart disease",
        "kidney disease",
        "liver disease",
        "epilepsy",
        "arthritis",
    ];

    conditions.forEach((condition) => {
        if (combinedText.includes(condition)) {
            state.medicalHistory.push(condition);
        }
    });

    // =========================================
    // RED-FLAG TERMS
    // =========================================

    const redFlagTerms = [
        "severe breathing difficulty",
        "cannot breathe",
        "loss of consciousness",
        "fainted",
        "unconscious",
        "severe bleeding",
        "vomiting blood",
        "blood in vomit",
        "blood in stool",
        "sudden weakness",
        "sudden paralysis",
        "severe chest pain",
    ];

    redFlagTerms.forEach((flag) => {
        if (combinedText.includes(flag)) {
            state.redFlags.push(flag);
        }
    });

    return state;
}





const app = express();

app.use(cors());
app.use(express.json());

const adapter = new PrismaMariaDb({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "swasthya_setu",
    connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

app.get("/", (req, res) => {
    res.send("Swasthya Setu Backend is running");
});

app.get("/patients", async (req, res) => {
    try {
        const patients = await prisma.patient.findMany();
        res.json(patients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database connection failed" });
    }
});

app.post("/patients", async (req, res) => {
    try {
        const { name, age, gender, phone } = req.body;

        const patient = await prisma.patient.create({
            data: {
                name,
                age,
                gender,
                phone,
            },
        });

        res.status(201).json(patient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create patient" });
    }
});



app.post("/auth/send-otp", async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                error: "Phone number is required",
            });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP before storing it
        const otpHash = await bcrypt.hash(otp, 10);

        // OTP valid for 5 minutes
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await prisma.otpVerification.create({
            data: {
                phone,
                otpHash,
                expiresAt,
            },
        });

        // Development only:
        // Later this will be replaced by an SMS provider.
        console.log(`OTP for ${phone}: ${otp}`);

        res.json({
            message: "OTP sent successfully",
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to send OTP",
        });
    }
});

app.post("/auth/verify-otp", async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                error: "Phone number and OTP are required",
            });
        }

        // Get the latest OTP for this phone number
        const otpRecord = await prisma.otpVerification.findFirst({
            where: {
                phone,
                verified: false,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (!otpRecord) {
            return res.status(400).json({
                error: "OTP not found",
            });
        }

        // Check expiry
        if (new Date() > otpRecord.expiresAt) {
            return res.status(400).json({
                error: "OTP has expired",
            });
        }

        // Compare entered OTP with stored hash
        const isValid = await bcrypt.compare(
            otp,
            otpRecord.otpHash
        );

        if (!isValid) {
            return res.status(400).json({
                error: "Invalid OTP",
            });
        }

        // Mark OTP as verified
        await prisma.otpVerification.update({
            where: {
                id: otpRecord.id,
            },
            data: {
                verified: true,
            },
        });

        res.json({
            message: "OTP verified successfully",
            phone,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to verify OTP",
        });
    }
});

app.get("/patients/phone/:phone", async (req, res) => {
    try {
        const phone = req.params.phone;

        const patient = await prisma.patient.findUnique({
            where: {
                phone: phone,
            },
        });

        if (!patient) {
            return res.status(404).json({
                found: false,
                message: "Patient not found",
            });
        }

        res.json({
            found: true,
            patient,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to find patient",
        });
    }
});




const PORT = 5000;


app.post("/visits", async (req, res) => {
    try {
        const { patientId, doctorId } = req.body;

        const visit = await prisma.visit.create({
            data: {
                patientId,
                doctorId,
            },
        });

        res.status(201).json(visit);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create visit" });
    }
});


app.get("/visits", async (req, res) => {
    try {
        const visits = await prisma.visit.findMany({
            include: {
                patient: true,
                doctor: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        res.json(visits);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch visits",
        });
    }
});


app.post("/interviews", async (req, res) => {
    try {
        const { visitId, question, answer } = req.body;

        if (!visitId || !question || !answer) {
            return res.status(400).json({
                error: "visitId, question and answer are required",
            });
        }

        const numericVisitId = Number(visitId);

        // Check whether the visit exists
        const visit = await prisma.visit.findUnique({
            where: {
                id: numericVisitId,
            },
        });

        if (!visit) {
            return res.status(404).json({
                error: "Visit not found",
            });
        }

        // Get previous answers BEFORE saving the new answer
        const previousResponses =
            await prisma.interviewResponse.findMany({
                where: {
                    visitId: numericVisitId,
                },
                orderBy: {
                    createdAt: "asc",
                },
            });

        // Save current answer
        const response =
            await prisma.interviewResponse.create({
                data: {
                    visitId: numericVisitId,
                    question: question.trim(),
                    answer: answer.trim(),
                },
            });

        // Analyze the complete interview
        const interviewState = analyzeInterview(
            answer,
            previousResponses
        );


        await prisma.visit.update({
    where: {
        id: numericVisitId,
    },
    data: {
        interviewState: interviewState,
    },
});

        // -----------------------------------------
        // SELECT NEXT QUESTION
        // -----------------------------------------

        

        res.status(201).json({
            response,
            nextQuestion,
            interviewState,
            interviewCount:
                previousResponses.length + 1,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to process interview response",
        });
    }
});


app.get("/interviews/:visitId", async (req, res) => {
    try {
        const visitId = Number(req.params.visitId);

        const responses = await prisma.interviewResponse.findMany({
            where: {
                visitId: visitId,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        res.json(responses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch interview responses" });
    }
});



app.post("/documents", async (req, res) => {
    try {
        const { visitId, fileName, fileType, fileUrl } = req.body;

        const document = await prisma.document.create({
            data: {
                visitId,
                fileName,
                fileType,
                fileUrl,
            },
        });

        res.status(201).json(document);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save document" });
    }
});


app.post("/ayush", async (req, res) => {
    try {
        const {
            visitId,
            prakriti,
            vikriti,
            pulse,
            tongue,
            appearance,
            appetite,
            sleep,
            bowel
        } = req.body;

        const assessment = await prisma.ayushAssessment.create({
            data: {
                visitId,
                prakriti,
                vikriti,
                pulse,
                tongue,
                appearance,
                appetite,
                sleep,
                bowel
            }
        });

        res.status(201).json(assessment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save AYUSH assessment" });
    }
});


app.get("/ayush/:visitId", async (req, res) => {
    try {
        const visitId = Number(req.params.visitId);

        const assessment = await prisma.ayushAssessment.findUnique({
            where: {
                visitId: visitId,
            },
        });

        res.json(assessment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch AYUSH assessment" });
    }
});

app.post("/vitals", async (req, res) => {
    try {
        const {
            visitId,
            temperature,
            bloodPressure,
            pulseRate,
            spo2
        } = req.body;

        const vitals = await prisma.vitals.create({
            data: {
                visitId,
                temperature,
                bloodPressure,
                pulseRate,
                spo2
            }
        });

        res.status(201).json(vitals);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to save vitals"
        });
    }
});


app.get("/vitals/:visitId", async (req, res) => {
    try {
        const visitId = Number(req.params.visitId);

        const vitals = await prisma.vitals.findUnique({
            where: {
                visitId: visitId,
            },
        });

        if (!vitals) {
            return res.status(404).json({
                error: "Vitals not found",
            });
        }

        res.json(vitals);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch vitals",
        });
    }
});


app.get("/visits/:id", async (req, res) => {
    try {
        const visitId = Number(req.params.id);

        const visit = await prisma.visit.findUnique({
            where: {
                id: visitId,
            },
            include: {
                patient: true,
                doctor: true,
                interviewResponses: true,
                documents: true,
                ayushAssessment: true,
                vitals: true,
            },
        });

        if (!visit) {
            return res.status(404).json({
                error: "Visit not found",
            });
        }

        res.json(visit);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch visit",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


app.get("/documents/:visitId", async (req, res) => {
    try {
        const visitId = Number(req.params.visitId);

        const documents = await prisma.document.findMany({
            where: {
                visitId: visitId,
            },
            orderBy: {
                uploadedAt: "asc",
            },
        });

        res.json(documents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch documents" });
    }
});


app.post("/doctors", async (req, res) => {
    try {
        const { name, department } = req.body;

        const doctor = await prisma.doctor.create({
            data: {
                name,
                department,
            },
        });

        res.status(201).json(doctor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create doctor" });
    }
});



