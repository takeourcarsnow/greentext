const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Validate environment variables
const requiredEnvVars = ['GEMINI_API_KEY', 'NODE_ENV'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: ${envVar} is missing in environment variables.`);
        process.exit(1);
    }
}

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Configure Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: 'gemini-pro',
    generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 500,
    },
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(morgan('combined'));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/convert', limiter, async (req, res) => {
    try {
        const { text } = req.body;

        // Validate input
        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Input text is required.' });
        }
        if (text.length > 1000) {
            return res.status(400).json({ error: 'Input text is too long (max 1000 characters).' });
        }

        const prompt = `You are a storyteller on 4chan. Convert any input text or story into authentic greentext format following these rules:
1. Each line must start with ">"
2. Use short, concise statements
3. Write in present tense
4. Use crude, informal language
5. Include classic 4chan phrases like "mfw" (my face when), "tfw" (that feel when), "anon", "femanon"
6. Avoid proper grammar and punctuation
7. Use all lowercase except for emphasis
8. Include reactions and emotions in greentext style (e.g., ">be me", ">mfw")
9. End with some kind of reaction or conclusion
10. Keep formatting simple - no fancy formatting or special characters
11. Answer in any language that you are prompted in

Example format:
>be me
>doing something mundane
>suddenly something happens
>mfw unexpected outcome
>tfw specific emotion

Convert this text while maintaining authentic greentext style:
${text}

Remember:
- Keep it concise and focused on the main story
- Don't add unrelated scenarios
- Stay close to the original story
- Add just 1-2 reactions maximum
- Answer in any language that you are prompted in
- Avoid excessive length`;

        const result = await model.generateContent(prompt);
        if (!result || !result.response) {
            throw new Error('No response from AI model.');
        }

        let greentext = result.response.text();
        
        // Clean up the response
        greentext = greentext
            .replace(/&gt;/g, '>')  // Replace HTML entities
            .replace(/^(?!>)/gm, '>') // Ensure each line starts with >
            .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
            .trim();

        // Ensure the response isn't empty
        if (!greentext) {
            throw new Error('Generated text is empty.');
        }

        res.json({ greentext });

    } catch (error) {
        console.error('Error processing request:', error.message);
        res.status(500).json({ 
            error: process.env.NODE_ENV === 'production' 
                ? 'Failed to process the request. Try again later.' 
                : error.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production'
            ? 'Something went wrong!'
            : err.message
    });
});

// Start server
// Add this at the end of the file instead of app.listen
if (process.env.NODE_ENV === 'production') {
    module.exports = app;
} else {
    app.listen(port, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode at http://localhost:${port}`);
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Starting graceful shutdown...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;
