# Are You Human?

Think you're human? Think again. **Are You Human?** is a deliberately frustrating, frontend-only CAPTCHA experience. Complete the challenge, submit your answer, and see whether the system believes you.

> This is a playful demo, not a real security or CAPTCHA service. Verification is designed to fail.

## Features

- Interactive CAPTCHA-style challenges with randomized modes
- Animated verification and scanning states
- Retry flow that presents another challenge mode
- Optional ambient audio
- Responsive interface built with React and CSS

## Tech Stack

- JavaScript
- React
- Vite
- CSS
- Tailwind CSS via the browser CDN

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) and npm

### Installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/ItokianaRAKT/ARE-YOU-HUMAN.git
cd ARE-YOU-HUMAN
npm install
```

### Run Locally

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```text
.
├── public/             # Static assets
├── src/
│   ├── captcha/        # CAPTCHA widget and challenge modes
│   ├── challenges/     # Challenge registry
│   ├── components/     # Shared interface components
│   ├── lib/            # Supporting utilities
│   ├── styles/         # Challenge styles
│   ├── App.jsx         # Main application
│   └── main.jsx        # Application entry point
├── index.html
├── package.json
└── vite.config.js
```

## Disclaimer

This project is an entertainment-focused frontend demo. It does not provide real human verification, protect services from bots, or send verification data to a backend.
