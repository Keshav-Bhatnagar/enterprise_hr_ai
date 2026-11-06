"""
Agentic HR Orchestrator (LangGraph + Gemini)
============================================
This module defines the ReAct (Reasoning & Acting) agent graph.
It connects the LLM (Gemini) with the HR tools we defined in tools.py.
"""

import os
from typing import TypedDict, Annotated, Sequence, Dict, Any
import json
import logging

from langchain_core.messages import BaseMessage, HumanMessage, ToolMessage, AIMessage
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
except ImportError:
    ChatGoogleGenerativeAI = None
from langgraph.graph import StateGraph, END
import operator

from app.agents.tools import TOOL_REGISTRY, call_tool

logger = logging.getLogger(__name__)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    user_role: str

def init_llm():
    if ChatGoogleGenerativeAI is None:
        raise ImportError("langchain_google_genai is not installed in the environment.")
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        raise ValueError("GEMINI_API_KEY is not configured properly.")
    
    # Use Gemini 3.5 Flash Lite for high-throughput, low-latency agentic reasoning (consumes less quota)
    return ChatGoogleGenerativeAI(
        model="gemini-3.5-flash-lite",
        google_api_key=GEMINI_API_KEY,
        temperature=0.2
    )

def create_agent_graph():
    llm = init_llm()

    # Convert our Python tools to Langchain-compatible tool schemas for the LLM
    from langchain_core.tools import StructuredTool
    
    lc_tools = []
    # Registering a subset for the LLM to use
    for name, func in TOOL_REGISTRY.items():
        doc = func.__doc__ or "No description."
        # Simple schema: if a tool takes 'name', we tell the LLM it takes 'name'
        # In a full prod setup, we'd use Pydantic models for strict schemas.
        # Here we dynamically create simple StructuredTools.
        lc_tools.append(
            StructuredTool.from_function(
                func=func,
                name=name,
                description=doc
            )
        )

    # Bind tools to LLM
    llm_with_tools = llm.bind_tools(lc_tools)

    def agent_node(state: AgentState):
        messages = state["messages"]
        system_prompt = f"""You are the NVIDIA NeMo HR Copilot, an elite, highly intelligent AI Assistant for Enterprise HR.
Your role is to assist NVIDIA leadership, managers, and employees with advanced workforce analytics, predictive modeling, and automated workflows.

ROLE CONTEXT:
The current user interacting with you has the role of: '{state['user_role']}'.
Adjust your tone and the level of detail accordingly (e.g., be strategic and concise for admins/executives; be helpful and empowering for employees).

CORE RULES & PROMPTING INSTRUCTIONS:
1. TOOL USAGE: You have access to specialized HR tools. ALWAYS determine the best tool to answer the user's query and call it.
2. SYNTHESIS: Never just dump raw JSON or raw database outputs. Synthesize the tool's output into a beautifully formatted, easy-to-read response.
3. FORMATTING: Use markdown extensively. Use **bolding** for key metrics, bullet points for lists, and emojis (🟢, 🟡, 🔴, 📉, 🚀) to make insights pop visually.
4. TONE: Be professional, confident, and proactive. You are an expert AI.
5. NO HALLUCINATION: If a tool returns an error, do not invent data. Explain the error clearly and politely to the user.
6. NO RAW IDs: Never expose internal database IDs (like 'GlobalIDs') to the user. Use human-readable names.

Follow these rules strictly.
"""
        # Inject system prompt context if it's the first message
        if len(messages) == 1 and isinstance(messages[0], HumanMessage):
            prompt = HumanMessage(content=system_prompt + "\n\nUser Question: " + messages[0].content)
            response = llm_with_tools.invoke([prompt])
        else:
            response = llm_with_tools.invoke(messages)
            
        return {"messages": [response]}

    def tool_node(state: AgentState):
        messages = state["messages"]
        last_message = messages[-1]
        
        tool_responses = []
        user_role = state.get("user_role", "employee")
        
        for tool_call in last_message.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]
            
            # Use our governance-aware call_tool function
            logger.info(f"Agent executing tool: {tool_name} with args {tool_args}")
            try:
                result = call_tool(tool_name=tool_name, user_role=user_role, **tool_args)
                tool_responses.append(
                    ToolMessage(
                        content=json.dumps(result, default=str),
                        tool_call_id=tool_call["id"],
                        name=tool_name
                    )
                )
            except Exception as e:
                logger.error(f"Tool error: {e}")
                tool_responses.append(
                    ToolMessage(
                        content=json.dumps({"error": str(e)}),
                        tool_call_id=tool_call["id"],
                        name=tool_name
                    )
                )
                
        return {"messages": tool_responses}

    def should_continue(state: AgentState):
        messages = state["messages"]
        last_message = messages[-1]
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        return "end"

    workflow = StateGraph(AgentState)
    
    workflow.add_node("agent", agent_node)
    workflow.add_node("tools", tool_node)
    
    workflow.set_entry_point("agent")
    
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            "end": END
        }
    )
    workflow.add_edge("tools", "agent")
    
    return workflow.compile()

# Global orchestrator instance
_orchestrator = None

def get_orchestrator():
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = create_agent_graph()
    return _orchestrator

def run_agent_query(query: str, user_role: str = "hr") -> str:
    """Entry point for the API to call the LangGraph agent."""
    try:
        app = get_orchestrator()
        initial_state = {
            "messages": [HumanMessage(content=query)],
            "user_role": user_role
        }
        
        result = app.invoke(initial_state)
        # The final message is from the AI
        return result["messages"][-1].content
    except ValueError as ve:
        if "GEMINI_API_KEY" in str(ve):
            return "⚠️ Gemini API Key not configured. Please add it to the .env file and restart."
        return f"Error: {str(ve)}"
    except Exception as e:
        logger.error(f"Agent run failed: {e}")
        return f"Sorry, I encountered an error while processing your request: {e}"

# ═══════════════════════════════════════════════════════════════════
# EXECUTION AGENT (Write Access)
# ═══════════════════════════════════════════════════════════════════

def create_execution_agent_graph():
    llm = init_llm()
    from langchain_core.tools import StructuredTool
    from app.agents.tools import EXECUTION_TOOL_REGISTRY, call_execution_tool
    
    lc_tools = []
    for name, func in EXECUTION_TOOL_REGISTRY.items():
        doc = func.__doc__ or "No description."
        lc_tools.append(StructuredTool.from_function(func=func, name=name, description=doc))

    llm_with_tools = llm.bind_tools(lc_tools)

    def agent_node(state: AgentState):
        messages = state["messages"]
        system_prompt = f"""You are the NVIDIA AI Executor Agent.
Unlike the advisory Copilot, you have WRITE ACCESS to the HR systems.
Your job is to execute commands like approving leaves or rejecting candidates when instructed.

ROLE CONTEXT: The user is: '{state['user_role']}'.
Only admins and managers can execute actions.

RULES:
1. Identify the right tool and execute it.
2. If the user tells you to approve a leave request, call approve_leave_request with the ID.
3. Format your final output cleanly. Start with 🚀 **ACTION COMPLETED** or ❌ **ACTION FAILED**.
4. Do NOT hallucinate. Wait for the tool response before claiming success.
"""
        if len(messages) == 1 and isinstance(messages[0], HumanMessage):
            prompt = HumanMessage(content=system_prompt + "\n\nUser Command: " + messages[0].content)
            response = llm_with_tools.invoke([prompt])
        else:
            response = llm_with_tools.invoke(messages)
            
        return {"messages": [response]}

    def tool_node(state: AgentState):
        messages = state["messages"]
        last_message = messages[-1]
        
        tool_responses = []
        user_role = state.get("user_role", "employee")
        
        from app.agents.tools import call_execution_tool
        
        for tool_call in last_message.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]
            
            logger.info(f"Execution Agent running tool: {tool_name} with args {tool_args}")
            try:
                result = call_execution_tool(tool_name=tool_name, user_role=user_role, **tool_args)
                tool_responses.append(ToolMessage(content=json.dumps(result, default=str), tool_call_id=tool_call["id"], name=tool_name))
            except Exception as e:
                logger.error(f"Execution Tool error: {e}")
                tool_responses.append(ToolMessage(content=json.dumps({"error": str(e)}), tool_call_id=tool_call["id"], name=tool_name))
                
        return {"messages": tool_responses}

    def should_continue(state: AgentState):
        messages = state["messages"]
        last_message = messages[-1]
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        return "end"

    workflow = StateGraph(AgentState)
    workflow.add_node("agent", agent_node)
    workflow.add_node("tools", tool_node)
    workflow.set_entry_point("agent")
    workflow.add_conditional_edges("agent", should_continue, {"tools": "tools", "end": END})
    workflow.add_edge("tools", "agent")
    
    return workflow.compile()

_execution_orchestrator = None

def get_execution_orchestrator():
    global _execution_orchestrator
    if _execution_orchestrator is None:
        _execution_orchestrator = create_execution_agent_graph()
    return _execution_orchestrator

def run_execution_agent_query(query: str, user_role: str = "hr") -> str:
    """Entry point for the API to call the LangGraph Execution agent."""
    try:
        app = get_execution_orchestrator()
        initial_state = {"messages": [HumanMessage(content=query)], "user_role": user_role}
        result = app.invoke(initial_state)
        return result["messages"][-1].content
    except Exception as e:
        logger.error(f"Execution Agent run failed: {e}")
        return f"❌ Execution Error: {e}"
