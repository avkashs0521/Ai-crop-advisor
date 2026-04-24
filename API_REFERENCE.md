# AI Crop Detector - API & Feature Reference

## 🔌 Function Reference & API Documentation

---

## 📌 Page Initialization Functions

### `initModel()`
**Purpose:** Load TensorFlow & Teachable Machine models on page load  
**Called:** Automatically when script.js loads  
**Returns:** `void` (sets global `model` variable)

```javascript
async function initModel() {
    const cacheBuster = "?t=" + new Date().getTime();
    const modelURL = MODEL_URL + "model.json" + cacheBuster;
    const metadataURL = MODEL_URL + "metadata.json" + cacheBuster;
    
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    console.log("Model loaded successfully");
}
```

**Dependencies:** TensorFlow.js, Teachable Machine library  
**Error Handling:** Catches errors, logs to console, shows user alert  
**Performance:** 2-4 seconds on first load  

---

### `loadHistory(historyData)`
**Purpose:** Display analysis history from localStorage  
**Parameters:**
- `historyData` (Array, optional): Pre-loaded history array

**Returns:** `void` (updates DOM)

```javascript
function loadHistory(historyData = null) {
    const history = historyData || 
        JSON.parse(localStorage.getItem("cropHistory")) || [];
    historyList.innerHTML = "";
    
    if (history.length === 0) {
        historyList.innerHTML = `<p>No recent analyses</p>`;
        return;
    }
    
    // Render history items...
}
```

**Color Coding:**
- >= 90%: Green (#97C459)
- 50-90%: Orange (#EF9F27)
- < 50%: Red (#E24B4A)

---

## 🖼️ Image Upload Functions

### `handleImageUpload(file)`
**Purpose:** Process uploaded image file  
**Parameters:**
- `file` (File): Image file object from input/drop

**Returns:** `void`

```javascript
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
        resultsSection.classList.add("hidden");
    };
    reader.readAsDataURL(file);
}
```

**Validation:**
- MIME type must be image/*
- Converts to Base64 data URL
- Max file size: Browser dependent (usually 50MB+)

**Events Triggering This:**
- Drop zone: `dropZone.drop`
- File input: `fileInput.change`

---

## 🤖 Analysis & Prediction Functions

### `analyzeBtn.click` Event Handler
**Purpose:** Initiate disease analysis  
**Triggered:** User clicks "Analyze Crop" button

**Flow:**
1. Validate model loaded
2. Validate image selected
3. Create Image element
4. Load image (onload)
5. Call `model.predict(img)`
6. Execute diagnostic pipeline

```javascript
analyzeBtn.addEventListener("click", async () => {
    if (!model) {
        alert("Model is still loading...");
        return;
    }
    
    if (!currentImageURL) {
        alert("Please upload an image first.");
        return;
    }

    setLoadingState(true);
    resultsSection.classList.remove("hidden");
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentImageURL;
    
    img.onload = async () => {
        try {
            const predictions = await model.predict(img);
            predictions.sort((a, b) => b.probability - a.probability);
            
            const topPrediction = predictions[0];
            executeDiagnosticPipeline(
                topPrediction.className,
                (topPrediction.probability * 100).toFixed(1)
            );
        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Error analyzing the image.");
        } finally {
            setLoadingState(false);
        }
    };
});
```

---

### `executeDiagnosticPipeline(diseaseName, confidence)`
**Purpose:** Main diagnostic pipeline with dual-mode AI  
**Parameters:**
- `diseaseName` (String): Disease class name
- `confidence` (String): Confidence percentage "0-100"

**Returns:** `Promise<void>`

**Execution Flow:**
```
1. Show "Analyzing..." animation
2. Attempt Cloud AI (OpenAI)
3. Fallback to Edge AI if fails
4. Render final result
```

```javascript
async function executeDiagnosticPipeline(diseaseName, confidence = "100.0") {
    document.getElementById("disease-name").innerHTML = 
        `<span class="loading-pulse">Analyzing crop patterns...</span>`;
    document.getElementById("advisory-content").innerHTML = 
        `<div class="loading-pulse">Running diagnostic cross-check...</div>`;
    
    try {
        const aiResult = await verifyWithOpenAI(diseaseName, currentImageURL);
        renderFinalResult(
            aiResult.final_diagnosis,
            confidence,
            aiResult.reasoning,
            aiResult.advisory,
            aiResult.symptoms_found,
            "Cloud Integrated"
        );
    } catch(err) {
        const edgeResult = getInternalEnsembleAnalysis(diseaseName);
        
        setTimeout(() => {
            renderFinalResult(
                diseaseName,
                confidence,
                edgeResult.reasoning,
                edgeResult.advisory,
                edgeResult.symptoms,
                "Edge Optimized"
            );
        }, 1100);
    }
}
```

**Modes:**
- **Cloud:** Uses OpenAI GPT-4o-mini for verification
- **Edge:** Uses local knowledge base (fallback)

---

### `verifyWithOpenAI(diseaseName, imageSrc)`
**Purpose:** Cloud-based disease verification  
**Parameters:**
- `diseaseName` (String): Local model prediction
- `imageSrc` (String): Base64 image data URL

**Returns:** `Promise<Object>` - Verification result

```javascript
async function verifyWithOpenAI(diseaseName, imageSrc) {
    const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert agricultural pathologist..."
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Diagnose this crop leaf." },
                            { type: "image_url", image_url: { url: imageSrc } }
                        ]
                    }
                ],
                response_format: { type: "json_object" }
            })
        }
    );
    
    if (!response.ok) throw new Error("OpenAI API Offline");
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}
```

**Required Configuration:**
```javascript
const OPENAI_API_KEY = "sk-..."; // Must be set
```

**Response Format:**
```json
{
  "final_diagnosis": "Early Blight",
  "reasoning": "Detection of bullseye patterns...",
  "symptoms_found": ["bullseye-spots", "yellowing"],
  "advisory": "Remove infected leaves..."
}
```

**Error Handling:**
- Catch thrown if API key empty
- Catch thrown if network error
- Falls back to Edge AI

---

### `getInternalEnsembleAnalysis(disease)`
**Purpose:** Local knowledge base lookup  
**Parameters:**
- `disease` (String): Disease name to look up

**Returns:** `Object` with analysis data

```javascript
function getInternalEnsembleAnalysis(disease) {
    const knowledgeBase = {
        "Septoria Leaf Spot": {
            reasoning: "Cross-verification identifies necrotic lesion clusters...",
            advisory: "Recommended Actions:\n- Avoid overhead watering...",
            symptoms: ["Necrotic lesions", "Chlorotic halos"]
        },
        "Early Blight": {
            reasoning: "Detection of bullseye concentric rings...",
            advisory: "Recommended Actions:\n- Prune bottom leaves...",
            symptoms: ["Target-spots", "Stem cankers"]
        },
        // ... 4 more disease profiles
        "Healthy": {
            reasoning: "Spectral analysis indicates optimal chlorophyll...",
            advisory: "Maintain current irrigation schedule...",
            symptoms: ["Clear epidermis", "Deep turgidity"]
        }
    };

    return knowledgeBase[disease] || {
        reasoning: "Comprehensive pattern-matching...",
        advisory: "Isolate the affected plant...",
        symptoms: ["Tissue decay", "Discoloration"]
    };
}
```

**Knowledge Base Diseases:**
1. Early Blight
2. Late Blight
3. Septoria Leaf Spot
4. Rust
5. Leaf Mold
6. Healthy

---

### `renderFinalResult(disease, conf, reasoning, advisory, symptoms, mode)`
**Purpose:** Display analysis results to user  
**Parameters:**
- `disease` (String): Diagnosed disease name
- `conf` (String): Confidence "0-100"
- `reasoning` (String): Explanation text
- `advisory` (String): Treatment recommendations
- `symptoms` (Array): Detected symptoms
- `mode` (String): "Cloud Integrated" or "Edge Optimized"

**Returns:** `void`

```javascript
function renderFinalResult(disease, conf, reasoning, advisory, 
                          symptoms, mode) {
    document.getElementById("disease-name").textContent = disease;
    document.getElementById("confidence-percentage").textContent = `${conf}%`;
    document.getElementById("status-badge").textContent = 
        `${mode} Verification`;
    
    setTimeout(() => {
        document.getElementById("confidence-fill").style.width = `${conf}%`;
    }, 100);

    const cleanDisease = disease.toLowerCase();
    const badge = document.getElementById("status-badge");
    badge.className = "badge " + 
        (cleanDisease.includes("healthy") ? "success" : "danger");

    if (currentImageURL) saveToHistory(disease, conf, currentImageURL);
    runLogicEngine(disease, symptoms || []);
    
    document.getElementById("advisory-content").innerHTML = 
        `<div style="white-space: pre-line;">
            <i>${reasoning}</i><br><br>${advisory}
        </div>`;
}
```

**Side Effects:**
- Updates confidence bar animation
- Saves to history
- Executes logic engine
- Updates advisory panel

---

### `runLogicEngine(diseaseName, geminiSymptoms)`
**Purpose:** Display diagnostic rule evaluation  
**Parameters:**
- `diseaseName` (String): Disease for lookup
- `geminiSymptoms` (Array, optional): Detected symptoms

**Returns:** `void`

**Logic Rules Evaluated:**
```
1. brown spots + yellowing → Early Blight
2. water-soaked lesions OR white fuzz → Late Blight
3. olive mold OR pale yellow → Leaf Mold
4. gray centers OR dark circular → Septoria Spot
5. orange pustules OR visible spores → Rust
6. no spots + solid green → Healthy
7. else → Uncategorized Pathogen
```

**Output:** HTML visual showing:
1. Feature extraction (symptoms)
2. Logical rule matches
3. Final diagnosis state

---

## 📜 History Management Functions

### `saveToHistory(disease, confidence, imageSrc)`
**Purpose:** Store analysis to localStorage  
**Parameters:**
- `disease` (String): Disease name
- `confidence` (Number or String): Confidence %
- `imageSrc` (String): Base64 image

**Returns:** `void`

```javascript
function saveToHistory(disease, confidence, imageSrc) {
    let history = JSON.parse(
        localStorage.getItem("cropHistory")) || [];
    
    const newItem = {
        id: Date.now(),
        disease,
        confidence,
        date: new Date().toLocaleDateString() + ' ' + 
              new Date().toLocaleTimeString(),
        image: imageSrc
    };
    
    history.unshift(newItem);
    if (history.length > 5) history.pop();
    
    try {
        localStorage.setItem("cropHistory", JSON.stringify(history));
        loadHistory(history);
    } catch(e) {
        console.warn("localStorage quota exceeded");
        history = [newItem];
        localStorage.setItem("cropHistory", JSON.stringify(history));
        loadHistory(history);
    }
}
```

**Storage Limits:**
- Max items: 5 (FIFO)
- Typical quota: 5-10MB
- Exceeding quota: Auto-cleanup oldest

---

### `clearHistoryBtn.click` Event
**Purpose:** Clear all history  
**Triggered:** User clicks "Clear History" button

```javascript
clearHistoryBtn.addEventListener("click", () => {
    if(confirm("Are you sure you want to clear your local history?")) {
        localStorage.removeItem("cropHistory");
        loadHistory([]);
    }
});
```

---

## 🎨 UI Control Functions

### `setLoadingState(isLoading)`
**Purpose:** Toggle loading UI feedback  
**Parameters:**
- `isLoading` (Boolean): true = show spinner, false = hide

**Returns:** `void`

```javascript
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
```

---

### Reset Form Handler
**Purpose:** Clear analysis and return to upload  
**Triggered:** User clicks "Clear Form" button

```javascript
resetBtn.addEventListener("click", () => {
    currentImageURL = null;
    fileInput.value = "";
    imagePreview.classList.add("hidden");
    imagePreview.src = "";
    document.querySelector(".drop-content")
        .classList.remove("hidden");
    actionContainer.classList.add("hidden");
    resultsSection.classList.add("hidden");
    document.getElementById("logic-content").innerHTML = 
        `<div class="loading-pulse">Evaluating rules...</div>`;
    
    document.getElementById("confidence-fill").style.width = `0%`;
});
```

---

## 🌙 Theme Toggle

### Theme Switch Implementation
**Type:** Pure CSS with checkbox

```html
<label class="theme-switch" title="Toggle Theme">
    <input type="checkbox" id="theme-toggle">
    <span class="slider round"></span>
</label>
```

**CSS:**
```css
body:has(#theme-toggle:checked) {
    /* Dark theme variables */
    --bg-page: #0f172a;
    --text-main: #f8fafc;
    /* ... more dark vars ... */
}
```

**No JavaScript Required!** Pure CSS variable switching.

---

## 🎨 Animation Functions

### `create3DLeaf()`
**Purpose:** Generate floating leaf animation on scroll-up  
**Properties:**
- Throttle: Max 12 leaves at once
- Duration: 3 seconds (auto-removes)
- Spawn rate: 20% per scroll tick
- SVG element with opacity animation

```javascript
function create3DLeaf() {
    if (document.querySelectorAll('.leaf-3d').length > 12) return;
    if (Math.random() > 0.2) return;
    
    const leaf = document.createElement("div");
    leaf.className = "leaf-3d";
    leaf.innerHTML = 
        `<svg width="24" height="24" ...><!-- SVG leaf --></svg>`;
    
    const randomX = Math.random() * window.innerWidth;
    leaf.style.left = randomX + "px";
    leaf.style.bottom = "-20px";
    
    document.body.appendChild(leaf);
    
    setTimeout(() => {
        leaf.remove();
    }, 3000);
}
```

---

### `renderTip(index)`
**Purpose:** Display floating farming tips  
**Parameters:**
- `index` (Number): Tip array index

**Returns:** `void`

```javascript
const tipsArray = [
    "Water crops early morning to reduce evaporation",
    "Rotate crops each season to prevent soil depletion",
    "Check leaf undersides for early pest signs",
    "Use neem oil spray as natural pesticide"
];

function renderTip(index) {
    if (!floatingTipsContainer) return;
    const text = tipsArray[index];
    floatingTipsContainer.innerHTML = `
        <div class="tip-pill" style="opacity: 0;">
            <svg><!-- info icon --></svg>
            ${text}
        </div>
    `;
    
    setTimeout(() => {
        const pill = floatingTipsContainer.querySelector('.tip-pill');
        if (pill) pill.style.opacity = "1";
    }, 50);
}
```

**Auto-Rotation:**
```javascript
setInterval(() => {
    currentTipIndex = (currentTipIndex + 1) % tipsArray.length;
    renderTip(currentTipIndex);
}, 5000);
```

---

## 🎯 Event Listeners Summary

| Event | Handler | Action |
|-------|---------|--------|
| `page load` | - | `initModel()`, `loadHistory()` |
| `dropZone.dragover` | - | Add "dragover" class |
| `dropZone.dragleave` | - | Remove "dragover" class |
| `dropZone.drop` | - | `handleImageUpload(files[0])` |
| `fileInput.change` | - | `handleImageUpload(files[0])` |
| `analyzeBtn.click` | - | Analysis pipeline start |
| `resetBtn.click` | - | Clear form & reset |
| `clearHistoryBtn.click` | - | Clear localStorage |
| `window.scroll` | Throttled | `create3DLeaf()` |
| `setInterval (5s)` | - | Rotate tips |
| `theme-toggle.change` | CSS only | Switch dark/light mode |

---

## 📊 Configuration Constants

```javascript
// Model Configuration
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/dH4iCaSNQ/";
const OPENAI_API_KEY = ""; // Set to enable cloud verification

// Cache Buster (prevents stale model)
const cacheBuster = "?t=" + new Date().getTime();

// History Settings
const MAX_HISTORY_ITEMS = 5;
const HISTORY_KEY = "cropHistory";

// Timing
const EDGE_AI_DELAY = 1100; // ms (simulated thinking)
const TIP_ROTATION_INTERVAL = 5000; // ms
const LEAF_LIFETIME = 3000; // ms
const CONFIDENCE_ANIMATION = 100; // ms

// localStorage Handling
const STORAGE_QUOTA_KB = 5000; // Approximate quota
```

---

**Version:** 1.0  
**Last Updated:** April 13, 2026
