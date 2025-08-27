# Greentext Generator

A web application that converts your stories into authentic 4chan-style greentext using Google Gemini AI.

## Features
- **Greentext Conversion:** Instantly convert any story or text into 4chan-style greentext.
- **Modern UI:** Responsive, dark/light theme, and mobile-friendly.
- **History:** Save and revisit your previous greentexts locally.
- **Copy & Share:** One-click copy and social sharing.
- **Rate Limiting & Security:** Secure backend with rate limiting, helmet, CORS, and input validation.

## Demo
![Screenshot](public/images/android-chrome-512x512.png)

## Getting Started

### Prerequisites
- Node.js v16+
- npm v8+
- Google Gemini API key (set as `GEMINI_API_KEY` in a `.env` file)

### Installation
```bash
npm install
```

### Running Locally
```bash
# Development
npm run dev

# Production
NODE_ENV=production npm start
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables
Create a `.env` file in the root directory:
```
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
```

## Deployment
This app is ready for Vercel or any Node.js hosting. See `vercel.json` for configuration.

## Scripts
- `npm start` – Start server
- `npm run dev` – Start with nodemon
- `npm run lint` – Lint code
- `npm test` – Run tests
- `npm run build` – Build assets

## Tech Stack
- **Backend:** Node.js, Express, Google Gemini AI
- **Frontend:** EJS, Vanilla JS, CSS
- **Security:** Helmet, CORS, express-rate-limit

## License
MIT

## Contributing
Pull requests welcome! For major changes, open an issue first.

## Author
[Your Name](mailto:your.email@example.com)

## Links
- [GitHub Issues](https://github.com/yourusername/greentext-generator/issues)
- [Homepage](https://github.com/yourusername/greentext-generator#readme)
