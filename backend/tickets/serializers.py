from rest_framework import serializers

from .models import Ticket


class TicketListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'player_name', 'subject', 'category', 'status', 'created_at']


class TicketDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            'id', 'player_name', 'subject', 'message',
            'category', 'status', 'ai_category', 'ai_response',
            'agent_response', 'resolved_at', 'created_at', 'updated_at',
        ]


class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['player_name', 'subject', 'message']
