"""
tools.py — LangChain tools for the ReAct agent.
Provides weather lookup (OpenWeather) and web search (Tavily).
"""

import os
import requests
from langchain_core.tools import tool
from dotenv import load_dotenv

load_dotenv()


@tool
def get_weather(city: str) -> str:
    """Get the current weather for a city. Use this when the user asks about weather conditions, temperature, or forecasts for a specific location."""
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        return "Weather service is not configured. Please set OPENWEATHER_API_KEY in your .env file."

    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": city,
            "appid": api_key,
            "units": "metric"
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        weather_desc = data["weather"][0]["description"].capitalize()
        temp = data["main"]["temp"]
        feels_like = data["main"]["feels_like"]
        humidity = data["main"]["humidity"]
        wind_speed = data["wind"]["speed"]
        city_name = data["name"]
        country = data["sys"]["country"]

        return (
            f"🌍 Weather in {city_name}, {country}:\n"
            f"• Condition: {weather_desc}\n"
            f"• Temperature: {temp}°C (feels like {feels_like}°C)\n"
            f"• Humidity: {humidity}%\n"
            f"• Wind Speed: {wind_speed} m/s"
        )
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            return f"City '{city}' not found. Please check the spelling and try again."
        return f"Weather API error: {str(e)}"
    except Exception as e:
        return f"Failed to fetch weather data: {str(e)}"


@tool
def web_search(query: str) -> str:
    """Search the web for current information. Use this when the user asks about recent events, news, facts you're unsure about, or anything that requires up-to-date information."""
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return "Web search service is not configured. Please set TAVILY_API_KEY in your .env file."

    try:
        url = "https://api.tavily.com/search"
        payload = {
            "api_key": api_key,
            "query": query,
            "search_depth": "basic",
            "max_results": 5
        }
        response = requests.post(url, json=payload, timeout=15)
        response.raise_for_status()
        data = response.json()

        results = data.get("results", [])
        if not results:
            return f"No search results found for: {query}"

        formatted = f"🔍 Search results for: {query}\n\n"
        for i, result in enumerate(results[:5], 1):
            title = result.get("title", "No title")
            content = result.get("content", "No content")
            source_url = result.get("url", "")
            # Truncate content to keep it manageable
            if len(content) > 300:
                content = content[:300] + "..."
            formatted += f"{i}. **{title}**\n   {content}\n   Source: {source_url}\n\n"

        return formatted
    except Exception as e:
        return f"Failed to perform web search: {str(e)}"


# Export tools list for the agent
import chromadb

@tool
def query_documents(query: str) -> str:
    """Query the internal document knowledge base. Use this when the user asks questions about specific documents, company data, or any uploaded text/PDF files."""
    try:
        client = chromadb.PersistentClient(path="./chroma_db")
        collection = client.get_or_create_collection(
            name="document_knowledge",
            metadata={"hnsw:space": "cosine"}
        )
        
        results = collection.query(
            query_texts=[query],
            n_results=3
        )
        
        if not results["documents"] or not results["documents"][0]:
            return f"No relevant information found in the document knowledge base for: {query}"
            
        formatted = f"📄 Document Search Results for: {query}\n\n"
        for i, doc in enumerate(results["documents"][0], 1):
            metadata = results["metadatas"][0][i-1] if results["metadatas"] else {}
            source = metadata.get("source", "Unknown")
            page = metadata.get("page", "Unknown")
            
            # Truncate slightly if too long
            content = doc[:500] + "..." if len(doc) > 500 else doc
            formatted += f"**Result {i}** (Source: {source}, Page: {page}):\n{content}\n\n"
            
        return formatted
    except Exception as e:
        return f"Failed to query document knowledge base: {str(e)}"

available_tools = [get_weather, web_search, query_documents]
