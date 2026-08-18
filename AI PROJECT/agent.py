"""
agent.py — LangGraph ReAct agent with tool-calling and memory integration.
Implements the decide → act → observe loop that is the core of agentic AI.
"""

import os
from typing import TypedDict, Annotated, Sequence
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver

from tools import available_tools
from memory import memory as conversation_memory

load_dotenv()


# --- State Definition ---
class AgentState(TypedDict):
    """State that flows through the agent graph."""
    messages: Annotated[Sequence[BaseMessage], lambda x, y: list(x) + list(y)]
    session_id: str


# --- LLM Setup ---
# xAI's API is OpenAI compatible, so we can use the ChatOpenAI client
llm = ChatOpenAI(
    model="google/gemini-2.5-flash",
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
    max_tokens=4096,
    temperature=0.7,
    streaming=False,
)

# Bind tools to the LLM
llm_with_tools = llm.bind_tools(available_tools)


# --- Graph Nodes ---

def retrieve_memory_node(state: AgentState) -> dict:
    """
    Retrieve relevant past context from ChromaDB and inject it
    into the system prompt. This gives the agent 'long-term memory'.
    """
    messages = list(state["messages"])
    session_id = state.get("session_id", "default")

    # Get the latest user message for semantic search
    latest_user_msg = ""
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            latest_user_msg = msg.content
            break

    if not latest_user_msg:
        return {"messages": []}

    # Retrieve relevant past conversations
    memories = conversation_memory.retrieve_relevant_memory(
        session_id=session_id,
        query=latest_user_msg,
        k=3
    )

    from datetime import datetime
    current_date = datetime.now().strftime("%B %d, %Y")

    # Build the system prompt with memory context
    system_content = (
        f"You are OmniChat, a helpful and creative AI assistant. The current date is {current_date}. "
        "You have access to tools for checking weather, searching the web, and querying internal documents.\n\n"
        "CRITICAL INSTRUCTION FOR CURRENT EVENTS:\n"
        "You MUST use the `web_search` tool for any questions about current events, politics, office holders, "
        "news, or any facts that could have changed recently. Do NOT rely on your internal training data or "
        "previous conversation memory for current facts, as they may be outdated. ALWAYS verify with a fresh web search.\n\n"
        "Guidelines:\n"
        "• Be conversational, friendly, and engaging\n"
        "• Use markdown formatting for structured responses\n"
        "• When using tools, explain what you're doing\n"
        "• If a tool fails, let the user know gracefully\n"
        "• Remember context from the conversation, but NEVER use it to answer factual questions about current events without verifying via web search.\n"
        "• When using document search tools, synthesize the answer in your own words. Do NOT quote or show the raw document content in the chat history.\n"
    )

    if memories:
        memory_context = "\n".join([m["document"] for m in memories])
        system_content += (
            f"\n--- Relevant Past Context ---\n"
            f"{memory_context}\n"
            f"--- End Past Context ---\n"
            f"\nUse the above context if relevant to the current conversation."
        )

    # Prepend system message (replace if one exists)
    new_messages = [SystemMessage(content=system_content)]
    
    return {"messages": new_messages}


def call_model_node(state: AgentState) -> dict:
    """
    Call the LLM with the current messages and bound tools.
    The LLM decides whether to respond directly or call a tool.
    """
    messages = list(state["messages"])
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}


def should_continue(state: AgentState) -> str:
    """
    Routing function: check if the LLM wants to call a tool.
    If yes → route to tool_node. If no → route to END.
    """
    messages = list(state["messages"])
    last_message = messages[-1]
    
    # If the LLM made tool calls, route to the tool node
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    
    # Otherwise, the agent is done
    return "end"


# --- Build the Graph ---

def create_agent_graph():
    """
    Construct the LangGraph StateGraph implementing the ReAct loop:
    
    retrieve_memory → call_model → [tool_call?] → tool_node → call_model → ... → END
    """
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("retrieve_memory", retrieve_memory_node)
    workflow.add_node("agent", call_model_node)
    workflow.add_node("tools", ToolNode(available_tools))

    # Set entry point
    workflow.set_entry_point("retrieve_memory")

    # Edges
    workflow.add_edge("retrieve_memory", "agent")
    
    # Conditional edge from agent: either call tools or end
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            "end": END,
        }
    )
    
    # After tools execute, go back to the agent to process results
    workflow.add_edge("tools", "agent")

    # Compile with memory checkpointer for within-session state
    checkpointer = MemorySaver()
    graph = workflow.compile(checkpointer=checkpointer)
    
    return graph


# Create the compiled graph (singleton)
agent_graph = create_agent_graph()


async def run_agent(session_id: str, user_message: str) -> dict:
    """
    Run the agent with a user message and return the response.
    
    Args:
        session_id: Unique session identifier for memory/state
        user_message: The user's input message
        
    Returns:
        Dict with 'response' (str) and 'tools_used' (list)
    """
    # Store user message in long-term memory
    conversation_memory.store_conversation(
        session_id=session_id,
        role="user",
        content=user_message
    )

    # Prepare input
    input_state = {
        "messages": [HumanMessage(content=user_message)],
        "session_id": session_id,
    }

    # Config with thread_id for checkpointer
    config = {"configurable": {"thread_id": session_id}}

    # Run the agent graph
    result = await agent_graph.ainvoke(input_state, config=config)

    # Extract the final response
    messages = result["messages"]
    final_message = messages[-1]
    response_text = final_message.content if hasattr(final_message, "content") else str(final_message)

    # Track which tools were used
    tools_used = []
    for msg in messages:
        if hasattr(msg, "tool_calls") and msg.tool_calls:
            for tc in msg.tool_calls:
                tools_used.append(tc["name"])

    # Store assistant response in long-term memory
    conversation_memory.store_conversation(
        session_id=session_id,
        role="assistant",
        content=response_text
    )

    return {
        "response": response_text,
        "tools_used": list(set(tools_used))
    }
