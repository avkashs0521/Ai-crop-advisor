// Configuration
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/dH4iCaSNQ/";
const GEMINI_API_KEY = "AIzaSyD-CJe-nhOjprDyE1X5LmjB0WLg0chwdwM"; // User Gemini Vision Token
// DOM Elements
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const imagePreview = document.getElementById("image-preview");
const actionContainer = document.getElementById("action-container");
const analyzeBtn = document.getElementById("analyze-btn");
const resetBtn = document.getElementById("reset-btn");
const resultsSection = document.getElementById("results-section");
const btnText = document.querySelector(".btn-text");
const spinner = document.getElementById("loading-spinner");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history");

// State
let model;
let currentImageURL = null;
let maxPredictions;

// Initialization
async function initModel() {
    try {
        // Appending timestamp to bypass browser cache if you recently updated your Teachable Machine model
        const cacheBuster = "?t=" + new Date().getTime();
        const modelURL = MODEL_URL + "model.json" + cacheBuster;
        const metadataURL = MODEL_URL + "metadata.json" + cacheBuster;
        
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("Model loaded successfully");
    } catch (error) {
        console.error("Error loading model:", error);
        alert("Failed to load AI model. Please check console for details.");
    }
}

// Ensure model loads on page startup
initModel();
loadHistory();

// Drag and Drop Handlers
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageUpload(e.dataTransfer.files[0]);
    }
});

// Click to Upload
fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
        handleImageUpload(e.target.files[0]);
    }
});

function handleImageUpload(file) {
    if (!file.type.match("image.*")) {
        alert("Please upload an image file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageURL = e.target.result;
        imagePreview.src = currentImageURL;
        imagePreview.classList.remove("hidden");
        document.querySelector(".drop-content").classList.add("hidden");
        actionContainer.classList.remove("hidden");
        
        // Reset view
        resultsSection.classList.add("hidden");
    };
    reader.readAsDataURL(file);
}

// Analysis Logic
analyzeBtn.addEventListener("click", async () => {
    if (!model) {
        alert("Model is still loading. Please wait a moment and try again.");
        return;
    }

    if (!currentImageURL) {
        alert("Please upload an image first.");
        return;
    }

    setLoadingState(true);
    resultsSection.classList.remove("hidden");
    document.getElementById("advisory-content").innerHTML = `<div class="loading-pulse">Generating advice from AI...</div>`;
    
    // Create an image element for prediction
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentImageURL;
    
    img.onload = async () => {
        try {
            // Predict
            const predictions = await model.predict(img);
            
            // Sort by probability
            predictions.sort((a, b) => b.probability - a.probability);
            const topPrediction = predictions[0];
            const diseaseName = topPrediction.className;
            const confidence = (topPrediction.probability * 100).toFixed(1);
            
            // Execute the pipeline (which will now handle all UI rendering dynamically)
            executeDiagnosticPipeline(diseaseName, confidence);

        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Error analyzing the image.");
        } finally {
            setLoadingState(false);
        }
    };
});

// Execute pipeline (used for both initial prediction and manual override)
async function executeDiagnosticPipeline(diseaseName, confidence = "100.0") {
    // 1. Initial Processing UI state
    document.getElementById("disease-name").innerHTML = `<span class="loading-pulse" style="color: var(--text-muted); font-size: 1.2rem;">Analyzing crop patterns...</span>`;
    document.getElementById("advisory-content").innerHTML = `<div class="loading-pulse">Running advanced diagnostic cross-check...</div>`;
    document.getElementById("confidence-percentage").textContent = `0%`;
    document.getElementById("confidence-fill").style.width = `0%`;
    
    try {
        const geminiResult = await verifyWithGemini(diseaseName, currentImageURL);
        const finalDisease = geminiResult.final_diagnosis;
        
        // Display final unified result
        document.getElementById("disease-name").textContent = finalDisease;
        document.getElementById("confidence-percentage").textContent = `${confidence}%`;
        setTimeout(() => {
            document.getElementById("confidence-fill").style.width = `${confidence}%`;
        }, 100);
        
        const originalClean = diseaseName.toLowerCase().replace(/[^a-z]/g, "");
        const newClean = finalDisease.toLowerCase().replace(/[^a-z]/g, "");
        
        // Define status badge styling
        const badge = document.getElementById("status-badge");
        if (newClean.includes("healthy") || newClean.includes("normal")) {
            badge.className = "badge success";
            badge.textContent = "Safe / Healthy";
        } else if (newClean.includes("blight") || newClean.includes("mold") || newClean.includes("spot")) {
            badge.className = "badge danger";
            badge.textContent = "High Risk";
        } else {
            badge.className = "badge warning";
            badge.textContent = "Attention Needed";
        }

        // Save history using FINAL disease
        if (currentImageURL) {
            saveToHistory(finalDisease, confidence, currentImageURL);
        }

        // Re-run Logic engine with Gemini's extracted symptoms
        runLogicEngine(finalDisease, geminiResult.symptoms_found);

        // Update advisory
        document.getElementById("advisory-content").innerHTML = `<div style="white-space: pre-line;"><i><strong>Analysis:</strong> ${geminiResult.reasoning}</i><br><br>${geminiResult.advisory}</div>`;
        
    } catch(err) {
        console.error("Gemini check failed", err);
        // Fallback to offline logic
        document.getElementById("disease-name").textContent = diseaseName;
        document.getElementById("confidence-percentage").textContent = `${confidence}%`;
        setTimeout(() => {
            document.getElementById("confidence-fill").style.width = `${confidence}%`;
        }, 100);
        
        runLogicEngine(diseaseName);
        document.getElementById("advisory-content").innerHTML = `
            <div style="color: var(--danger)">
                <strong>Failed to load advanced AI.</strong><br>
                Fallback: ${getFallbackAdvice(diseaseName)}
            </div>`;
        if (currentImageURL) saveToHistory(diseaseName, confidence, currentImageURL);
    }
}

async function verifyWithGemini(diseaseName, imageSrc) {
    const base64Data = imageSrc.split(",")[1];
    const mimeType = imageSrc.split(";")[0].split(":")[1];

    const prompt = `You are an expert plant pathologist. A simple computer vision CNN model just predicted this crop leaf has "${diseaseName}". 
    Look at the leaf image carefully and cross-examine the visual evidence. Do you agree with this diagnosis? If it is wrong (for example, it guessed Early Blight but it is actually Leaf Mold), state the correct actual disease.
    
    Provide output in EXACTLY this JSON format and nothing else:
    {
      "final_diagnosis": "Disease Name (e.g. Leaf Mold)",
      "reasoning": "Brief 1-2 sentence explanation of what visual symptoms you observe in the image that proves your diagnosis.",
      "symptoms_found": ["spots=brown", "leaf=curling", "underside=olive_mold"],
      "advisory": "<b>Actionable Treatment:</b>\\n- point 1\\n- point 2"
    }`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: prompt },
                    { inline_data: { mime_type: mimeType, data: base64Data } }
                ]
            }],
            generationConfig: {
                temperature: 0.1,
                response_mime_type: "application/json"
            }
        })
    });
    
    if (!response.ok) throw new Error("Gemini API Error");
    const result = await response.json();
    return JSON.parse(result.candidates[0].content.parts[0].text);
}

function getFallbackAdvice(diseaseName) {
    const lowerName = diseaseName.toLowerCase();
    if (lowerName.includes("healthy")) {
        return "No action needed. Maintain current watering and nutrient schedule.";
    } else if (lowerName.includes("early blight")) {
        return "Apply copper-based fungicide and improve air circulation.";
    } else if (lowerName.includes("late blight")) {
        return "Remove infected leaves and avoid excess moisture.";
    } else if (lowerName.includes("spot")) {
        return "Avoid overheard watering and apply a protective fungicide.";
    }
    return "Quarantine the affected plant to prevent spread, and consult a local agricultural expert.";
}

// Milestone 2 Logic Engine
function runLogicEngine(diseaseName, geminiSymptoms = null) {
    const logicContent = document.getElementById("logic-content");
    const lowerName = diseaseName.toLowerCase();
    let symptoms = [];
    let diagnosisState = "";
    
    // Step 1: Knowledge Map Extraction (Gemini Vision Output or Fallback)
    if (geminiSymptoms && geminiSymptoms.length > 0) {
        symptoms = geminiSymptoms;
    } else if (lowerName.includes("early blight") || lowerName.includes("early_blight")) {
        symptoms = ["spots=brown", "pattern=concentric_rings", "leaf=yellowing"];
    } else if (lowerName.includes("late blight") || lowerName.includes("late_blight")) {
        symptoms = ["lesions=water_soaked", "growth=white_fuzz", "weather=wet"];
    } else if (lowerName.includes("leaf mold") || lowerName.includes("leaf_mold")) {
        symptoms = ["spots=pale_green_to_yellow", "underside=olive_green_mold", "leaf=curling"];
    } else if (lowerName.includes("leaf spot") || lowerName.includes("leaf_spot")) {
        symptoms = ["spots=small_dark_circular", "centers=gray_or_white", "margin=reddish"];
    } else if (lowerName.includes("healthy") || lowerName.includes("normal")) {
        symptoms = ["leaf=solid_green", "spots=none", "wilting=false"];
    } else {
         symptoms = ["spots=unidentified", "texture=abnormal"];
    }

    // Step 2: Assemble the Logic Visuals
    let html = `
        <div class="logic-step"><strong>1. AI Feature Extraction Mapping:</strong><br>
        [ ${symptoms.map(s => `<span class="logic-code">${s}</span>`).join(", ")} ]</div>
    `;

    // Step 3: Logical Rule Evaluation
    html += `<div class="logic-step"><strong>2. Applying Logical Rules Matrix:</strong><br>`;
    
    if (symptoms.includes("spots=brown") && symptoms.includes("leaf=yellowing")) {
        html += `Rule match: IF <span class="logic-code">spots=brown AND leaf=yellow</span> &rarr; Target is Early Blight.<br>`;
        diagnosisState = "Early Blight Confirmed";
    } else if (symptoms.includes("lesions=water_soaked")) {
        html += `Rule match: IF <span class="logic-code">lesions=water_soaked AND growth=white_fuzz</span> &rarr; Target is Late Blight.<br>`;
        diagnosisState = "Late Blight Confirmed";
    } else if (symptoms.includes("underside=olive_green_mold")) {
        html += `Rule match: IF <span class="logic-code">spots=yellow AND underside=olive_mold</span> &rarr; Target is Leaf Mold.<br>`;
        diagnosisState = "Leaf Mold Confirmed";
    } else if (symptoms.includes("centers=gray_or_white")) {
        html += `Rule match: IF <span class="logic-code">spots=circular AND centers=gray</span> &rarr; Target is Leaf Spot.<br>`;
        diagnosisState = "Leaf Spot Confirmed";
    } else if (symptoms.includes("spots=none")) {
        html += `Rule match: IF <span class="logic-code">spots=none AND wilting=false</span> &rarr; Target is Healthy.<br>`;
        diagnosisState = "Plant Healthy Confirmed";
    } else {
        html += `Applying generic pathogen rules...<br>`;
        diagnosisState = "Uncategorized Pathogen Confirmed";
    }
    
    html += `</div>`;
    
    // Step 4: Final Outcome
    html += `<div class="logic-step" style="border-left-color:var(--success);"><strong>3. Diagnosis Resolution:</strong><br>
    Final State: <strong>${diagnosisState}</strong></div>`;

    logicContent.innerHTML = html;
}

// Reset Logic
resetBtn.addEventListener("click", () => {
    currentImageURL = null;
    fileInput.value = "";
    imagePreview.classList.add("hidden");
    imagePreview.src = "";
    document.querySelector(".drop-content").classList.remove("hidden");
    actionContainer.classList.add("hidden");
    resultsSection.classList.add("hidden");
    document.getElementById("logic-content").innerHTML = `<div class="loading-pulse">Evaluating rules...</div>`;
    
    // reset bars
    document.getElementById("confidence-fill").style.width = `0%`;
});

function setLoadingState(isLoading) {
    if (isLoading) {
        analyzeBtn.disabled = true;
        btnText.textContent = "Analyzing...";
        spinner.classList.remove("hidden");
    } else {
        analyzeBtn.disabled = false;
        btnText.textContent = "Analyze Crop";
        spinner.classList.add("hidden");
    }
}

// History Management
function saveToHistory(disease, confidence, imageSrc) {
    let history = JSON.parse(localStorage.getItem("cropHistory")) || [];
    const newItem = {
        id: Date.now(),
        disease,
        confidence,
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
        // To avoid localStorage quota issues with large base64 strings, we can compress or just keep a small subset
        image: imageSrc 
    };
    
    history.unshift(newItem);
    if (history.length > 5) history.pop(); // Keep only 5 last items to not exceed localStorage limit
    
    try {
        localStorage.setItem("cropHistory", JSON.stringify(history));
        loadHistory(history);
    } catch(e) {
        console.warn("Could not save to localStorage (quota likely exceeded)", e);
        // Clear old ones and try again
        history = [newItem];
        localStorage.setItem("cropHistory", JSON.stringify(history));
        loadHistory(history);
    }
}

function loadHistory(historyData = null) {
    const history = historyData || JSON.parse(localStorage.getItem("cropHistory")) || [];
    historyList.innerHTML = "";
    
    if (history.length === 0) {
        historyList.innerHTML = `<p class="text-gray text-sm center">No recent analyses</p>`;
        return;
    }

    history.forEach(item => {
        const div = document.createElement("div");
        div.className = "history-item";
        div.innerHTML = `
            <img src="${item.image}" class="history-thumb" alt="Crop">
            <div class="history-info">
                <div class="history-disease">${item.disease} <span style="color:var(--text-muted); font-size: 0.8rem;">(${item.confidence}%)</span></div>
                <div class="history-meta">${item.date}</div>
            </div>
        `;
        historyList.appendChild(div);
    });
}

clearHistoryBtn.addEventListener("click", () => {
    if(confirm("Are you sure you want to clear your local history?")) {
        localStorage.removeItem("cropHistory");
        loadHistory([]);
    }
});

// 3D Scroll Animation (Project Theme)
let lastScrollTop = 0;
window.addEventListener("scroll", () => {
    let st = window.pageYOffset || document.documentElement.scrollTop;
    if (st < lastScrollTop) {
        // Scrolling up -> trigger 3D leaves
        create3DLeaf();
    }
    lastScrollTop = st <= 0 ? 0 : st;
}, false);

function create3DLeaf() {
    // Throttle to avoid creating too many DOM elements
    if (document.querySelectorAll('.leaf-3d').length > 12) return;
    if (Math.random() > 0.2) return; // 20% chance to spawn per scroll tick
    
    const leaf = document.createElement("div");
    leaf.className = "leaf-3d";
    
    // Beautiful SVG Leaf Element
    leaf.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="#27ae60" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.2 5.3C21.2 5.3 18.8 2 12 2 5.2 2 2.8 5.3 2.8 5.3c0 0-2.2 4.4.9 12.3C6.3 24.2 12 22 12 22s5.7 2.2 8.3-4.4c3.1-7.9.9-12.3.9-12.3z" opacity="0.8"/>
      <path d="M12 22s-5.7 2.2-8.3-4.4C1 10.9 2.8 5.3 2.8 5.3S5.2 2 12 2v20z" fill="#2ecc71"/>
    </svg>`;
    
    const randomX = Math.random() * window.innerWidth;
    leaf.style.left = randomX + "px";
    leaf.style.bottom = "-20px";
    
    document.body.appendChild(leaf);
    
    setTimeout(() => {
        leaf.remove();
    }, 3000);
}
