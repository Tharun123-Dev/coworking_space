# chatbot/views.py
# =================
# FULLY DYNAMIC CoWork AI Chatbot — Groq Edition
# ================================================
# Uses Groq (llama-3.3-70b) — 14,400 free requests/day, no quota issues.
# Fetches EVERYTHING live from DB on every request:
#   Workspaces, Slots (by date), MonthlySlots, Categories,
#   Offers, AdditionalAmenities, Reviews, Coupons
#
# API:
#   POST /api/chatbot/      — main chat
#   GET  /api/chatbot/data/ — raw live data preview
 
import re
from datetime import date, timedelta
from django.conf import settings
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
 
 
# ─── Groq client (lazy singleton) ────────────────────────────────────────────
_groq_client = None
 
def _get_client():
    global _groq_client
    if _groq_client is None:
        from groq import Groq
        _groq_client = Groq(api_key=settings.GROQ_API_KEY)
    return _groq_client
 
 
# ─────────────────────────────────────────────────────────────────────────────
# DATE EXTRACTOR
# ─────────────────────────────────────────────────────────────────────────────
 
def _extract_date(message: str):
    """Auto-detect date from user message. Returns YYYY-MM-DD string or None."""
    msg = message.lower().strip()
    today = timezone.now().date()
 
    if "today" in msg:
        return str(today)
    if "tomorrow" in msg:
        return str(today + timedelta(days=1))
    if "day after tomorrow" in msg:
        return str(today + timedelta(days=2))
 
    # YYYY-MM-DD
    m = re.search(r"\b(\d{4}-\d{2}-\d{2})\b", message)
    if m:
        return m.group(1)
 
    # DD/MM/YYYY or DD-MM-YYYY
    m = re.search(r"\b(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})\b", message)
    if m:
        try:
            return str(date(int(m.group(3)), int(m.group(2)), int(m.group(1))))
        except ValueError:
            pass
 
    months = {
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
        "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
        "january": 1, "february": 2, "march": 3, "april": 4, "june": 6,
        "july": 7, "august": 8, "september": 9, "october": 10,
        "november": 11, "december": 12,
    }
 
    # "15 July" or "15th July"
    m = re.search(
        r"\b(\d{1,2})(?:st|nd|rd|th)?\s+"
        r"(jan\w*|feb\w*|mar\w*|apr\w*|may|jun\w*|jul\w*|aug\w*|sep\w*|oct\w*|nov\w*|dec\w*)\b",
        msg
    )
    if m:
        day_str, month_str = m.group(1), m.group(2)[:3]
    else:
        # "July 15" or "July 15th"
        m = re.search(
            r"\b(jan\w*|feb\w*|mar\w*|apr\w*|may|jun\w*|jul\w*|aug\w*|sep\w*|oct\w*|nov\w*|dec\w*)\s+"
            r"(\d{1,2})(?:st|nd|rd|th)?\b",
            msg
        )
        if m:
            month_str, day_str = m.group(1)[:3], m.group(2)
        else:
            month_str, day_str = None, None
 
    if month_str and day_str:
        mo = months.get(month_str)
        if mo:
            try:
                y = today.year
                candidate = date(y, mo, int(day_str))
                if candidate < today:
                    candidate = date(y + 1, mo, int(day_str))
                return str(candidate)
            except ValueError:
                pass
 
    return None
 
 
# ─────────────────────────────────────────────────────────────────────────────
# LIVE CONTEXT BUILDER — compact, ~800 tokens max
# ─────────────────────────────────────────────────────────────────────────────
 
def _build_context(target_date=None):
    """
    Builds compact pipe-delimited context from live DB.
    Loads slots only when a date is mentioned (saves tokens).
    """
    from workspaces.models import (
        Workspace, WorkspaceCategory,
        OfferWorkspace, WorkspaceSlot, MonthlySlot, AdditionalAmenity,
    )
 
    try:
        from reviews.models import Review
        has_reviews = True
    except ImportError:
        has_reviews = False
 
    today = timezone.now().date()
    lines = [f"TODAY:{today}"]
 
    # ── WORKSPACES ────────────────────────────────────────────────────────────
    workspaces = list(
        Workspace.objects
        .filter(is_approved=True, isavailable=True)
        .prefetch_related("amenities", "additional_amenities")
    )
 
    cities = sorted({ws.city for ws in workspaces if ws.city})
    lines.append(f"CITIES:{', '.join(cities)}")
    lines.append(f"TOTAL_WORKSPACES:{len(workspaces)}")
 
    for ws in workspaces:
        amenities = ", ".join(a.name for a in ws.amenities.all())
        desc = (ws.description or "")[:100].replace("\n", " ")
        lines.append(
            f"WS|{ws.id}|{ws.name}|{ws.city}|{ws.location}"
            f"|₹{ws.price}/day|amenities:[{amenities}]|{desc}"
        )
 
        # Paid add-ons
        extras = ws.additional_amenities.filter(is_active=True)
        for ex in extras:
            lines.append(
                f"  ADDON|{ws.name}|{ex.title}|₹{ex.price} {ex.get_price_type_display()}"
            )
 
    # ── SLOT AVAILABILITY ─────────────────────────────────────────────────────
    if target_date:
        lines.append(f"--- SLOTS FOR DATE: {target_date} ---")
        any_slots = False
 
        for ws in workspaces:
            slots = WorkspaceSlot.objects.filter(workspace=ws, date=target_date)
            if slots.exists():
                any_slots = True
                for s in slots:
                    rem = max(0, (s.capacity or 0) - (s.booked_count or 0))
                    if s.slot_type == "hour":
                        label = f"{s.start_time}:00-{s.end_time}:00"
                    else:
                        label = "Full Day"
                    status = "FULL - no seats available" if rem == 0 else f"{rem} seats available"
                    lines.append(
                        f"SLOT|{ws.name}|{ws.city}|{label}|₹{s.price}|{status}"
                    )
 
        if not any_slots:
            lines.append(
                f"No slots have been configured by workspace owners for {target_date}. "
                f"The workspace owner needs to add slots via their dashboard."
            )
 
        # Monthly fixed seats for that month
        try:
            y, mo_num = int(target_date[:4]), int(target_date[5:7])
            for ms in MonthlySlot.objects.filter(month=mo_num, year=y):
                rem = max(0, (ms.capacity or 0) - (ms.booked or 0))
                status = "FULL" if rem == 0 else f"{rem} fixed seats available"
                lines.append(
                    f"MONTHLY_SLOT|{ms.workspace.name}|{mo_num}/{y}|₹{ms.price}/month|{status}"
                )
        except Exception:
            pass
 
    else:
        # No date in message — show today's slot summary
        lines.append(f"--- TODAY'S SLOTS ({today}) ---")
        found_any = False
        for ws in workspaces:
            slots = WorkspaceSlot.objects.filter(workspace=ws, date=today)
            if slots.exists():
                found_any = True
                parts = []
                for s in slots:
                    rem = max(0, (s.capacity or 0) - (s.booked_count or 0))
                    lbl = "FullDay" if s.slot_type == "day" else f"{s.start_time}:00"
                    parts.append(f"{lbl}:{'FULL' if rem == 0 else str(rem) + 'left'}")
                lines.append(f"  {ws.name} ({ws.city}): {' | '.join(parts)}")
        if not found_any:
            lines.append("  No slots configured for today yet.")
 
    # ── WORKSPACE CATEGORIES ──────────────────────────────────────────────────
    cats = WorkspaceCategory.objects.filter(is_available=True)
    if cats.exists():
        lines.append("--- WORKSPACE CATEGORIES ---")
        for c in cats:
            lines.append(
                f"CAT|{c.name}|{c.get_category_display()}"
                f"|hourly:₹{c.hourly_price}|daily:₹{c.daily_price}|monthly:₹{c.monthly_price}"
                f"|{(c.description or '')[:60]}"
            )
 
    # ── SPECIAL OFFERS ────────────────────────────────────────────────────────
    offers = OfferWorkspace.objects.filter(is_approved=True)
    if offers.exists():
        lines.append(f"--- SPECIAL OFFERS ({offers.count()}) ---")
        for o in offers:
            save = int(o.original_price) - int(o.offer_price)
            amen = ", ".join(o.amenities) if o.amenities else "standard"
            lines.append(
                f"OFFER|{o.building}|{o.area}|{o.type}|{o.seats} seats|floor:{o.floor}"
                f"|was:₹{o.original_price} now:₹{o.offer_price} save:₹{save}"
                f"|amenities:[{amen}]"
            )
 
    # ── REVIEWS ───────────────────────────────────────────────────────────────
    if has_reviews:
        total_reviews = Review.objects.count()
        if total_reviews:
            sample = list(Review.objects.select_related("user")[:5])
            avg = sum(r.rating for r in sample) / len(sample)
            lines.append(f"REVIEWS: total={total_reviews}, avg={avg:.1f}/5")
            for r in sample:
                name = (r.user.first_name or r.user.username)[:15]
                comment = (r.comment or "")[:70].replace("\n", " ")
                lines.append(f"  REV|{name}|{r.rating}/5|{comment}")
 
    # ── STATIC POLICIES ───────────────────────────────────────────────────────
    lines += [
        "--- POLICIES ---",
        "BOOKING: Go to website → browse workspaces → select slot → pay via Razorpay",
        "PAYMENT: UPI, credit/debit cards, net banking, digital wallets (Razorpay)",
        "CANCELLATION: NO cancellation and NO refund available under any circumstance",
        "MY_ORDERS: View all bookings in account dashboard under My Orders",
        "SUPPORT: Monday to Saturday, 9 AM to 7 PM IST",
        "ENTERPRISE: Fill the Enterprise contact form on website for bulk/dedicated seating",
        "SIGNUP: Requires OTP email verification",
        "REVIEWS: Can be submitted from My Orders after your visit",
    ]
 
    return "\n".join(lines)
 
 
# ─────────────────────────────────────────────────────────────────────────────
# SYSTEM PROMPT
# ─────────────────────────────────────────────────────────────────────────────
 
SYSTEM_PROMPT = """You are a friendly, helpful AI assistant for a CoWorking Space booking platform.
 
You have LIVE real-time data from the database injected below. Use ONLY this data to answer.
 
How to read the data:
- WS|id|Name|City|Location|Price|Amenities|Description → workspace details
- SLOT|WorkspaceName|City|TimeRange|Price|Status → slot availability (X seats available / FULL)
- MONTHLY_SLOT|Name|Month/Year|Price|Status → monthly fixed seat availability
- CAT|Name|Type|hourly|daily|monthly → workspace category pricing
- OFFER|Building|Area|Type|Seats|Floor|Pricing|Amenities → special deals
- REV|Name|Rating|Comment → customer review
 
Rules:
1. For availability questions: read SLOT lines carefully, state which are available with seats + price
2. If no slots exist for a date: say the workspace owner hasn't added slots yet for that date
3. CANCELLATION: clearly say NO cancellation and NO refund available
4. Keep replies warm, conversational, 2-4 sentences. Use bullet points for 3+ items
5. Always show prices in ₹ (Indian Rupees)
6. Never mention Groq, LLaMA, AI model names, FAISS, or any technical internals
7. For off-topic questions, politely redirect to coworking space topics
8. If info isn't in the data, say: "Please check our website or contact support (Mon–Sat, 9 AM–7 PM IST)"
"""
 
 
# ─────────────────────────────────────────────────────────────────────────────
# MAIN CHAT ENDPOINT   POST /api/chatbot/
# Body: { "message": "...", "history": [...] }
# ─────────────────────────────────────────────────────────────────────────────
 
@api_view(["POST"])
@permission_classes([AllowAny])
def chatbot(request):
    try:
        message = (request.data.get("message") or "").strip()
        history = request.data.get("history") or []
 
        if not message:
            return Response({"error": "message is required"}, status=400)
 
        # Auto-detect date from message
        target_date = _extract_date(message)
 
        # Build live context from DB
        context = _build_context(target_date=target_date)
 
        # Build message list for Groq
        groq_messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT + f"\n\nLIVE DATABASE CONTEXT:\n{context}"
            }
        ]
 
        # Add last 8 turns of conversation history
        for turn in history[-8:]:
            role = turn.get("role", "")
            content = (turn.get("content") or "").strip()
            if role in ("user", "assistant") and content:
                groq_messages.append({"role": role, "content": content})
 
        # Add new user message
        groq_messages.append({"role": "user", "content": message})
 
        # Call Groq
        client = _get_client()
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=groq_messages,
            temperature=0.6,
            max_tokens=512,
        )
 
        reply = completion.choices[0].message.content.strip()
        return Response({"reply": reply})
 
    except Exception as e:
        err = str(e)
        print(f"[CHATBOT ERROR] {type(e).__name__}: {err}")
 
        # Groq rate limit (free tier: 30 RPM)
        if "429" in err or "rate_limit" in err.lower() or "rate limit" in err.lower():
            return Response({
                "reply": (
                    "I'm getting too many requests right now! 😅 "
                    "Please wait a moment and try again. "
                    "For urgent help, reach our support team Mon–Sat, 9 AM–7 PM IST."
                )
            })
 
        return Response({"error": err}, status=500)
 
 
# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC DATA ENDPOINT   GET /api/chatbot/data/?date=YYYY-MM-DD
# ─────────────────────────────────────────────────────────────────────────────
 
@api_view(["GET"])
@permission_classes([AllowAny])
def chatbot_data(request):
    """Returns live workspace + slot data. No auth required."""
    from workspaces.models import (
        Workspace, WorkspaceCategory, OfferWorkspace, WorkspaceSlot
    )
 
    target_date = request.GET.get("date", str(timezone.now().date()))
 
    workspaces = Workspace.objects.filter(
        is_approved=True, isavailable=True
    ).prefetch_related("amenities")
 
    ws_list = []
    for ws in workspaces:
        slots = WorkspaceSlot.objects.filter(workspace=ws, date=target_date)
        ws_list.append({
            "id": ws.id,
            "name": ws.name,
            "city": ws.city,
            "location": ws.location,
            "price": ws.price,
            "amenities": [a.name for a in ws.amenities.all()],
            "slots": [{
                "type": s.slot_type,
                "start": s.start_time,
                "end": s.end_time,
                "price": s.price,
                "capacity": s.capacity,
                "booked": s.booked_count,
                "remaining": max(0, (s.capacity or 0) - (s.booked_count or 0)),
                "is_full": (s.booked_count or 0) >= (s.capacity or 0),
            } for s in slots],
        })
 
    return Response({
        "date": target_date,
        "workspaces": ws_list,
        "categories": list(
            WorkspaceCategory.objects.filter(is_available=True).values(
                "name", "category", "hourly_price", "daily_price", "monthly_price"
            )
        ),
        "offers": list(
            OfferWorkspace.objects.filter(is_approved=True).values(
                "building", "area", "type", "original_price", "offer_price", "seats"
            )
        ),
        "cities": list(
            Workspace.objects
            .filter(is_approved=True, isavailable=True)
            .values_list("city", flat=True)
            .distinct()
        ),
    })