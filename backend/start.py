#!/usr/bin/env python3
"""
Startup script for the Quick o Pedia backend server.
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Check if GROQ API key is configured
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        print("⚠️  Warning: GROQ_API_KEY is not configured.")
        print("   AI chat functionality will not work without it.")
        print("   Please set GROQ_API_KEY in your .env file.")
        print()
    
    print("🚀 Starting Quick o Pedia Backend Server...")
    print(f"📍 Server will be available at: http://localhost:8000")
    print(f"📚 API Documentation: http://localhost:8000/docs")
    print(f"🔍 Health Check: http://localhost:8000/health")
    print()
    
    # Start the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload for development
        log_level="info"
    )
