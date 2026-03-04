from django.db.models import Count
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Ticket
from .serializers import (
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
        # Phase 3 will hook AI analysis here
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
        agent_response = request.data.get('agent_response', '').strip()
        if not agent_response:
            return Response(
                {'agent_response': ['This field is required.']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ticket.agent_response = agent_response
        ticket.status = 'resolved'
        ticket.save()
        return Response(TicketDetailSerializer(ticket).data)

    @action(detail=True, methods=['post'], url_path='in-progress')
    def mark_in_progress(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = 'in_progress'
        ticket.save()
        return Response(TicketDetailSerializer(ticket).data)
