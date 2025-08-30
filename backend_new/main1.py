"""FastAPI server for Wikipedia scraper and AI chat functionality."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from scraper import scrape_wikipedia
from rag import ask_question_langchain
from pydantic import BaseModel, Field
import os
from dotenv import load_dotenv
import threading

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Quick o Pedia API",
    description="A Wikipedia scraper with AI assistant for interactive learning",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class ScrapeRequest(BaseModel):
    topic: str = Field(..., title="Wikipedia Topic", description="The topic to scrape from Wikipedia", example="Python (programming language)")

class ChatRequest(BaseModel):
    topic: str = Field(..., title="Wikipedia Topic", description="The topic of the Wikipedia page to chat about", min_length=1)
    question: str = Field(..., title="Question", description="The question to ask the AI about the topic", min_length=1)

# Response models
class ScrapeResponse(BaseModel):
    topic: str = Field(..., description="The topic that was scraped")
    content_length: int = Field(..., description="The total number of characters in the scraped content")
    word_count: int = Field(..., description="The total number of words in the scraped content")
    content: str = Field(..., description="The cleaned text content from the Wikipedia page")

class ChatResponse(BaseModel):
    topic: str = Field(..., description="The topic that was discussed")
    question: str = Field(..., description="The question that was asked")
    answer: str = Field(..., description="The AI-generated answer")

class HealthResponse(BaseModel):
    status: str
    message: str
    groq_api_configured: bool

@app.get("/", response_model=dict)
def read_root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to the Quick o Pedia API!",
        "version": "1.0.0",
        "endpoints": {
            "scrape": "/scrape - Scrape Wikipedia content",
            "chat": "/chat - Chat with Wikipedia content using AI",
            "health": "/health - Check API health"
        }
    }

@app.get("/health", response_model=HealthResponse)
def health_check():
    """Check API health and configuration"""
    groq_configured = bool(os.getenv("GROQ_API_KEY"))
    
    return HealthResponse(
        status="healthy" if groq_configured else "warning",
        message="API is running" if groq_configured else "API is running but GROQ_API_KEY is not configured",
        groq_api_configured=groq_configured
    )

@app.post("/scrape", response_model=ScrapeResponse, tags=["Wikipedia"])
async def scrape_wikipedia_endpoint(request: ScrapeRequest):
    """
    Scrape a Wikipedia page for the given topic.
    """
    try:
        content = scrape_wikipedia(request.topic)
        if not content:
            raise HTTPException(
                status_code=404, 
                detail=f"Topic '{request.topic}' not found or no content available. Please check the spelling and try again."
            )
        
        # Calculate word count
        word_count = len(content.split())
        
        return ScrapeResponse(
            topic=request.topic,
            content_length=len(content),
            word_count=word_count,
            content=content
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scraping Wikipedia: {str(e)}")

@app.post("/chat", response_model=ChatResponse, tags=["AI Chat"])
async def chat_with_wikipedia_post(request: ChatRequest):
    """
    Ask a question about a Wikipedia topic and get an AI-generated answer (POST method).
    """
    # Check if GROQ API key is configured
    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(
            status_code=500, 
            detail="GROQ_API_KEY is not configured. Please set up your API key."
        )
    
    try:
        answer = ask_question_langchain(request.topic, request.question)
        
        return ChatResponse(
            topic=request.topic,
            question=request.question,
            answer=answer
        )
    except ValueError as e:
        if "GROQ_API_KEY" in str(e):
            raise HTTPException(status_code=500, detail="GROQ API key configuration error")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

@app.get("/chat", response_model=ChatResponse, tags=["AI Chat"])
async def chat_with_wikipedia_get(topic: str, question: str):
    """
    Ask a question about a Wikipedia topic and get an AI-generated answer (GET method).
    Example: /chat?topic=Python&question=What is Python used for?
    """
    # Check if GROQ API key is configured
    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(
            status_code=500, 
            detail="GROQ_API_KEY is not configured. Please set up your API key."
        )
    
    # Validate parameters
    if not topic or not topic.strip():
        raise HTTPException(status_code=400, detail="Topic parameter is required and cannot be empty")
    
    if not question or not question.strip():
        raise HTTPException(status_code=400, detail="Question parameter is required and cannot be empty")
    
    try:
        answer = ask_question_langchain(topic.strip(), question.strip())
        
        return ChatResponse(
            topic=topic.strip(),
            question=question.strip(),
            answer=answer
        )
    except ValueError as e:
        if "GROQ_API_KEY" in str(e):
            raise HTTPException(status_code=500, detail="GROQ API key configuration error")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)