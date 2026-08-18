"""
document_loader.py — Ingests external documents (PDFs, TXT) into ChromaDB for RAG.
Provides functions to load, chunk, and store documents in the `document_knowledge` collection.
"""

import os
import glob
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import chromadb

# Initialize ChromaDB client (same as memory.py)
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(
    name="document_knowledge",
    metadata={"hnsw:space": "cosine"}
)

def load_and_split_document(file_path: str) -> list:
    """Loads a document and splits it into chunks."""
    print(f"Processing {file_path}...")
    if file_path.endswith('.pdf'):
        loader = PyPDFLoader(file_path)
    elif file_path.endswith('.txt'):
        loader = TextLoader(file_path, encoding='utf-8')
    else:
        print(f"Unsupported file format: {file_path}")
        return []

    documents = loader.load()
    
    # Split text into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    chunks = text_splitter.split_documents(documents)
    return chunks

def ingest_directory(directory_path: str = "./data/library"):
    """Ingests all supported documents in a directory into ChromaDB."""
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)
        print(f"Created directory {directory_path}. Please add documents and run again.")
        return

    # Find all PDFs and TXT files
    pdf_files = glob.glob(os.path.join(directory_path, "*.pdf"))
    txt_files = glob.glob(os.path.join(directory_path, "*.txt"))
    all_files = pdf_files + txt_files
    
    if not all_files:
        print(f"No documents found in {directory_path}.")
        return

    total_chunks = 0
    for file_path in all_files:
        chunks = load_and_split_document(file_path)
        if not chunks:
            continue
            
        # Extract text and metadata
        documents = [chunk.page_content for chunk in chunks]
        metadatas = [chunk.metadata for chunk in chunks]
        
        # Generate unique IDs for each chunk based on source and page/chunk index
        ids = [f"{os.path.basename(file_path)}_{i}" for i in range(len(chunks))]
        
        # Add to ChromaDB
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        total_chunks += len(chunks)
        print(f"Added {len(chunks)} chunks from {os.path.basename(file_path)}.")
        
    print(f"Ingestion complete. Total chunks added: {total_chunks}")

if __name__ == "__main__":
    # If run directly, ingest documents from the default ./data folder
    ingest_directory()
