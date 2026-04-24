# AI Crop Disease Detector & Farm Advisor - Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Execution Pipeline](#execution-pipeline)
5. [Feature Breakdown](#feature-breakdown)
6. [Data Flow Diagram](#data-flow-diagram)
7. [Component Details](#component-details)
8. [API Integration](#api-integration)
9. [Local Storage & History](#local-storage--history)
10. [User Interface Components](#user-interface-components)

---

## 🎯 Project Overview

**Project Name:** AI Crop Disease Detector & Farm Advisor  
**Purpose:** An intelligent SaaS web application that uses machine learning to identify crop diseases from photos and provides actionable, farm-friendly prevention and treatment advice.  
**Target Users:** Farmers, agricultural specialists, and crop management professionals  
**Key Value Proposition:** Real-time crop disease identification with AI-powered advisory recommendations

### Core Capabilities:
- 🖼️ Image upload via drag-and-drop or file selection
- 🤖 Machine learning-based disease classification
- 📊 Confidence scoring and disease verification
- 🧠 Dual-mode AI analysis (Cloud + Edge fallback)
- 📈 Visual confidence indicators
- 📜 Analysis history tracking with localStorage
- 🌙 Dark/Light theme toggle
- 💡 Floating tips widget for farming best practices

---

## 🏗️ Architecture

### Application Structure:
```
AI Crop Detector
├── index.html          # Main UI structure
├── script.js           # Application logic & state management
├── style.css           # Styling & theming
└── External Libraries  # TensorFlow.js + Teachable Machine
```

### Architectural Layers:

1. **Presentation Layer** (index.html)
   - Responsive UI components
   - Form elements (drag-drop, file input)
   - Results display sections
   - Knowledge map table
   - History panel

2. **Logic Layer** (script.js)
   - Model initialization & prediction
   - Disease classification logic
   - Diagnostic pipeline execution
   - History management
   - UI state management

3. **Styling Layer** (style.css)
   - Glassmorphism design system
   - Dark/Light theme variables
   - Responsive animations
   - Component styling

---

## 🛠️ Technology Stack

### Frontend Technologies:
- **HTML5** - Semantic markup & structure
- **CSS3** - Glassmorphism UI, animations, theming
- **JavaScript (ES6+)** - Application logic, async/await
- **Font:** Poppins (Google Fonts)

### Machine Learning Tools:
- **TensorFlow.js** v2.0+ - ML framework for browser
- **Teachable Machine (Google)** - Pre-trained image classification model
  - Model URL: `https://teachablemachine.withgoogle.com/models/dH4iCaSNQ/`
  - Classes: Early Blight, Late Blight, Septoria Leaf Spot, Rust, Leaf Mold, Healthy

### External APIs:
- **OpenAI GPT-4o-mini API** (Optional Cloud Verification)
  - Purpose: Verify local predictions with cloud-based pathologist analysis
  - Requires: API key configuration

### Browser APIs:
- **FileReader API** - Image file reading
- **Canvas API** - Image processing for ML prediction
- **localStorage API** - Client-side history persistence
- **Drag & Drop API** - File drag-and-drop functionality

---

## 🔄 Execution Pipeline

### Complete User Journey & Data Flow:

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION STARTUP                      │
├─────────────────────────────────────────────────────────────┤
│ 1. initModel() is called                                    │
│    └─ Loads Teachable Machine model from CDN              │
│    └─ Sets maxPredictions based on model classes          │
│    └─ Logs success/error to console                       │
├─────────────────────────────────────────────────────────────┤
│ 2. loadHistory() retrieves localStorage data               │
│    └─ Populates history UI with previous analyses         │
│    └─ Shows last 5 predictions (if available)            │
└─────────────────────────────────────────────────────────────┘
```

### Image Upload Flow:

```
┌──────────────────────────┐
│  User Action: Upload     │
│  (Drag-Drop OR Browse)   │
└─────────────┬────────────┘
             │
             ▼
┌──────────────────────────┐
│ handleImageUpload()      │
│ - Validate file type    │
│ - Read file as Data URL │
│ - Display preview image │
│ - Show action buttons   │
└─────────────┬────────────┘
             │
             ▼
┌──────────────────────────┐
│ User clicks "Analyze"   │
│ analyzeBtn event fired  │
└─────────────┬────────────┘
             │
             ▼
```

### Analysis & Prediction Flow:

```
┌───────────────────────────────────────────────────────────────┐
│              ANALYSIS PIPELINE EXECUTION                      │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  STEP 1: Pre-Analysis UI Setup                              │
│  ├─ Show loading spinner                                    │
│  ├─ Display results section                                 │
│  └─ Set disease name to "Analyzing crop patterns..."       │
│                                                               │
│  STEP 2: TensorFlow Model Prediction                        │
│  ├─ Load image into Image element                          │
│  ├─ Call model.predict(img)                                │
│  ├─ Get predictions array with probabilities               │
│  ├─ Sort by confidence (highest first)                     │
│  └─ Extract top prediction:                                │
│     ├─ diseaseName = topPrediction.className              │
│     └─ confidence = topPrediction.probability * 100        │
│                                                               │
│  STEP 3: Execute Diagnostic Pipeline                       │
│  └─ Call executeDiagnosticPipeline(diseaseName, conf)     │
│                                                               │
│      ┌─────────────────────────────────────┐              │
│      │  Diagnostic Pipeline (Main Logic)   │              │
│      ├─────────────────────────────────────┤              │
│      │                                     │              │
│      │ ▶ TRY: Cloud AI Verification       │              │
│      │   └─ Call verifyWithOpenAI()       │              │
│      │   └─ Send to OpenAI GPT-4o-mini    │              │
│      │   └─ Receive JSON response:        │              │
│      │       ├─ final_diagnosis           │              │
│      │       ├─ reasoning                  │              │
│      │       ├─ symptoms_found             │              │
│      │       └─ advisory                   │              │
│      │                                     │              │
│      │ ▶ CATCH: Edge AI Fallback          │              │
│      │   (If OpenAI offline/key missing)  │              │
│      │   └─ Call getInternalEnsembleAnalysis() │          │
│      │   └─ Access local knowledge base   │              │
│      │   └─ Return pre-defined disease   │              │
│      │      data (reasoning, advisory)    │              │
│      │   └─ Apply 1.1s delay for realism │              │
│      │                                     │              │
│      └─────────────────────────────────────┘              │
│                                                               │
│  STEP 4: Render Final Result                               │
│  └─ Call renderFinalResult()                               │
│     ├─ Update disease name display                        │
│     ├─ Animate confidence bar fill                        │
│     ├─ Set status badge (Cloud/Edge)                      │
│     ├─ Save to history (localStorage)                     │
│     ├─ Execute logic engine (runLogicEngine)              │
│     └─ Display advisory with reasoning                    │
│                                                               │
│  STEP 5: Logic Engine Processing                          │
│  └─ Call runLogicEngine(diseaseName, symptoms)            │
│     ├─ Extract symptoms from knowledge base               │
│     ├─ Build logic step visualization                     │
│     ├─ Evaluate conditional rules:                        │
│     │  ├─ IF (brown spots + yellowing) → Early Blight    │
│     │  ├─ IF (water-soaked lesions) → Late Blight        │
│     │  ├─ IF (olive mold on underside) → Leaf Mold       │
│     │  ├─ IF (gray circular centers) → Septoria Spot     │
│     │  ├─ IF (orange pustules) → Rust                    │
│     │  └─ IF (no spots + solid green) → Healthy          │
│     ├─ Generate diagnosis state string                    │
│     └─ Display logic steps in UI                          │
│                                                               │
│  STEP 6: History Management                               │
│  └─ Call saveToHistory()                                  │
│     ├─ Create history object:                             │
│     │  ├─ id: timestamp                                   │
│     │  ├─ disease: disease name                           │
│     │  ├─ confidence: prediction score                    │
│     │  ├─ date: current date/time                         │
│     │  └─ image: Base64 data URL                          │
│     ├─ Retrieve existing history from localStorage        │
│     ├─ Prepend new item to array                          │
│     ├─ Keep max 5 items (FIFO)                            │
│     └─ Save to localStorage                               │
│                                                               │
│  STEP 7: UI Cleanup                                        │
│  └─ Hide loading spinner                                  │
│  └─ Enable analyze button                                 │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### History Display & Management Flow:

```
┌────────────────────────────────────┐
│   loadHistory() Function           │
├────────────────────────────────────┤
│ 1. Retrieve from localStorage      │
│ 2. Check if any items exist        │
│ 3. For each history item:          │
│    ├─ Calculate confidence color   │
│    │  ├─ Green (#97C459): >= 90%  │
│    │  ├─ Orange (#EF9F27): 50-90% │
│    │  └─ Red (#E24B4A): < 50%    │
│    ├─ Create DOM element           │
│    ├─ Add thumbnail image          │
│    ├─ Display disease & confidence │
│    └─ Show date/time               │
│ 4. Render in history list          │
└────────────────────────────────────┘
```

---

## 🎨 Feature Breakdown

### 1. **Image Upload System**
- **Drag & Drop Zone:** Full-featured drop area with visual feedback
- **File Input:** Browse button for traditional file selection
- **Supported Formats:** JPG, PNG, WEBP
- **Validation:** MIME type checking for security
- **Preview:** Real-time image display before analysis

### 2. **AI Disease Classification**
- **Model:** Teachable Machine (Google) pre-trained on crop diseases
- **Classes:** 6 disease categories + healthy status
- **Output:** Disease name + confidence probability (0-100%)
- **Processing:** Runs locally in browser (no server needed)

### 3. **Dual-Mode AI Analysis**
- **Cloud Mode (Primary):** 
  - OpenAI GPT-4o-mini with vision capability
  - Cross-verifies local predictions
  - Provides reasoning & confidence

- **Edge Mode (Fallback):**
  - Local knowledge base with 6 disease profiles
  - Instant results (no API calls)
  - Automatically triggers if cloud unavailable
  - Includes 1.1s simulated processing delay

### 4. **Knowledge Map**
- **Structured Database:** 5 disease profiles with:
  - Disease name
  - Key symptoms
  - Primary causes
  - Treatment & prevention recommendations
- **Presentation:** Interactive HTML table with styling

### 5. **Logic Engine**
- **Feature Extraction:** Identifies leaf symptoms
- **Rule Evaluation:** 5+ conditional rules for diagnosis
- **Visual Representation:** Displays rule matching process
- **Diagnosis State:** Final confirmation message

### 6. **History Management**
- **Storage:** Browser localStorage (persistent)
- **Capacity:** Last 5 analyses retained
- **Data Stored:** Disease, confidence, date, image thumbnail
- **Actions:** View history, clear all, automatic cleanup

### 7. **Theming System**
- **Light Theme:** Default (bright, clean aesthetic)
- **Dark Theme:** CSS variable-driven toggle
- **Components:** Checkbox-based pure CSS switch
- **Persistence:** Theme preference can be localStorage-saved

### 8. **Floating Tips Widget**
- **Tips Array:** 4 farm management tips
- **Rotation:** Auto-cycles every 5 seconds
- **Pause on Hover:** Stops animation when hovering
- **Animation:** Fade in/out effect for smooth transitions

### 9. **3D Leaf Animation**
- **Trigger:** Scroll up gestures
- **Visual:** SVG leaf elements with opacity
- **Auto-cleanup:** Removes after 3 seconds
- **Throttling:** Max 12 leaves at a time

### 10. **Responsive Design**
- **Breakpoints:** Mobile, tablet, desktop
- **Glassmorphism:** Modern frosted glass effect
- **Animations:** Slide-up, fade, float effects
- **Dark Mode Support:** Full theme switching

---

## 📊 Data Flow Diagram

```
┌──────────────────────┐
│  User Uploads Image  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────┐
│  handleImageUpload()         │
│  - Validate MIME type        │
│  - FileReader.readAsDataURL()│
│  - Update Preview            │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  analyzeBtn.click Event      │
│  - Check model loaded        │
│  - Validate image exists     │
│  - Show loading UI           │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Create Image Object         │
│  img.crossOrigin = anonymous │
│  img.src = currentImageURL   │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  TensorFlow Model Prediction │
│  const predictions =         │
│  await model.predict(img)    │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Process Prediction Array    │
│  - Sort by probability       │
│  - Extract top result        │
│  - Get className, probability│
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Execute Diagnostic Pipeline         │
│  executeDiagnosticPipeline()         │
└──────────┬──────────────────────────┘
           │
           ├─────────────────┬────────────────────┐
           │                 │                    │
           ▼                 ▼                    ▼
    ┌──────────┐    ┌─────────────┐    ┌──────────────────┐
    │ OpenAI   │    │ Catch Error │    │ localStorage     │
    │ Verify   │    │ (No API key)│    │ saveToHistory()  │
    └────┬─────┘    └─────┬───────┘    └──────────┬───────┘
         │                │                        │
         ▼                ▼                        ▼
    ┌─────────────────────────────────────────────────┐
    │  Edge AI Fallback Analysis                      │
    │  getInternalEnsembleAnalysis(diseaseName)       │
    │  → Returns: reasoning, advisory, symptoms       │
    └────────────────────┬────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────┐
    │  renderFinalResult()                            │
    │  - Update disease name                          │
    │  - Animate confidence bar                       │
    │  - Set status badge                             │
    │  - Display advisory                             │
    └────────┬────────────────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────────────────┐
    │  runLogicEngine(disease, symptoms)              │
    │  - Extract symptoms                             │
    │  - Evaluate conditional rules                   │
    │  - Generate diagnosis state                     │
    │  - Display logic steps                          │
    └────────┬────────────────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────────────────┐
    │  User Views Results                             │
    │  - Disease diagnosis                            │
    │  - Confidence score                             │
    │  - Treatment recommendations                    │
    │  - Logic explanation                            │
    │  - History updated                              │
    └─────────────────────────────────────────────────┘
```

---

## 🧩 Component Details

### Core State Variables:
```javascript
let model;                    // Teachable Machine model instance
let currentImageURL = null;   // Base64 image data URL
let maxPredictions;           // Number of model output classes
```

### Key Functions:

#### **1. initModel()**
```
Purpose: Load TensorFlow & Teachable Machine models
Execution:
  → Fetch model.json with cache buster
  → Load metadata.json
  → Initialize tmImage
  → Set maxPredictions
Returns: void (sets global model)
Error Handling: Console error + user alert
```

#### **2. handleImageUpload(file)**
```
Purpose: Process uploaded image file
Parameters: File object
Execution:
  → Validate file MIME type
  → Create FileReader
  → Convert to Data URL
  → Display preview
  → Show action buttons
  → Hide drop content
Returns: void
Error: Alert if invalid file type
```

#### **3. analyzeBtn.click()**
```
Purpose: Trigger disease analysis
Execution:
  → Validate model loaded
  → Validate image selected
  → Create Image element
  → Wait for image load
  → Call model.predict()
  → Execute diagnostic pipeline
Returns: void
Error Handling: User alerts
```

#### **4. executeDiagnosticPipeline(diseaseName, confidence)**
```
Purpose: Main analysis & result rendering pipeline
Parameters:
  - diseaseName: String (disease class name)
  - confidence: Number (0-100)
Execution:
  → Show "Analyzing..." animation
  → Try OpenAI verification (if API key set)
  → Catch error → Use Edge AI fallback
  → Wait 1.1s for realism
  → Call renderFinalResult()
Returns: Promise (async)
```

#### **5. renderFinalResult(disease, conf, reasoning, advisory, symptoms, mode)**
```
Purpose: Display analysis results
Parameters:
  - disease: String (diagnosis)
  - conf: Number (confidence %)
  - reasoning: String (explanation)
  - advisory: String (recommendations)
  - symptoms: Array (symptom list)
  - mode: String ("Cloud Integrated" or "Edge Optimized")
Execution:
  → Update DOM elements
  → Animate confidence bar
  → Save to history
  → Run logic engine
  → Display advisory text
Returns: void
```

#### **6. getInternalEnsembleAnalysis(disease)**
```
Purpose: Local knowledge base lookup for offline analysis
Parameters: diseaseName (String)
Execution:
  → Query knowledge base object
  → Retrieve disease profile
  → Return: reasoning, advisory, symptoms
Returns: Object with analysis data
Fallback: Generic response if disease not found
```

#### **7. verifyWithOpenAI(diseaseName, imageSrc)**
```
Purpose: Cloud verification with GPT-4o-mini
Parameters:
  - diseaseName: String (local prediction)
  - imageSrc: String (Base64 image URL)
Execution:
  → Build system prompt (expert pathologist)
  → Send image to OpenAI API
  → Parse JSON response
  → Return verified diagnosis
Returns: Promise → Object {final_diagnosis, reasoning, symptoms_found, advisory}
Throws: Error if API unavailable
```

#### **8. runLogicEngine(diseaseName, geminiSymptoms)**
```
Purpose: Display diagnostic rule evaluation
Parameters:
  - diseaseName: String
  - geminiSymptoms: Array (optional)
Execution:
  → Extract symptoms from knowledge base
  → Build logic step HTML
  → Evaluate conditional rules (5+ rules)
  → Determine diagnosis state
  → Display logic visualization
Returns: void
```

#### **9. saveToHistory(disease, confidence, imageSrc)**
```
Purpose: Persist analysis to localStorage
Parameters:
  - disease: String
  - confidence: Number
  - imageSrc: String (Base64)
Execution:
  → Retrieve existing history
  → Create history object with timestamp
  → Prepend to array
  → Keep max 5 items
  → Save to localStorage
  → Call loadHistory() to refresh UI
Returns: void
Error Handling: Gracefully downgrade if quota exceeded
```

#### **10. loadHistory(historyData)**
```
Purpose: Load & render history panel
Parameters: historyData (Array, optional)
Execution:
  → Retrieve from localStorage if not passed
  → Clear history list DOM
  → For each item:
     → Determine confidence color
     → Create history item element
     → Add thumbnail, disease, date
  → Render to historyList
Returns: void
```

---

## 🔌 API Integration

### OpenAI GPT-4o-mini Integration

**Configuration:**
```javascript
const OPENAI_API_KEY = ""; // Set this to enable cloud verification
const API_ENDPOINT = "https://api.openai.com/v1/chat/completions"
```

**Request Structure:**
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert agricultural pathologist. Analyze the provided leaf image..."
    },
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "Diagnose this crop leaf." },
        { "type": "image_url", "image_url": { "url": "<base64-image>" } }
      ]
    }
  ],
  "response_format": { "type": "json_object" }
}
```

**Response Structure:**
```json
{
  "final_diagnosis": "Early Blight",
  "reasoning": "Detection of bullseye patterns...",
  "symptoms_found": ["bullseye-spots", "yellowing"],
  "advisory": "Recommended Actions:\n- Prune affected leaves\n- Apply fungicide..."
}
```

**Failure Handling:**
- If API key empty → Skip cloud verification
- If API offline → Silently fall back to Edge AI
- If quota exceeded → Use local knowledge base
- User experiences no interruption

---

## 💾 Local Storage & History

### localStorage Keys & Structure:

**Key:** `cropHistory`  
**Type:** JSON Array  
**Max Items:** 5 (FIFO - oldest removed)

**Item Structure:**
```javascript
{
  id: 1712000000000,              // Timestamp
  disease: "Early Blight",         // Disease name
  confidence: 94.5,               // Confidence %
  date: "4/13/2026, 2:30:45 PM",  // Formatted date/time
  image: "data:image/png;base64..."  // Base64 image (thumbnail)
}
```

**Operations:**
- **Save:** `localStorage.setItem("cropHistory", JSON.stringify(history))`
- **Load:** `JSON.parse(localStorage.getItem("cropHistory"))`
- **Clear:** `localStorage.removeItem("cropHistory")`

**Quota Management:**
- Max localStorage in most browsers: 5-10MB
- Base64 images cost ~1.3x original size
- Keeps max 5 items to prevent overflow
- Graceful degradation if quota exceeded

---

## 🎨 User Interface Components

### Key UI Elements:

#### **1. Navigation Bar**
- Logo with leaf animation
- Navigation links (Home, Analyze, History)
- Dark/Light theme toggle (CSS checkbox)
- Glassmorphism styling

#### **2. Header Section**
- Hero headline: "Smarter Farming, Powered by AI"
- Subtitle with value proposition
- Animated farmer SVG illustration
- Floating animation effect

#### **3. Upload Section**
- Drag-and-drop zone with visual feedback
- File input (hidden)
- Upload icon (SVG)
- Supported format text
- Browse button

#### **4. Action Buttons**
- "Analyze Crop" (primary gradient button)
- Loading spinner animation
- "Clear Form" (secondary ghost button)
- Visible after image upload

#### **5. Results Section**
- Disease name display
- Confidence bar (animated fill)
- Status badge (Cloud/Edge indicator)
- Color coding (Green/Orange/Red)

#### **6. Advisory Panel**
- AI-generated recommendation text
- Formatted as pre-line (preserves line breaks)
- Reasoning section
- Treatment steps

#### **7. Logic Engine Visualization**
- Step 1: Feature extraction (symptom tags)
- Step 2: Rule evaluation (logic statements)
- Step 3: Diagnosis resolution (final state)
- Syntax highlighting with `<code>` styling

#### **8. Knowledge Map Table**
- 5 disease rows + headers
- Columns: Disease Name, Symptoms, Causes, Treatment
- Responsive table design
- Glassmorphism on table container

#### **9. History Panel**
- List of last 5 analyses
- Thumbnail image for each item
- Disease name + confidence (color-coded)
- Date/time stamp
- Clear history button

#### **10. Floating Tips Widget**
- Circular pill design
- Info icon (SVG)
- Rotating tips with fade animation
- Pause on hover

---

## 📱 Responsive Design Features

- **Mobile First:** Base styles optimized for phones
- **Tablet Adjustments:** Medium breakpoints for 600px+
- **Desktop Layout:** Full-width glassmorphic cards at 1200px+
- **Touch Friendly:** Large buttons, adequate spacing
- **Performance:** Lazy loading, minimal animations on mobile

---

## 🔒 Security Considerations

1. **API Key:** Keep OPENAI_API_KEY empty in production
2. **CORS:** Image loads with `crossOrigin="anonymous"`
3. **File Validation:** MIME type checking before processing
4. **localStorage:** Client-side only, no sensitive data
5. **Base64 Images:** Can reach storage quota - monitor cleanup

---

## 🚀 Deployment Instructions

### Prerequisites:
- Modern web browser with WebGL support
- Internet connection (for CDN libraries)
- Optional: OpenAI API account for cloud verification

### Setup:
1. Clone/download project files
2. Configure API key (if using cloud verification):
   ```javascript
   const OPENAI_API_KEY = "your-api-key-here";
   ```
3. Serve via HTTP server:
   ```bash
   python3 -m http.server 8000
   ```
4. Open `http://localhost:8000` in browser

### External Dependencies:
- TensorFlow.js (CDN)
- Teachable Machine (CDN)
- Google Fonts (Poppins)
- OpenAI API (optional)

---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| Model Load Time | 2-4 seconds |
| Prediction Time | 500-1200ms |
| Cloud AI Response | 2-5 seconds |
| Edge AI Response | 1.1 seconds (with delay) |
| History Render | <100ms |
| Storage Quota | ~5-10MB localStorage |
| Max History Items | 5 |

---

## 🐛 Troubleshooting

### Model Won't Load:
- Check browser console for errors
- Verify CDN URLs are accessible
- Clear browser cache & reload

### Predictions Inaccurate:
- Ensure good lighting in crop photo
- Center leaf in frame
- Use clear, focused images
- Consider retraining Teachable Machine model

### Cloud API Not Working:
- Verify API key is valid
- Check OpenAI account credits
- Monitor API usage quota
- Edge AI will auto-fallback

### History Not Saving:
- Check browser localStorage settings
- Verify quota not exceeded
- Clear cache & retry
- Check browser privacy settings

### Dark Mode Not Working:
- Ensure JavaScript is enabled
- Check CSS variables in style.css
- Verify checkbox ID is "theme-toggle"

---

## 📝 Future Enhancements

1. **Real-time recommendations:** WebSocket for live updates
2. **Multi-language support:** i18n integration
3. **Advanced analytics:** Dashboard for farm metrics
4. **Image gallery:** Album management
5. **Export reports:** PDF generation
6. **Mobile app:** React Native version
7. **Community sharing:** Upload annotations
8. **Offline mode:** Service Worker caching

---

## 📄 License & Credits

**Project:** AI Crop Disease Detector & Farm Advisor  
**Stack:** TensorFlow.js + Teachable Machine + OpenAI GPT-4o-mini  
**Design:** Glassmorphism UI Pattern  
**Hosting:** Static web (no backend required)

---

**Last Updated:** April 13, 2026  
**Version:** 1.0  
**Repository:** https://github.com/avkashs0521/Ai-crop-advisor
