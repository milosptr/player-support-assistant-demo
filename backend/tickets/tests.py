from io import StringIO

from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Ticket


class TicketModelTest(TestCase):
    def test_create_ticket_defaults(self):
        ticket = Ticket.objects.create(
            player_name='TestPilot',
            subject='Test subject',
            message='Test message body',
        )
        self.assertEqual(ticket.status, 'open')
        self.assertEqual(ticket.category, '')
        self.assertEqual(ticket.ai_category, '')
        self.assertEqual(ticket.ai_response, '')
        self.assertEqual(ticket.agent_response, '')
        self.assertIsNotNone(ticket.created_at)
        self.assertIsNotNone(ticket.updated_at)

    def test_str(self):
        ticket = Ticket.objects.create(
            player_name='TestPilot',
            subject='My test ticket',
            message='Body',
        )
        self.assertEqual(str(ticket), f'[{ticket.id}] My test ticket')


class TicketAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.ticket = Ticket.objects.create(
            player_name='TestPilot',
            subject='Test ticket',
            message='Something broke',
            category='bug',
            status='open',
        )

    def test_list_tickets(self):
        response = self.client.get('/api/tickets/', format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertIn('player_name', response.data[0])
        self.assertNotIn('message', response.data[0])

    def test_create_ticket(self):
        response = self.client.post('/api/tickets/', {
            'player_name': 'NewPlayer',
            'subject': 'Help needed',
            'message': 'I need assistance with something',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['player_name'], 'NewPlayer')
        self.assertEqual(response.data['status'], 'open')
        self.assertIn('message', response.data)

    def test_retrieve_ticket(self):
        response = self.client.get(f'/api/tickets/{self.ticket.id}/', format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['subject'], 'Test ticket')
        self.assertIn('message', response.data)
        self.assertIn('ai_response', response.data)

    def test_stats(self):
        response = self.client.get('/api/tickets/stats/', format='json')
        self.assertEqual(response.status_code, 200)
        data = response.data
        self.assertEqual(data['total'], 1)
        self.assertEqual(data['open'], 1)
        self.assertEqual(data['in_progress'], 0)
        self.assertEqual(data['resolved'], 0)
        self.assertIn('by_category', data)
        for cat in ['bug', 'billing', 'gameplay', 'abuse', 'feedback']:
            self.assertIn(cat, data['by_category'])

    def test_resolve_ticket(self):
        response = self.client.post(
            f'/api/tickets/{self.ticket.id}/resolve/',
            {'agent_response': 'This has been fixed.'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'resolved')
        self.assertEqual(response.data['agent_response'], 'This has been fixed.')

    def test_resolve_ticket_missing_response(self):
        response = self.client.post(
            f'/api/tickets/{self.ticket.id}/resolve/',
            {},
            format='json',
        )
        self.assertEqual(response.status_code, 400)

    def test_mark_in_progress(self):
        response = self.client.post(
            f'/api/tickets/{self.ticket.id}/in-progress/',
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'in_progress')

    def test_filter_by_status(self):
        Ticket.objects.create(
            player_name='Other', subject='Resolved', message='Done',
            status='resolved',
        )
        response = self.client.get('/api/tickets/?status=open', format='json')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['status'], 'open')

    def test_filter_by_category(self):
        Ticket.objects.create(
            player_name='Other', subject='Billing', message='Help',
            category='billing',
        )
        response = self.client.get('/api/tickets/?category=billing', format='json')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['category'], 'billing')


class SeedCommandTest(TestCase):
    def test_seed_creates_tickets(self):
        call_command('seed_tickets', stdout=StringIO())
        self.assertEqual(Ticket.objects.count(), 12)

    def test_seed_is_idempotent(self):
        call_command('seed_tickets', stdout=StringIO())
        call_command('seed_tickets', stdout=StringIO())
        self.assertEqual(Ticket.objects.count(), 12)
