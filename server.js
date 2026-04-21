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
app.get('/api/weather', async (req, res) => {
    try {
        const city = req.query.city;
        if (!city) {
            return res.status(400).json({ error: 'City is required' });
        }

        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey || apiKey === 'YOUR_API_KEY') {
            return res.status(500).json({ error: 'Weather API key not configured' });
        }

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`OpenWeatherMap Error Body:`, errorBody);
            throw new Error(`City not found or API error: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Weather API Error:', error);
        res.status(500).json({ error: 'Unable to fetch weather data' });
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
        if (!hfToken || hfToken === 'your_token_here') {
            return res.status(500).json({ error: 'Hugging Face token not configured' });
        }

        const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
            headers: {
                "Authorization": `Bearer ${hfToken}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                model: "meta-llama/Llama-3.2-1B-Instruct:novita",
                messages: messages
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
