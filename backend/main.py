from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from scraper import scrape_wikipedia
from rag import ask_question_langchain
from pydantic import BaseModel, Field
from typing import Optional, Union
import os
from dotenv import load_dotenv

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

class ChatGetResponse(BaseModel):
    message: str
    usage: str
    example: dict

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
            "chat": "/chat - Chat with Wikipedia content using AI (GET for info, POST for chat)",
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

# FIXED: Separate GET and POST endpoints for chat
@app.get("/chat", response_model=ChatGetResponse, tags=["AI Chat"])
async def chat_info():
    """
    Get information about the chat endpoint.
    """
    return ChatGetResponse(
        message="Chat endpoint is ready! Use POST method to ask questions about Wikipedia topics.",
        usage="Send a POST request with JSON body containing 'topic' and 'question' fields.",
        example={
            "method": "POST",
            "url": "/chat",
            "body": {
                "topic": "Artificial Intelligence",
                "question": "What is machine learning?"
            }
        }
    )

@app.post("/chat", response_model=ChatResponse, tags=["AI Chat"])
async def chat_with_wikipedia(chat_request: ChatRequest):
    """
    Process chat request with topic and question.
    """
    # Check if GROQ API key is configured
    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(
            status_code=500, 
            detail="GROQ_API_KEY is not configured. Please set up your API key."
        )
    
    try:
        print(f"Processing chat request - Topic: {chat_request.topic}, Question: {chat_request.question}")
        answer = ask_question_langchain(chat_request.topic, chat_request.question)
        print(f"Generated answer length: {len(answer)} characters")
        
        return ChatResponse(
            topic=chat_request.topic,
            question=chat_request.question,
            answer=answer
        )
    except ValueError as e:
        print(f"ValueError: {e}")
        if "GROQ_API_KEY" in str(e):
            raise HTTPException(status_code=500, detail="GROQ API key configuration error")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
