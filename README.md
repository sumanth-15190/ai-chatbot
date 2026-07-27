# NexusAI Chatbot

A full-stack, AI-powered conversational application featuring a React frontend, an Express proxy server, and a FastAPI/LangGraph backend that uses OpenRouter for its LLM capabilities.

## Architecture Overview

The project is structured into three main components:

1. **`AI PROJECT/` (Python Backend)**
   - Powered by **FastAPI** and **LangGraph**.
   - Integrates with **OpenRouter** to use advanced LLMs (like `gemini-2.5-flash`).
   - Handles the AI conversation flow, memory, and any custom tool-calling behaviors.
   
2. **`chatbot_backend/` (Express Proxy)**
   - Built with **Node.js** and **Express**.
   - Acts as a proxy bridging the frontend to the Python AI service.
   - Routes API requests (e.g., `/api/chat`) to the appropriate backend endpoints.
   
3. **`chatbot_frontend/` (React App)**
   - Built with **React**.
   - Provides a sleek, modern chat interface for users to interact with the AI.

## Getting Started

### 1. Prerequisites

- **Node.js** (v14+ recommended)
- **Python** (3.8+ recommended)
- **Git**

### 2. Setting Up the AI Backend

Navigate to the `AI PROJECT` directory:

```bash
cd "AI PROJECT"
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the `AI PROJECT` directory and add your API keys:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
TAVILY_API_KEY=your_tavily_api_key
```

Start the FastAPI server:

```bash
uvicorn main:app --port 8000 --reload
```

### 3. Setting Up the Node Proxy Backend

Navigate to the `chatbot_backend` directory:

```bash
cd chatbot_backend
```

Install dependencies:

```bash
npm install
```

Start the Express server:

```bash
npm start
```

### 4. Setting Up the React Frontend

Navigate to the `chatbot_frontend` directory:

```bash
cd chatbot_frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

The frontend will be available at `http://localhost:3000`.

## Environment Variables
- Ensure your `OPENROUTER_API_KEY` is set so the agent can successfully process requests. If using other tools, configure their respective keys (e.g., OpenWeather, Tavily) as well.

## License
MIT License
