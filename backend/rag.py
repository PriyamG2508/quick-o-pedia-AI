"""
RAG model for chat functionality with Wikipedia scraped content.
"""

# SQLite compatibility fix for ChromaDB 
import sqlite3
import sys
from langchain.chains import RetrievalQA
from langchain_groq import ChatGroq  
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.prompts import PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from scraper import scrape_wikipedia
from langchain.schema import Document
from dotenv import load_dotenv
import os

# GLOBAL CACHES - Initialize once, reuse forever
_embeddings = None
_llm_client = None
_vector_stores = {}  
_qa_chains = {}     

def get_cached_embeddings():
    """Load embeddings model once and reuse it"""
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return _embeddings

def get_cached_llm():
    """Initialize LLM client once and reuse it"""
    global _llm_client
    if _llm_client is None:
        load_dotenv()
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        
        _llm_client = ChatGroq(
            api_key=api_key,  
            model_name="llama-3.1-8b-instant",  
            temperature=0.7,
        )
    return _llm_client

def convert_text_to_documents(text, topic_name):
    chunks = split_text(text)
    documents = []
    for i, chunk in enumerate(chunks):
        doc = Document(
            page_content=chunk,
            metadata={
                "source": f"Wikipedia: {topic_name}",
                "chunk_id": i,
                "topic": topic_name
            }
        )
        documents.append(doc)
    return documents

def split_text(text, chunk_size=1000, chunk_overlap=200):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len
    )
    return text_splitter.split_text(text)

def get_or_create_vector_store(topic_name):
    """Get vector store from cache or create new one"""
    topic_key = topic_name.lower().replace(' ', '_')
    
    # Check memory cache first
    if topic_key in _vector_stores:
        return _vector_stores[topic_key]
    
    # Check if exists on disk
    embeddings = get_cached_embeddings()
    persist_dir = f"chroma_db/{topic_key}"
    
    vector_store = Chroma(
        embedding_function=embeddings, 
        persist_directory=persist_dir
    )
    
    # Check if data already exists on disk
    try:
        existing = vector_store.get()
        if existing['ids']:  # Data exists, cache and return
            _vector_stores[topic_key] = vector_store
            return vector_store
    except:
        pass  # No existing data
    
    # Need to create new data - scrape and populate
    print(f"Creating new vector store for: {topic_name}")
    content = scrape_wikipedia(topic_name)
    if not content:
        raise ValueError(f"Could not scrape content for topic: {topic_name}")
    
    documents = convert_text_to_documents(content, topic_name)
    vector_store.add_documents(documents)
    
    # Cache it
    _vector_stores[topic_key] = vector_store
    return vector_store

def get_or_create_qa_chain(topic_name):
    """Get QA chain from cache or create new one"""
    topic_key = topic_name.lower().replace(' ', '_')
    
    # Check cache first
    if topic_key in _qa_chains:
        return _qa_chains[topic_key]
    
    # Create new chain
    print(f"Creating new QA chain for: {topic_name}")
    vector_store = get_or_create_vector_store(topic_name)
    llm_client = get_cached_llm()

    prompt_template = PromptTemplate(
        template="""You are a helpful assistant answering question based on the wikipedia content.

        Content: {context}
        Question: {question}
        
        Instructions:
        - Answer based ONLY on the provided context
        - If information isn't in the context, say so clearly
        - Be conversational and comprehensive
        - Include relevant details from the context
        Answer: """,
        input_variables=["context", "question"]
    )

    qa_chain = RetrievalQA.from_chain_type(
        llm=llm_client,
        chain_type="stuff",
        retriever=vector_store.as_retriever(search_kwargs={"k": 3}),
        chain_type_kwargs={"prompt": prompt_template},
        return_source_documents=True
    )
    
    # Cache it
    _qa_chains[topic_key] = qa_chain
    return qa_chain

def ask_question_langchain(topic, question):
    """Fast question answering - everything is cached after first use"""
    try:
        qa_chain = get_or_create_qa_chain(topic)
        result = qa_chain({"query": question})
        return result["result"]
    except Exception as e:
        return f"Error getting response: {str(e)}"

# Optional: Preload popular topics
def preload_topic(topic_name):
    """Preload a topic to make first query faster"""
    try:
        get_or_create_qa_chain(topic_name)
        print(f"Preloaded topic: {topic_name}")
    except Exception as e:
        print(f"Failed to preload {topic_name}: {e}")
