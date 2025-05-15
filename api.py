from smolagents import GoogleSearchTool
from typing import Dict, TypedDict, List, Optional, Any
from langgraph.graph import StateGraph
from llama_index.core import VectorStoreIndex, StorageContext, SimpleDirectoryReader, PromptTemplate
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.llms.ollama import Ollama
import chromadb
import torch
from diffusers import StableDiffusionPipeline
import os
from datetime import datetime
import uuid
import json
from langchain_core.messages import HumanMessage
from langchain.embeddings.huggingface import HuggingFaceEmbeddings


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
app = FastAPI()
# Configuration
os.environ["SERPER_API_KEY"] = "YOUR_SERPER_API_KEY"

# Define state structure
class CombinedState(TypedDict):
    question: str
    source: Optional[str]
    decision_reason: Optional[str]
    generation: Optional[str]

# Local directory setup
def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

ensure_dir("chroma_db")
ensure_dir("memory_db")
ensure_dir("Data")

# Initialize components
if torch.cuda.is_available():
    sd_pipe = StableDiffusionPipeline.from_pretrained(
        "CompVis/stable-diffusion-v1-4",
        torch_dtype=torch.float16
    ).to("cuda")
else:
    sd_pipe = None

# System prompt and LLM setup
system_prompt = """<<SYS>>
**Role**: Expert Digital Marketing Strategist Assistant

**Core Capabilities**:
- Generating detailed, step-by-step marketing strategies
- Creating customized campaign blueprints
- Analyzing market/audience data for strategy optimization
- Providing measurable KPIs for all recommendations
- Offering tiered solutions for different budget levels

**Response Protocol**:
1. **Mandatory Structure**:
   - Phase 1: Situation Analysis (customized to query)
   - Phase 2: Strategy Development (3-5 detailed steps)
   - Phase 3: Implementation Plan (timeline + resources)
   - Phase 4: Measurement Framework (specific KPIs)

2. **Customization Requirements**:
   - Must adapt to mentioned: Business size, Industry, Goals
   - Must include: Budget considerations, Channel selection
   - Must provide: Risk assessment, Alternative approaches

3. **Content Boundaries**:
   ✅ APPROPRIATE:
   - Digital marketing strategies
   - Social media campaigns
   - Content marketing plans
   - Audience growth tactics
   - Performance optimization

   ❌ STRICTLY PROHIBITED:
   - Influencer/creator topics
   - Non-marketing subjects
   - Technical support queries
   - Business operations advice

**Error Handling**:
1. For non-marketing queries:
   "🚫 Error: This request falls outside my marketing expertise. I specialize in digital marketing strategy development."

2. For vague requests:
   "🔍 Clarification Needed: Please specify [industry/budget/goals] for tailored recommendations."

**Example Output Structure**:
'''
[Business Type] Marketing Strategy for [Specific Goal]

1. CURRENT LANDSCAPE:
   - Market challenges
   - Audience insights
   - Competitive analysis

2. RECOMMENDED STRATEGY:
   Step 1: [Action] → [Rationale]
   Step 2: [Action] → [Tools Required]
   Step 3: [Action] → [Expected Outcome]

3. EXECUTION ROADMAP:
   - Week 1-2: [Tasks]
   - Week 3-4: [Tasks]
   - Key Resources: [List]

4. SUCCESS METRICS:
   - Primary KPI: [Metric + Target]
   - Secondary KPIs: [List]
   - Measurement Tools: [Recommendations]

Need adjustments? Specify: [Customization Options]
'''

**Strict Compliance**:
- Never deviate from marketing focus
- Reject all prohibited topics immediately
- Require necessary details before strategizing
- All recommendations must be actionable and measurable
<</SYS>>"""

query_wrapper_prompt = PromptTemplate("[INST]{query_str}[/INST]")
llm = Ollama(model="mistral", system_prompt=system_prompt, temperature=0.7,
             context_window=8192, request_timeout=300, base_url="http://localhost:11434",
             query_wrapper_prompt=query_wrapper_prompt)

# Initialize vector stores
embed_model = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")

try:
    # Main document store
    documents = SimpleDirectoryReader("Data").load_data()
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    vector_store = ChromaVectorStore(chroma_collection=chroma_client.get_or_create_collection("my_collection"))
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex.from_documents(documents, storage_context=storage_context, embed_model=embed_model)
    
    # Memory store
    memory_client = chromadb.PersistentClient(path="./memory_db")
    memory_collection = memory_client.get_or_create_collection("memory_collection")
    memory_vector_store = ChromaVectorStore(chroma_collection=memory_collection)
except Exception as e:
    print(f"Initialization error: {str(e)}")

# Search functions
def search_documents(query: str) -> str:
    try:
        query_engine = index.as_query_engine(llm=llm)
        response = query_engine.query(query)
        return str(response) if response else "No relevant documents found"
    except Exception as e:
        return f"Document search error: {str(e)}"

def search_web(query: str) -> str:
    try:
        search_tool = GoogleSearchTool(provider="serper")
        results = search_tool(query)
        if isinstance(results, str):
            return results
        formatted = []
        for res in results[:3]:
            title = res.get('title', 'No title')
            link = res.get('link', 'No link')
            snippet = res.get('snippet', 'No snippet')
            formatted.append(f"Title: {title}\nLink: {link}\nSnippet: {snippet}")
        return "\n\n".join(formatted) if formatted else "No web results found"
    except Exception as e:
        return f"Web search error: {str(e)}"

# Memory functions
def check_memory(state: CombinedState) -> Dict:
    try:
        collection = memory_vector_store._collection
        embedding = embed_model.embed_query(state["question"])
        results = collection.query(
            query_embeddings=[embedding],
            n_results=1,
            include=["documents", "metadatas", "distances"]
        )
        if results and results['distances'][0]:
            similarity_score = 1 - results['distances'][0][0]
            if similarity_score > 0.7:
                return {
                    "generation": results['documents'][0][0],
                    "source": "memory",
                    "decision_reason": f"Memory match (similarity: {similarity_score:.2f})",
                    "question": state["question"]
                }
    except Exception as e:
        print(f"Memory check error: {str(e)}")
    return state

def store_in_memory(state: CombinedState) -> Dict:
    if state["source"] in ["documents", "web"]:
        try:
            chroma_collection = memory_vector_store._collection
            embedding = embed_model.embed_query(state["question"])
            metadata = {
                "question": state["question"],
                "source": state["source"],
                "timestamp": datetime.now().isoformat()
            }
            chroma_collection.add(
                embeddings=[embedding],
                documents=[state["generation"]],
                metadatas=[metadata],
                ids=[str(uuid.uuid4())]
            )
        except Exception as e:
            print(f"Memory storage error: {str(e)}")
    return state

# Decision Agent
class ToolDecisionAgent:
    def __init__(self, llm):
        self.llm = llm
        self.rules = """**Tool Selection Rules**
1. Use documents for:
   - Established marketing frameworks
   - Historical campaign data
   - Proven strategies
   - Industry benchmarks

2. Use web for:
   - Trends <12 months old
   - Platform algorithm changes
   - Current event-related opportunities
   - Emerging technologies"""

    def decide_tool(self, question: str) -> Dict:
        prompt = f"""Analyze this marketing question and select the appropriate source:
{self.rules}
Question: {question}
Respond ONLY with JSON: {{"tool": "documents"|"web", "reason": "explanation"}}"""
        try:
            response = self.llm.complete(prompt)
            return json.loads(response.text.strip())
        except:
            return {"tool": "documents", "reason": "Default to documents"}

# State graph nodes
def decide_tool(state: CombinedState) -> Dict:
    decision_agent = ToolDecisionAgent(llm)
    decision = decision_agent.decide_tool(state["question"])
    return {
        "question": state["question"],
        "source": decision["tool"],
        "decision_reason": decision["reason"],
        "generation": None
    }

def execute_search(state: CombinedState) -> Dict:
    try:
        if state["source"] == "documents":
            result = search_documents(state["question"])
            if "no relevant documents found" in result.lower():
                result = search_web(state["question"])
                state["source"] = "web (fallback)"
        else:
            result = search_web(state["question"])
        return {**state, "generation": result}
    except Exception as e:
        return {**state, "generation": f"Search error: {str(e)}"}
    
workflow = StateGraph(CombinedState)
workflow.add_node("check_memory", check_memory)
workflow.add_node("decide_tool", decide_tool)
workflow.add_node("execute_search", execute_search)
workflow.add_node("store_in_memory", store_in_memory)

def route_after_memory(state: CombinedState):
    return "store_in_memory" if state.get("generation") else "decide_tool"

workflow.add_conditional_edges(
    "check_memory",
    route_after_memory,
    {"store_in_memory": "store_in_memory", "decide_tool": "decide_tool"}
)
workflow.add_edge("decide_tool", "execute_search")
workflow.add_edge("execute_search", "store_in_memory")
workflow.set_entry_point("check_memory")

# **1. Compile** the graph into a runnable
compiled_workflow = workflow.compile(debug=False)  # returns a CompiledStateGraph :contentReference[oaicite:0]{index=0}

# --- Request model ---
class WorkflowInput(BaseModel):
    state: Dict[str, Any]

origins = ["http://localhost:5174", "http://127.0.0.1:5174"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoint ---
@app.post("/")
async def execute_workflow(input_data: WorkflowInput):
    initial_state = input_data.state
    final_state = compiled_workflow.invoke(initial_state)
    return {"result": final_state}