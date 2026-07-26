"""
memory.py — ChromaDB-based vector memory for long-term conversation recall.
Stores conversation turns as embeddings and retrieves semantically relevant
past context to inject into the agent's prompt.
"""

import chromadb
from chromadb.config import Settings
from datetime import datetime
import hashlib
import os


class ConversationMemory:
    """Manages long-term conversation memory using ChromaDB."""

    def __init__(self, persist_directory: str = "./chroma_db"):
        """Initialize ChromaDB persistent client."""
        self.client = chromadb.PersistentClient(path=persist_directory)
        self.collection = self.client.get_or_create_collection(
            name="conversation_memory",
            metadata={"hnsw:space": "cosine"}
        )

    def _generate_id(self, session_id: str, content: str, timestamp: str) -> str:
        """Generate a unique ID for a memory entry."""
        raw = f"{session_id}:{content}:{timestamp}"
        return hashlib.md5(raw.encode()).hexdigest()

    def store_conversation(self, session_id: str, role: str, content: str) -> None:
        """
        Store a conversation turn in the vector database.
        
        Args:
            session_id: Unique session identifier
            role: 'user' or 'assistant'
            content: The message content
        """
        timestamp = datetime.now().isoformat()
        doc_id = self._generate_id(session_id, content, timestamp)

        # Format the document for better retrieval
        document = f"[{role.upper()}]: {content}"

        self.collection.add(
            documents=[document],
            metadatas=[{
                "session_id": session_id,
                "role": role,
                "timestamp": timestamp,
                "content_preview": content[:200]
            }],
            ids=[doc_id]
        )

    def retrieve_relevant_memory(
        self,
        session_id: str,
        query: str,
        k: int = 3
    ) -> list[dict]:
        """
        Retrieve the most relevant past conversation snippets for a given query.
        
        Args:
            session_id: Filter to this session's memories
            query: The current user query to match against
            k: Number of results to return
            
        Returns:
            List of dicts with 'document', 'role', 'timestamp' keys
        """
        try:
            # Check if collection has any documents for this session
            all_results = self.collection.get(
                where={"session_id": session_id}
            )
            
            if not all_results["ids"]:
                return []

            results = self.collection.query(
                query_texts=[query],
                n_results=min(k, len(all_results["ids"])),
                where={"session_id": session_id}
            )

            memories = []
            if results and results["documents"]:
                for i, doc in enumerate(results["documents"][0]):
                    metadata = results["metadatas"][0][i] if results["metadatas"] else {}
                    memories.append({
                        "document": doc,
                        "role": metadata.get("role", "unknown"),
                        "timestamp": metadata.get("timestamp", ""),
                    })

            return memories
        except Exception as e:
            print(f"Memory retrieval error: {e}")
            return []

    def get_session_history(self, session_id: str) -> list[dict]:
        """
        Get all conversation turns for a session, ordered by timestamp.
        
        Args:
            session_id: The session to retrieve history for
            
        Returns:
            List of conversation turns ordered chronologically
        """
        try:
            results = self.collection.get(
                where={"session_id": session_id}
            )

            if not results["ids"]:
                return []

            history = []
            for i, doc in enumerate(results["documents"]):
                metadata = results["metadatas"][i] if results["metadatas"] else {}
                history.append({
                    "role": metadata.get("role", "unknown"),
                    "content": metadata.get("content_preview", doc),
                    "timestamp": metadata.get("timestamp", ""),
                })

            # Sort by timestamp
            history.sort(key=lambda x: x["timestamp"])
            return history
        except Exception as e:
            print(f"History retrieval error: {e}")
            return []

    def get_all_sessions(self) -> list[str]:
        """Get a list of all unique session IDs."""
        try:
            results = self.collection.get()
            if not results["metadatas"]:
                return []
            
            sessions = set()
            for metadata in results["metadatas"]:
                if "session_id" in metadata:
                    sessions.add(metadata["session_id"])
            return list(sessions)
        except Exception as e:
            print(f"Session list error: {e}")
            return []


# Singleton instance
memory = ConversationMemory()
