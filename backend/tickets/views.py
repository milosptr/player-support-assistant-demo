from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .ai_service import analyze_ticket
from .chat_service import run_chat
from .models import Ticket
from .serializers import (
    ChatRequestSerializer,
    TicketCreateSerializer,
    TicketDetailSerializer,
    TicketListSerializer,
)


class TicketViewSet(viewsets.ModelViewSet):

    def get_queryset(self):
        qs = Ticket.objects.all()
        status_filter = self.request.query_params.get('status')
        category_filter = self.request.query_params.get('category')
        if status_filter:
            qs = qs.filter(status=status_filter)
        if category_filter:
            qs = qs.filter(category=category_filter)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(player_name__icontains=search) | Q(subject__icontains=search))
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return TicketListSerializer
        if self.action == 'create':
            return TicketCreateSerializer
        return TicketDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save()
        result = analyze_ticket(ticket.subject, ticket.message)
        if result:
            ticket.ai_category = result["category"]
            ticket.ai_response = result["response"]
            ticket.category = result["category"]
            ticket.save(update_fields=["ai_category", "ai_response", "category"])
        detail = TicketDetailSerializer(ticket)
        return Response(detail.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        tickets = Ticket.objects.all()
        total = tickets.count()
        open_count = tickets.filter(status='open').count()
        in_progress = tickets.filter(status='in_progress').count()
        resolved = tickets.filter(status='resolved').count()

        category_counts = dict(
            tickets.values_list('category').annotate(count=Count('id'))
        )
        by_category = {
            cat: category_counts.get(cat, 0)
            for cat, _ in Ticket.CATEGORY_CHOICES
        }

        return Response({
            'total': total,
            'open': open_count,
            'in_progress': in_progress,
            'resolved': resolved,
            'by_category': by_category,
        })

    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve(self, request, pk=None):
        ticket = self.get_object()
        if ticket.status == 'resolved':
            return Response(
                {'detail': 'Ticket is already resolved.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        agent_response = request.data.get('agent_response', '').strip()
        if not agent_response:
            return Response(
                {'agent_response': ['This field is required.']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ticket.agent_response = agent_response
        ticket.status = 'resolved'
        ticket.resolved_at = timezone.now()
        ticket.save()
        return Response(TicketDetailSerializer(ticket).data)

    @action(detail=True, methods=['post'], url_path='regenerate')
    def regenerate(self, request, pk=None):
        ticket = self.get_object()
        if ticket.status == 'resolved':
            return Response(
                {'detail': 'Cannot regenerate for a resolved ticket.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        result = analyze_ticket(ticket.subject, ticket.message)
        if not result:
            return Response(
                {'detail': 'AI service unavailable.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        ticket.ai_response = result["response"]
        ticket.save(update_fields=["ai_response"])
        return Response(TicketDetailSerializer(ticket).data)

    @action(detail=False, methods=['post'], url_path='chat')
    def chat(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        messages = serializer.validated_data['messages']
        current_ticket_id = serializer.validated_data.get('current_ticket_id')
        conversation_history = serializer.validated_data.get('conversation_history')
        result = run_chat(
            [{"role": m["role"], "content": m["content"]} for m in messages],
            current_ticket_id=str(current_ticket_id) if current_ticket_id else None,
            conversation_history=conversation_history,
        )
        return Response(result)

    @action(detail=True, methods=['post'], url_path='in-progress')
    def mark_in_progress(self, request, pk=None):
        ticket = self.get_object()
        if ticket.status == 'resolved':
            return Response(
                {'detail': 'Cannot reopen a resolved ticket.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ticket.status = 'in_progress'
        ticket.save()
        return Response(TicketDetailSerializer(ticket).data)
