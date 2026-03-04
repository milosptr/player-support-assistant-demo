from django.db import models


class Ticket(models.Model):
    CATEGORY_CHOICES = [
        ('bug', 'Bug Report'),
        ('billing', 'Billing Issue'),
        ('gameplay', 'Gameplay Question'),
        ('abuse', 'Abuse Report'),
        ('feedback', 'Feedback'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]

    player_name = models.CharField(max_length=100)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    ai_category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, blank=True)
    ai_response = models.TextField(blank=True)
    agent_response = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.id}] {self.subject}'
