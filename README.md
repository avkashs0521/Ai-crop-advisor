# 🌾 AI Crop Detector & Farm Advisor

An intelligent web application that uses machine learning to identify crop diseases from photos and provides actionable, farm-friendly prevention and treatment advice.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-ISC-blue)
![Node Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)

---

## ✨ Features

- 🖼️ **Image Upload** - Drag-and-drop or file selection for crop photos
- 🤖 **ML-Powered Disease Detection** - Real-time disease classification using TensorFlow.js
- 📊 **Confidence Scoring** - Visual indicators showing prediction confidence
- 🔄 **Dual-Mode Analysis** - Local ML predictions with cloud verification option
- 📜 **Analysis History** - Track all previous analyses with localStorage persistence
- 🌙 **Dark/Light Theme** - Toggle between themes for comfortable viewing
- 💡 **Farming Tips** - Rotating widget with farming best practices
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14.0.0 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/avkashs0521/Ai-crop-advisor.git
   cd "Al crop detector"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to add your OpenAI API key (for cloud verification):
   ```
   WEATHER_API_KEY=your_openweathermap_api_key_here
   PORT=3000
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000` in your web browser

---

## 📖 Usage Guide

### Basic Workflow

1. **Upload a Crop Image**
   - Drag and drop an image onto the upload zone, or
   - Click "Browse Files" to select an image from your computer
   - Supported formats: JPG, PNG, GIF, WebP

2. **Analyze the Crop**
   - Click the "Analyze Crop" button
   - Wait for the ML model to process the image
   - View the results including:
     - Disease classification
     - Confidence percentage
     - Prevention recommendations
     - Treatment advice

3. **View History**
   - Click the "History" tab in the results
   - All previous analyses are stored locally
   - Color-coded by confidence:
     - 🟢 Green (≥90%): High confidence
     - 🟠 Orange (50-90%): Medium confidence
     - 🔴 Red (<50%): Low confidence

4. **Customize Appearance**
   - Toggle between dark and light themes using the theme button
   - Get daily farming tips from the tip widget

---

## 🏗️ Architecture

### Project Structure
```
AI Crop Detector/
├── index.html              # Main HTML structure
├── script.js               # Application logic & ML integration
├── style.css               # Styling with glassmorphism design
├── server.js               # Express.js backend server
├── package.json            # Project dependencies
├── .env                    # Environment variables
├── PROJECT_DOCUMENTATION.md # Detailed project documentation
├── API_REFERENCE.md        # Function and API documentation
└── EXECUTION_PIPELINE.md   # Complete execution flow diagram
```

### Technology Stack

**Frontend:**
- HTML5 - Semantic structure
- CSS3 - Glassmorphism UI & animations
- JavaScript (ES6+) - Core application logic
- Font: Poppins (Google Fonts)

**Machine Learning:**
- **TensorFlow.js** - Browser-based ML framework
- **Google Teachable Machine** - Pre-trained image classification model
  - Classes: Early Blight, Late Blight, Septoria Leaf Spot, Rust, Leaf Mold, Healthy
  - Model: https://teachablemachine.withgoogle.com/models/dH4iCaSNQ/

**Backend:**
- **Express.js** - Node.js web framework
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management

**External APIs:**
- OpenWeatherMap API (optional) - For weather-based recommendations
- OpenAI GPT-4o-mini (optional) - For cloud verification of predictions

---

## 🔌 API Endpoints

### Weather Endpoint
```
GET /api/weather?city=CityName
```
Returns weather data for the specified city, which can be used for disease risk assessment.

---

## 🧠 How the ML Model Works

1. **Image Upload** → Converted to Base64 format
2. **Model Inference** → TensorFlow.js processes image through CNN
3. **Classification** → Returns 6 disease predictions with confidence scores
4. **Prediction** → Displays highest confidence result
5. **History Storage** → Saves results to browser localStorage
6. **Optional Verification** → Can verify with cloud GPT-4o-mini analysis

---

## 📚 Documentation

For more detailed information, see:
- [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) - Complete project overview and architecture
- [API_REFERENCE.md](API_REFERENCE.md) - Detailed function and API documentation
- [EXECUTION_PIPELINE.md](EXECUTION_PIPELINE.md) - Complete execution flow and data flow diagrams

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Server configuration
PORT=3000

# Weather API (optional)
WEATHER_API_KEY=your_openweathermap_api_key_here

# OpenAI API (optional, for cloud verification)
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 🌐 Supported Crop Diseases

The model is trained to detect the following crop diseases:

1. **Early Blight** - Fungal disease affecting potato and tomato plants
2. **Late Blight** - Serious fungal disease causing crop failure
3. **Septoria Leaf Spot** - Fungal leaf disease
4. **Rust** - Fungal disease with reddish-brown pustules
5. **Leaf Mold** - Fungal infection of leaf undersides
6. **Healthy** - No disease detected

---

## 🎨 Theming

The application supports both light and dark themes with modern glassmorphism design:

- **Dark Theme** - Eye-friendly dark backgrounds with light text
- **Light Theme** - Clean light backgrounds with dark text
- Toggle theme using the theme button in the header

---

## 💾 Data Storage

- **Analysis History** - Stored in browser localStorage
- **Theme Preference** - Persisted across sessions
- **No Server Storage** - All data remains on user's device for privacy

---

## 📱 Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🔐 Privacy & Security

- No personal data is collected
- Images are processed locally in your browser
- Optional cloud API calls respect your privacy settings
- All data stored locally in browser storage

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

## 📄 License

This project is licensed under the ISC License - see the [package.json](package.json) file for details.

---

## 🐛 Troubleshooting

### Model Won't Load
- Check browser console for errors
- Ensure internet connection is stable
- Try clearing browser cache
- Verify Teachable Machine model URL is accessible

### Images Not Uploading
- Check file format (must be image/*)
- Verify file size isn't too large
- Try a different browser
- Check browser permissions for file access

### Slow Performance
- Close other browser tabs
- Check internet speed for API calls
- Verify GPU acceleration is enabled
- Try a modern browser version

---

## 📞 Support

For issues, questions, or feature requests, please visit the [GitHub repository](https://github.com/avkashs0521/Ai-crop-advisor/issues).

---

## 🙏 Acknowledgments

- TensorFlow.js team for the ML framework
- Google Teachable Machine for the pre-trained models
- OpenWeatherMap for weather data
- OpenAI for GPT-4o-mini API

---

**Happy crop monitoring! 🌱**
