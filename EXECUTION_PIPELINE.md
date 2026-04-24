# AI Crop Detector - Execution Pipeline Visual Guide

## 🎬 Complete Execution Flow Diagram

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         APPLICATION LIFECYCLE                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: PAGE LOAD & INITIALIZATION                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  index.html loaded
│      ↓
│  Link external libraries (CDN):
│      ├─ TensorFlow.js
│      ├─ Teachable Machine
│      └─ Google Fonts (Poppins)
│      ↓
│  Load style.css
│  Load script.js
│      ↓
│  JavaScript Execution Starts
│      ├─ Define global state variables
│      ├─ Cache DOM elements
│      ├─ Register event listeners
│      ↓
│  Call initModel()
│      ├─ Generate cache-buster timestamp
│      ├─ Fetch model.json from Teachable Machine CDN
│      ├─ Fetch metadata.json
│      ├─ Initialize tmImage with model
│      ├─ Set maxPredictions
│      ├─ Log success (or show error)
│      └─ Model ready for predictions
│      ↓
│  Call loadHistory()
│      ├─ Retrieve from localStorage
│      ├─ Parse JSON history array
│      ├─ Render history UI elements
│      └─ Display last 5 analyses
│      ↓
│  Call renderTip(0)
│      └─ Display first farming tip
│      ↓
│  Application Ready ✓
│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: USER UPLOADS IMAGE (Drag-Drop OR File Browse)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  USER ACTION: Drag image over drop zone
│      ↓
│  Trigger dropZone.dragover event
│      ├─ Prevent default
│      ├─ Add "dragover" CSS class (visual feedback)
│      └─ Stop
│      ↓
│  USER ACTION: Drag leaves drop zone
│      ↓
│  Trigger dropZone.dragleave event
│      ├─ Remove "dragover" CSS class
│      └─ Stop
│      ↓
│  USER ACTION: Drop file on zone OR Use file browser
│      ↓
│  Trigger dropZone.drop OR fileInput.change event
│      ↓
│  Call handleImageUpload(file)
│      ├─ Validate: file.type matches "image.*"?
│      │  ├─ YES → Continue
│      │  └─ NO → Alert("Please upload an image") → Return
│      ├─ Create FileReader instance
│      ├─ reader.onload callback:
│      │  ├─ currentImageURL = e.target.result (Base64)
│      │  ├─ imagePreview.src = currentImageURL
│      │  ├─ Show image preview (remove "hidden" class)
│      │  ├─ Hide drop content
│      │  ├─ Show action buttons (Analyze & Clear)
│      │  └─ Hide results section
│      ├─ reader.readAsDataURL(file)
│      │  └─ Converts image to data:image/png;base64,... format
│      └─ Done - Awaiting user analysis click
│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: USER CLICKS "ANALYZE CROP" BUTTON                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Trigger analyzeBtn.click event
│      ↓
│  Validate pre-requisites:
│      ├─ model loaded?          → No: Alert & return
│      ├─ currentImageURL exists? → No: Alert & return
│      └─ Both OK → Continue
│      ↓
│  Call setLoadingState(true)
│      ├─ Disable analyze button (disabled = true)
│      ├─ Change button text to "Analyzing..."
│      ├─ Show loading spinner animation
│      └─ Visual feedback to user
│      ↓
│  Show results section (remove "hidden" class)
│  Set advisory content: "Generating advice from AI..."
│      ↓
│  Create Image element programmatically
│      ├─ img.crossOrigin = "anonymous" (CORS)
│      ├─ img.src = currentImageURL
│      └─ Wait for onload callback
│      ↓
│  img.onload fires
│      ↓
│  TensorFlow Model Prediction
│      ├─ Call: const predictions = await model.predict(img)
│      ├─ Returns: Array of {className, probability} objects
│      │           Example:
│      │           [
│      │             {className: "Early Blight", probability: 0.92},
│      │             {className: "Late Blight", probability: 0.05},
│      │             {className: "Healthy", probability: 0.03}
│      │           ]
│      ├─ Sort by probability (descending)
│      ├─ Extract top prediction:
│      │  ├─ topPrediction = predictions[0]
│      │  ├─ diseaseName = "Early Blight"
│      │  └─ confidence = 92.0 (percentage)
│      └─ Continue to diagnostic pipeline
│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: EXECUTE DIAGNOSTIC PIPELINE (Main Logic)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Call: executeDiagnosticPipeline(diseaseName, confidence)
│      ↓
│  IMMEDIATE UI UPDATES:
│      ├─ Set disease-name: <span class="loading-pulse">Analyzing crop patterns...</span>
│      ├─ Set advisory-content: <div class="loading-pulse">Running advanced diagnostic cross-check...</div>
│      ├─ Reset confidence-percentage: "0%"
│      └─ Reset confidence-fill.width: "0%"
│      ↓
│  BRANCHING LOGIC:
│      │
│      ├─► TRY BLOCK: Cloud AI Verification
│      │   │
│      │   └─ Call: const aiResult = await verifyWithOpenAI(diseaseName, currentImageURL)
│      │       │
│      │       ├─ Check: OPENAI_API_KEY is not empty?
│      │       │  ├─ YES → Make API call
│      │       │  │   │
│      │       │  │   ├─ Fetch to: https://api.openai.com/v1/chat/completions
│      │       │  │   ├─ Send image as base64
│      │       │  │   ├─ Ask: "Is this disease actually {{diseaseName}}?"
│      │       │  │   ├─ Receive JSON response:
│      │       │  │   │   {
│      │       │  │   │     "final_diagnosis": "Early Blight",
│      │       │  │   │     "reasoning": "Detection of bullseye patterns...",
│      │       │  │   │     "symptoms_found": [...],
│      │       │  │   │     "advisory": "Remove infected leaves..."
│      │       │  │   │   }
│      │       │  │   └─ Return parsed JSON
│      │       │  │
│      │       │  └─ NO → Throw error (no API key)
│      │       │
│      │       └─ Call renderFinalResult() with cloud results
│      │           └─ Mode: "Cloud Integrated"
│      │
│      │
│      ├─► CATCH BLOCK: fallback to Edge AI
│      │   │
│      │   └─ If OpenAI fails (offline, invalid key, error):
│      │       │
│      │       ├─ Call: const edgeResult = getInternalEnsembleAnalysis(diseaseName)
│      │       │   │
│      │       │   ├─ Query local knowledge base:
│      │       │   │
│      │       │   │   KNOWLEDGE BASE = {
│      │       │   │     "Early Blight": {
│      │       │   │       reasoning: "Detection of bullseye concentric rings...",
│      │       │   │       advisory: "Prune lower leaves, apply fungicide...",
│      │       │   │       symptoms: ["Target-spots", "Stem cankers", "Defoliation"]
│      │       │   │     },
│      │       │   │     "Late Blight": { ... },
│      │       │   │     "Septoria Leaf Spot": { ... },
│      │       │   │     "Rust": { ... },
│      │       │   │     "Leaf Mold": { ... },
│      │       │   │     "Healthy": { ... }
│      │       │   │   }
│      │       │   │
│      │       │   ├─ Look up: diseaseName in knowledge base
│      │       │   ├─ Return: {reasoning, advisory, symptoms}
│      │       │   └─ If not found: Return generic response
│      │       │
│      │       ├─ Wait 1,100ms (setTimeout)
│      │       │   (Simulates thinking time for realism)
│      │       │
│      │       └─ Call renderFinalResult() with edge results
│      │           └─ Mode: "Edge Optimized"
│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: RENDER FINAL RESULT                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Call: renderFinalResult(disease, conf, reasoning, advisory, symptoms, mode)
│      ↓
│  Update DOM Elements:
│      ├─ disease-name.textContent = "Early Blight"
│      ├─ confidence-percentage.textContent = "92%"
│      ├─ status-badge.textContent = "Cloud Integrated Verification"
│      │   (or "Edge Optimized Verification")
│      └─ status-badge.className = "badge success/danger"
│      ↓
│  Animate Confidence Bar (setTimeout):
│      └─ confidence-fill.style.width = "92%"
│          (Gradual fill animation via CSS transition)
│      ↓
│  Determine Badge Color:
│      ├─ If disease includes "healthy": badge color = green (#success)
│      └─ Else: badge color = red (#danger)
│      ↓
│  Save to History:
│      ├─ Call: saveToHistory(disease, conf, currentImageURL)
│      │   │
│      │   ├─ Create history object:
│      │   │   {
│      │   │     id: Date.now(),
│      │   │     disease: "Early Blight",
│      │   │     confidence: 92,
│      │   │     date: "4/13/2026, 2:30:45 PM",
│      │   │     image: "data:image/png;base64,..."
│      │   │   }
│      │   │
│      │   ├─ Retrieve existing history from localStorage
│      │   ├─ Unshift new item to front of array
│      │   ├─ Keep max 5 items (remove oldest if > 5)
│      │   │
│      │   └─ localStorage.setItem("cropHistory", JSON.stringify(history))
│      │       └─ Call loadHistory() to refresh UI
│      ↓
│  Execute Logic Engine:
│      ├─ Call: runLogicEngine(disease, symptoms)
│      │   (See next phase)
│      └─ Display rule evaluation
│      ↓
│  Populate Advisory Panel:
│      ├─ Build HTML template
│      ├─ Include:
│      │  ├─ API verification badge
│      │  ├─ Reasoning explanation (italicized)
│      │  ├─ Advisory recommendations (formatted)
│      │  └─ Treatment steps
│      ├─ advisory-content.innerHTML = htmlTemplate
│      └─ Display to user
│      ↓
│  Finally block - Cleanup:
│      ├─ Call: setLoadingState(false)
│      │   ├─ Enable analyze button
│      │   ├─ Restore button text: "Analyze Crop"
│      │   └─ Hide loading spinner
│      └─ Ready for next analysis
│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 6: LOGIC ENGINE PROCESSING                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Call: runLogicEngine(diseaseName, geminiSymptoms)
│      ↓
│  STEP 1: Feature Extraction
│      │
│      └─ Determine symptoms array based on disease:
│          │
│          ├─ IF disease includes "early blight":
│          │  └─ symptoms = ["spots=brown", "pattern=concentric_rings", "leaf=yellowing"]
│          │
│          ├─ ELSE IF disease includes "late blight":
│          │  └─ symptoms = ["lesions=water_soaked", "growth=white_fuzz", "weather=wet"]
│          │
│          ├─ ELSE IF disease includes "leaf mold":
│          │  └─ symptoms = ["spots=pale_green_to_yellow", "underside=olive_green_mold", "leaf=curling"]
│          │
│          ├─ ELSE IF disease includes "leaf spot":
│          │  └─ symptoms = ["spots=small_dark_circular", "centers=gray_or_white", "margin=reddish"]
│          │
│          ├─ ELSE IF disease includes "healthy":
│          │  └─ symptoms = ["leaf=solid_green", "spots=none", "wilting=false"]
│          │
│          └─ ELSE:
│             └─ symptoms = ["spots=unidentified", "texture=abnormal"]
│      ↓
│  Build Logic Visualization HTML:
│      │
│      ├─ Part 1: Feature Extraction
│      │  └─ Display: "1. AI Feature Extraction Mapping: [brown_spot], [concentric_ring], ..."
│      │
│      ├─ Part 2: Rule Evaluation
│      │  │
│      │  └─ Evaluate Conditional Rules:
│      │     │
│      │     ├─ IF (spots=brown AND leaf=yellowing)
│      │     │  └─ Display: "Rule match: Early Blight Confirmed"
│      │     │     Set diagnosisState = "Early Blight Confirmed"
│      │     │
│      │     ├─ ELSE IF (water_soaked OR white_fuzz)
│      │     │  └─ Display: "Rule match: Late Blight Confirmed"
│      │     │     Set diagnosisState = "Late Blight Confirmed"
│      │     │
│      │     ├─ ELSE IF (olive_mold OR pale_yellow)
│      │     │  └─ Display: "Rule match: Leaf Mold Confirmed"
│      │     │     Set diagnosisState = "Leaf Mold Confirmed"
│      │     │
│      │     ├─ ELSE IF (gray_centers OR dark_circular)
│      │     │  └─ Display: "Rule match: Septoria Spot Confirmed"
│      │     │     Set diagnosisState = "Septoria Spot Confirmed"
│      │     │
│      │     ├─ ELSE IF (orange_pustules)
│      │     │  └─ Display: "Rule match: Rust Confirmed"
│      │     │     Set diagnosisState = "Rust Disease Confirmed"
│      │     │
│      │     ├─ ELSE IF (no_spots AND solid_green)
│      │     │  └─ Display: "Rule match: Plant Healthy Confirmed"
│      │     │     Set diagnosisState = "Plant Healthy Confirmed"
│      │     │
│      │     └─ ELSE
│      │        └─ Display: "Generic pathogen rules..."
│      │           Set diagnosisState = "Uncategorized Pathogen Confirmed"
│      │
│      └─ Part 3: Diagnosis Resolution
│         └─ Display: "Final State: {{diagnosisState}}"
│             (e.g., "Final State: Early Blight Confirmed")
│      ↓
│  Render to DOM:
│      └─ logic-content.innerHTML = builtHTML
│          └─ Display logic visualization to user
│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 7: HISTORY MANAGEMENT                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Call: loadHistory(historyData)
│      ↓
│  Retrieve Data:
│      └─ IF historyData provided:
│         └─ Use it
│         ELSE:
│         └─ Retrieve from localStorage: JSON.parse(localStorage.getItem("cropHistory"))
│      ↓
│  Clear existing UI:
│      └─ historyList.innerHTML = ""
│      ↓
│  Render Items:
│      │
│      ├─ IF history is empty:
│      │  └─ Display: "No recent analyses"
│      │
│      └─ FOR EACH history item:
│         │
│         ├─ Determine confidence color:
│         │  ├─ IF confidence >= 90%: color = green (#97C459)
│         │  ├─ ELSE IF confidence >= 50%: color = orange (#EF9F27)
│         │  └─ ELSE: color = red (#E24B4A)
│         │
│         ├─ Create history-item DOM element:
│         │  ├─ Add thumbnail image (history.image)
│         │  ├─ Add disease name
│         │  ├─ Add confidence% with color
│         │  └─ Add formatted date/time
│         │
│         └─ Append to historyList
│
│  Clear History Action:
│      └─ clearHistoryBtn.click:
│         ├─ Show confirm dialog: "Clear local history?"
│         ├─ IF confirmed:
│         │  ├─ localStorage.removeItem("cropHistory")
│         │  └─ loadHistory([])
│         └─ History panel cleared
│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 8: RESET / CLEAR FORM                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User clicks "Clear Form" button
│      ↓
│  Reset State:
│      ├─ currentImageURL = null
│      ├─ fileInput.value = ""
│      └─ Clear image preview
│      ↓
│  Reset UI:
│      ├─ Hide image preview
│      ├─ Show drop-content
│      ├─ Hide action buttons
│      ├─ Hide results section
│      ├─ Reset logic-content: "Evaluating rules..."
│      └─ Reset confidence bar to 0%
│      ↓
│  Ready for new upload
│
└─────────────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════════════════╗
║                    ASYNC/AWAIT EXECUTION TIMELINE                             ║
╚═══════════════════════════════════════════════════════════════════════════════╝

TIME    EVENT                               STATUS
────    ─────────────────────────────────    ──────────────────
0ms     User clicks "Analyze"              [SYNC] Button handler starts
        initiateAnalysis()                 [SYNC] Validation checks
        Create Image element               [SYNC] DOM ready

50ms    ├─ Image begins loading            [ASYNC] Waiting for onload
        └─ Show loading spinner            [SYNC] UI feedback

200ms   Image fully loaded                 [ASYNC] onload fires
        executeModelPrediction()           [ASYNC] TensorFlow processes

800ms   ├─ Model inference complete       [ASYNC] predictions array ready
        ├─ Top prediction selected         [SYNC] Extract diseaseName, conf
        └─ executeDiagnostic()starts       [ASYNC] Branch logic

850ms   ├─ TRY: Call OpenAI API            [ASYNC] Network request
        │  (if OPENAI_API_KEY exists)
        ├─ Waiting for response...         [ASYNC] Pending
        │
        └─ CATCH: Use Edge AI              [SYNC] Local lookup
           getInternalAnalysis()           [SYNC] Knowledge base query
           setTimeout(1100ms)              [ASYNC] Simulated delay

1950ms  renderFinalResult()                [SYNC] Update DOM
        ├─ Update disease name             [SYNC]
        ├─ Animate confidence bar          [ASYNC] CSS transition
        ├─ Save to history                 [SYNC] localStorage
        ├─ runLogicEngine()                [SYNC] Build logic HTML
        └─ Display advisory                [SYNC] innerHTML update

2100ms  setLoadingState(false)             [SYNC] Re-enable button
        ✓ Analysis Complete                Ready for next upload

```

---

## 🎯 Key Branches & Conditional Logic

### Disease Classification Logic:

```
PREDICTION OUTPUT (from TensorFlow model)
    ↓
predictions[0] = {
  className: String,        // "Early Blight", "Healthy", etc.
  probability: Float        // 0.0 to 1.0
}
    ↓
diseaseName = className
confidence = probability * 100
    ↓
executeDiagnosticPipeline(diseaseName, confidence)
    ├─ IF (OPENAI_API_KEY not empty):
    │  ├─ Call verifyWithOpenAI()
    │  ├─ Await response
    │  └─ Final result = Cloud AI response
    │
    └─ ELSE (API key missing OR OpenAI error):
       ├─ Catch → Use Edge AI
       ├─ Call getInternalEnsembleAnalysis()
       ├─ Get local knowledge base data
       ├─ Simulate delay (1.1s)
       └─ Final result = Edge AI response
        ↓
renderFinalResult()
    └─ Display unified result anyway
```

### Symptom-Based Rule Evaluation:

```
symptoms = [extracted from disease profile]
    ↓
IF (spots=brown AND leaf=yellowing)
    → diagnosisState = "Early Blight Confirmed"
    
ELSE IF (lesions=water_soaked OR growth=white_fuzz)
    → diagnosisState = "Late Blight Confirmed"
    
ELSE IF (underside=olive_green_mold OR spots=pale_yellow)
    → diagnosisState = "Leaf Mold Confirmed"
    
ELSE IF (spots=small_dark_circular OR centers=gray)
    → diagnosisState = "Septoria Spot Confirmed"
    
ELSE IF (orange_pustules OR spores=visible)
    → diagnosisState = "Rust Disease Confirmed"
    
ELSE IF (spots=none AND leaf=solid_green)
    → diagnosisState = "Plant Healthy Confirmed"
    
ELSE
    → diagnosisState = "Uncategorized Pathogen Confirmed"
```

---

## 📊 Data Structure Reference

### History Object (stored in localStorage):
```javascript
{
  id: 1712000000000,                    // Time-based unique ID
  disease: "Early Blight",              // Diagnosis
  confidence: 92.0,                     // Percentage (0-100)
  date: "4/13/2026, 2:30:45 PM",      // Formatted local time
  image: "data:image/png;base64,..."   // Full size image
}
```

### Prediction Object (from TensorFlow model):
```javascript
{
  className: "Early Blight",
  probability: 0.9234
}
```

### OpenAI Response Object:
```javascript
{
  final_diagnosis: "Early Blight",
  reasoning: "Bullseye pattern indicates Early Blight...",
  symptoms_found: ["bullseye-spots", "yellowing", "stem-cankers"],
  advisory: "Recommendations:\n- Prune lower leaves\n- Apply fungicide"
}
```

### Knowledge Base Entry:
```javascript
{
  "Early Blight": {
    reasoning: "Cross-verification identifies necrotic lesion clusters...",
    advisory: "Recommended Actions:\n- Avoid overhead watering\n- Apply copper fungicide",
    symptoms: ["Necrotic lesions", "Chlorotic halos", "Pycnidia density"]
  }
}
```

---

##  Error Handling Flow

```
┌─ Error Point
├─ Detection
├─ Handling
└─ Recovery

1. MODEL LOAD ERROR
   └─ console.error() logged
   └─ User alert shown
   └─ Application continues (model = null)

2. IMAGE UPLOAD ERROR
   └─ IF file not image: Alert user
   └─ IF FileReader fails: Silent fail
   └─ Retry available

3. PREDICTION ERROR
   └─ Alert: "Error analyzing the image"
   └─ Show console error
   └─ Allow re-upload

4. OPENAI API ERROR
   └─ Catch silently triggered
   └─ Fallback to Edge AI
   └─ User unaware of error
   └─ Result still delivered

5. LOCALSTORAGE QUOTA ERROR
   └─ Catch quota exceeded
   └─ Clear old items
   └─ Retry save
   └─ Warn in console

```

---

**Version:** 1.0  
**Last Updated:** April 13, 2026
