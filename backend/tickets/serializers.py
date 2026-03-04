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


class ChatMessageSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=['user', 'assistant'])
    content = serializers.CharField()


class ChatRequestSerializer(serializers.Serializer):
    messages = ChatMessageSerializer(many=True)
    current_ticket_id = serializers.UUIDField(required=False, allow_null=True)

    def validate_messages(self, value):
        if not value:
            raise serializers.ValidationError("At least one message is required.")
        if len(value) > 50:
            raise serializers.ValidationError("Too many messages (max 50).")
        return value
