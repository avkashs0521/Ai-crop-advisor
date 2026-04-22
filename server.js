const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('./')); // Serve static files from current directory

// Weather API Endpoint
// Uses wttr.in (no API key needed) by default.
// Falls back to OpenWeatherMap if WEATHER_API_KEY is set in .env.
app.get('/api/weather', async (req, res) => {
    try {
        const city = req.query.city;
        if (!city) {
            return res.status(400).json({ error: 'City is required' });
        }

        const apiKey = process.env.WEATHER_API_KEY;

        // --- Primary: OpenWeatherMap (if key is configured) ---
        if (apiKey && apiKey !== 'YOUR_API_KEY' && apiKey !== 'your_openweathermap_api_key_here') {
            const owmRes = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
            );
            if (owmRes.ok) {
                return res.json(await owmRes.json());
            }
            console.warn('OpenWeatherMap failed, falling back to wttr.in');
        }

        // --- Fallback / Default: wttr.in (free, no key required) ---
        const wttrRes = await fetch(
            `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
            { headers: { 'User-Agent': 'ai-crop-advisor/1.0' } }
        );

        if (!wttrRes.ok) {
            throw new Error(`wttr.in error: ${wttrRes.status}`);
        }

        const wttr = await wttrRes.json();
        const cc = wttr.current_condition[0];
        const area = wttr.nearest_area[0];

        // Normalise to the same shape that script.js expects (OpenWeatherMap format)
        const normalised = {
            name: area.areaName[0].value,
            main: {
                temp: parseFloat(cc.temp_C),
                humidity: parseInt(cc.humidity, 10)
            },
            weather: [{ description: cc.weatherDesc[0].value }]
        };

        res.json(normalised);
    } catch (error) {
        console.error('Weather API Error:', error);
        res.status(500).json({ error: 'Unable to fetch weather data. Please try again.' });
    }
});

// Chatbot API Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Valid messages array is required' });
        }

        const hfToken = process.env.HF_TOKEN;
        if (!hfToken || hfToken === 'your_huggingface_token_here') {
            return res.status(500).json({ error: 'Hugging Face token not configured' });
        }

        // Use the free HF Inference API (no provider credits needed)
        const systemMsg = {
            role: "system",
            content: "You are an expert agricultural assistant specializing in crop disease diagnosis, treatment, and farming best practices. Give concise, practical advice. If asked about non-agricultural topics, politely redirect to farming/crop topics."
        };
        const fullMessages = messages[0]?.role === 'system' ? messages : [systemMsg, ...messages];

        const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
            headers: {
                "Authorization": `Bearer ${hfToken}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                model: "meta-llama/Llama-3.2-1B-Instruct",
                messages: fullMessages,
                max_tokens: 512,
                temperature: 0.7
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Hugging Face Error Body:`, errorBody);
            throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: 'Unable to fetch AI response' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
