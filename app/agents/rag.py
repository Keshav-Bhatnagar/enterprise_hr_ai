import json
import numpy as np
from sentence_transformers import SentenceTransformer

# We use a lightweight local model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Raw knowledge base
KNOWLEDGE_BASE = [
    {
        "id": "doc_1",
        "title": "Severance Policy",
        "content": "Our severance policy provides 2 weeks of base pay per year of service, capped at 26 weeks. For executives, it is 4 weeks per year of service."
    },
    {
        "id": "doc_2",
        "title": "Leave and PTO",
        "content": "Employees accrue 15 days of PTO annually. Sick leave is unlimited but requires a doctor's note after 3 consecutive days."
    },
    {
        "id": "doc_3",
        "title": "Performance Improvement Plan (PIP)",
        "content": "Underperformers (Performance Score < 1.5) must be placed on a 30-day PIP (Performance Improvement Plan) before termination."
    },
    {
        "id": "doc_4",
        "title": "Promotions and Advancement",
        "content": "Employees are eligible for promotion after 18 months in their current role, provided their performance score is > 2.5."
    },
    {
        "id": "doc_5",
        "title": "Remote Work Policy",
        "content": "Employees may work remotely up to 3 days a week. Core hours are 10 AM to 3 PM in the employee's local time zone."
    }
]

# Simple in-memory vector store
doc_embeddings = None

def init_vector_store():
    global doc_embeddings
    if doc_embeddings is None:
        contents = [doc["content"] for doc in KNOWLEDGE_BASE]
        doc_embeddings = model.encode(contents)

def query_knowledge_base(query: str, top_k: int = 1) -> str:
    init_vector_store()
    
    query_embedding = model.encode([query])[0]
    
    # Cosine similarity
    similarities = np.dot(doc_embeddings, query_embedding) / (
        np.linalg.norm(doc_embeddings, axis=1) * np.linalg.norm(query_embedding)
    )
    
    # Get top k indices
    top_indices = np.argsort(similarities)[-top_k:][::-1]
    
    results = []
    for idx in top_indices:
        results.append({
            "title": KNOWLEDGE_BASE[idx]["title"],
            "content": KNOWLEDGE_BASE[idx]["content"],
            "relevance_score": float(similarities[idx])
        })
        
    return json.dumps({"query": query, "retrieved_documents": results})
