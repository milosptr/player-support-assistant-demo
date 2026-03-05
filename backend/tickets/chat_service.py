import json
import logging
import os
import time

import requests

from .models import Ticket

logger = logging.getLogger(__name__)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
CHAT_MODEL = "gemini-2.5-flash"
MAX_ITERATIONS = 8
REQUEST_TIMEOUT = 30

VALID_STATUSES = {s[0] for s in Ticket.STATUS_CHOICES}

SYSTEM_PROMPT = """You are an internal AI assistant for support agents at a space MMO game (similar to EVE Online). \
You help agents manage player support tickets — searching for tickets, looking up details, and performing actions.

You are concise and professional. You speak to agents, not players.

When referencing tickets, mention the player name and subject for context.

You have access to tools for searching and retrieving tickets, and for proposing write actions \
(status changes, category updates, resolving tickets). Write actions require agent confirmation before executing."""

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_tickets",
            "description": "Search tickets by query text, status, and/or category. Returns a list of matching tickets.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Text to search in player names and subjects",
                    },
                    "status": {
                        "type": "string",
                        "enum": ["open", "in_progress", "resolved"],
                        "description": "Filter by ticket status",
                    },
                    "category": {
                        "type": "string",
                        "enum": ["bug", "billing", "gameplay", "abuse", "feedback"],
                        "description": "Filter by ticket category",
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_ticket",
            "description": "Get full details of a specific ticket by ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "The ticket UUID",
                    },
                },
                "required": ["id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_ticket_status",
            "description": "Change a ticket's status (e.g., mark as in_progress). Requires agent confirmation.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "The ticket UUID",
                    },
                    "status": {
                        "type": "string",
                        "enum": ["open", "in_progress", "resolved"],
                        "description": "New status for the ticket",
                    },
                },
                "required": ["id", "status"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_ticket_category",
            "description": "Change a ticket's category. Requires agent confirmation.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "The ticket UUID",
                    },
                    "category": {
                        "type": "string",
                        "enum": ["bug", "billing", "gameplay", "abuse", "feedback"],
                        "description": "New category for the ticket",
                    },
                },
                "required": ["id", "category"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "resolve_ticket",
            "description": "Resolve a ticket with an agent response message. Requires agent confirmation.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "The ticket UUID",
                    },
                    "agent_response": {
                        "type": "string",
                        "description": "The response message to send to the player",
                    },
                },
                "required": ["id", "agent_response"],
            },
        },
    },
]

READ_TOOLS = {"search_tickets", "get_ticket"}
WRITE_TOOLS = {"update_ticket_status", "update_ticket_category", "resolve_ticket"}


def _execute_search(args):
    from django.db.models import Q
    qs = Ticket.objects.all()
    query = args.get("query")
    status = args.get("status")
    category = args.get("category")
    if status:
        qs = qs.filter(status=status)
    if category:
        qs = qs.filter(category=category)
    if query:
        qs = qs.filter(Q(player_name__icontains=query) | Q(subject__icontains=query))
    tickets = qs[:20]
    return [
        {
            "id": str(t.id),
            "player_name": t.player_name,
            "subject": t.subject,
            "category": t.category,
            "status": t.status,
            "created_at": t.created_at.isoformat(),
        }
        for t in tickets
    ]


def _execute_get_ticket(args):
    ticket_id = args.get("id")
    try:
        t = Ticket.objects.get(id=ticket_id)
        return {
            "id": str(t.id),
            "player_name": t.player_name,
            "subject": t.subject,
            "message": t.message,
            "category": t.category,
            "status": t.status,
            "ai_category": t.ai_category,
            "ai_response": t.ai_response,
            "agent_response": t.agent_response,
            "created_at": t.created_at.isoformat(),
            "updated_at": t.updated_at.isoformat(),
        }
    except Ticket.DoesNotExist:
        return {"error": f"Ticket {ticket_id} not found."}
    except Exception:
        return {"error": f"Invalid ticket ID: {ticket_id}"}


def _get_current_ticket_context(ticket_id):
    if not ticket_id:
        return ""
    try:
        t = Ticket.objects.get(id=ticket_id)
        return (
            f"\n\nThe agent is currently viewing ticket {t.id}:\n"
            f"- Player: {t.player_name}\n"
            f"- Subject: {t.subject}\n"
            f"- Category: {t.category or 'uncategorized'}\n"
            f"- Status: {t.status}\n"
            f"- Message: {t.message}\n"
            f'- AI Response: {t.ai_response or "none"}\n'
            f'- Agent Response: {t.agent_response or "none"}'
        )
    except Ticket.DoesNotExist:
        return ""


def _call_gemini(messages, api_key):
    response = requests.post(
        GEMINI_API_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": CHAT_MODEL,
            "messages": messages,
            "tools": TOOLS,
            "temperature": 0.3,
        },
        timeout=REQUEST_TIMEOUT,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]


def run_chat(messages, current_ticket_id=None, conversation_history=None):
    """
    Run the agentic chat loop.
    Returns {"message": str, "proposed_actions": list, "conversation_history": list}
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {
            "message": "AI assistant is unavailable — no Gemini API key configured.",
            "proposed_actions": [],
            "conversation_history": [],
        }

    system_content = SYSTEM_PROMPT + _get_current_ticket_context(current_ticket_id)
    api_messages = [{"role": "system", "content": system_content}]

    if conversation_history:
        api_messages.extend(conversation_history)
    else:
        for msg in messages:
            api_messages.append({"role": msg["role"], "content": msg["content"]})

    proposed_actions = []
    start_time = time.time()

    try:
        for _ in range(MAX_ITERATIONS):
            if time.time() - start_time > REQUEST_TIMEOUT:
                return {
                    "message": "I took too long processing that request. Could you try again?",
                    "proposed_actions": [],
                    "conversation_history": api_messages[1:],
                }

            result = _call_gemini(api_messages, api_key)

            tool_calls = result.get("tool_calls")
            if not tool_calls:
                api_messages.append(result)
                return {
                    "message": result.get("content", ""),
                    "proposed_actions": proposed_actions,
                    "conversation_history": api_messages[1:],
                }

            api_messages.append(result)

            has_write_tools = False
            for tc in tool_calls:
                fn_name = tc["function"]["name"]
                try:
                    fn_args = json.loads(tc["function"]["arguments"])
                except (json.JSONDecodeError, KeyError):
                    fn_args = {}

                if fn_name in READ_TOOLS:
                    if fn_name == "search_tickets":
                        tool_result = _execute_search(fn_args)
                    else:
                        tool_result = _execute_get_ticket(fn_args)
                    api_messages.append({
                        "role": "tool",
                        "tool_call_id": tc["id"],
                        "content": json.dumps(tool_result),
                    })
                elif fn_name in WRITE_TOOLS:
                    has_write_tools = True
                    proposed_actions.append({
                        "type": fn_name,
                        "args": fn_args,
                    })
                    api_messages.append({
                        "role": "tool",
                        "tool_call_id": tc["id"],
                        "content": json.dumps({
                            "status": "pending_confirmation",
                            "message": "This action requires agent confirmation before executing.",
                        }),
                    })
                else:
                    api_messages.append({
                        "role": "tool",
                        "tool_call_id": tc["id"],
                        "content": json.dumps({"error": f"Unknown tool: {fn_name}"}),
                    })

            if has_write_tools:
                continue

        return {
            "message": "I needed too many steps to process that request. Could you try a simpler question?",
            "proposed_actions": proposed_actions,
            "conversation_history": api_messages[1:],
        }

    except requests.Timeout:
        return {
            "message": "The AI service timed out. Please try again.",
            "proposed_actions": [],
            "conversation_history": api_messages[1:],
        }
    except requests.RequestException as e:
        logger.error("Chat API call failed: %s", e)
        return {
            "message": "The AI service is temporarily unavailable. Please try again later.",
            "proposed_actions": [],
            "conversation_history": api_messages[1:],
        }
    except (KeyError, json.JSONDecodeError) as e:
        logger.error("Chat response parsing failed: %s", e)
        return {
            "message": "I received an unexpected response. Please try again.",
            "proposed_actions": [],
            "conversation_history": api_messages[1:],
        }
