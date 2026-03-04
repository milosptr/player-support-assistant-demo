from django.core.management.base import BaseCommand

from tickets.models import Ticket

TICKETS = [
    {
        'player_name': 'xVoidHunter',
        'subject': 'Ship stuck in warp tunnel after gate jump',
        'message': (
            'I jumped through the Tama gate and my Loki has been stuck in the warp tunnel for 20 minutes. '
            'I can\'t emergency warp, dock, or do anything. Other players in system say they can see my '
            'ship on grid but I\'m stuck in the loading tunnel. Please help, I\'m in lowsec and going '
            'to lose this ship.'
        ),
        'category': 'bug',
        'status': 'open',
        'ai_category': 'bug',
        'ai_response': (
            'I understand how stressful it must be to have your Loki stuck in a warp tunnel, especially '
            'in lowsec. I\'ve logged this as a priority bug with our QA team. As a workaround, try '
            'closing your client completely and reconnecting — your ship should be at the gate on login.'
        ),
        'agent_response': '',
    },
    {
        'player_name': 'AmarrPilot42',
        'subject': 'Market order disappeared after downtime',
        'message': (
            'I had a sell order for 500 units of Tritanium at Jita 4-4 before downtime today. After '
            'the server came back up, the order is gone but the items aren\'t back in my hangar either. '
            'That\'s about 2 billion ISK worth of goods just vanished.'
        ),
        'category': 'bug',
        'status': 'in_progress',
        'ai_category': 'bug',
        'ai_response': (
            'I\'m sorry to hear about your missing market order. This sounds like it could be related '
            'to the downtime transition. I\'ve escalated this to our database team for investigation. '
            'Please provide your character name and the exact order details so we can trace the transaction.'
        ),
        'agent_response': '',
    },
    {
        'player_name': 'WormholeDiver',
        'subject': 'Scanning probes not returning results in J-space',
        'message': (
            'For the past two days, my core scanner probes aren\'t finding any signatures in wormhole '
            'space. I\'ve checked my skills and fittings — everything is the same as before. My corp '
            'mates in the same system can see signatures fine. Something is broken on my end.'
        ),
        'category': 'bug',
        'status': 'open',
        'ai_category': 'bug',
        'ai_response': (
            'That\'s definitely unusual behavior for your scanning probes. This could be a client-side '
            'cache issue. Try clearing your shared cache from the launcher settings and verifying your '
            'game files. If the problem persists, I\'ve logged this for our QA team to investigate.'
        ),
        'agent_response': '',
    },
    {
        'player_name': 'NullsecNomad',
        'subject': 'Charged twice for monthly PLEX subscription',
        'message': (
            'I was charged twice on my credit card for this month\'s Omega subscription. I can see '
            'two identical charges of $14.99 on my bank statement from yesterday. I only have one '
            'account. Please refund the duplicate charge.'
        ),
        'category': 'billing',
        'status': 'open',
        'ai_category': 'billing',
        'ai_response': (
            'I sincerely apologize for the duplicate charge on your account. I\'ve escalated this '
            'to our billing team as a priority case. They will review the transaction records and '
            'process a refund for the duplicate charge within 3-5 business days.'
        ),
        'agent_response': '',
    },
    {
        'player_name': 'HighsecHauler',
        'subject': 'Subscription renewal failed but account locked',
        'message': (
            'My subscription failed to renew because my card expired, which is fine. But now my '
            'account is completely locked — I can\'t even log in to update my payment method. The '
            'website just gives me an error. I\'ve been a subscriber for 6 years.'
        ),
        'category': 'billing',
        'status': 'in_progress',
        'ai_category': 'billing',
        'ai_response': (
            'I understand how frustrating it must be to lose access to your account after 6 years. '
            'I\'ve flagged your account for our billing team to unlock it so you can update your '
            'payment method. You should receive an email with instructions within 24 hours.'
        ),
        'agent_response': '',
    },
    {
        'player_name': 'AlphaExplorer',
        'subject': 'How do planetary interaction extractors work?',
        'message': (
            'I just trained into PI and I\'m completely lost. I set up an extractor on a barren '
            'planet but it\'s not producing anything. Do I need a launchpad too? What\'s the '
            'correct setup order? Any help would be appreciated, the tutorials are confusing.'
        ),
        'category': 'gameplay',
        'status': 'open',
        'ai_category': 'gameplay',
        'ai_response': (
            'Welcome to Planetary Interaction! Yes, you need a Command Center first, then link it '
            'to an Extractor Control Unit and a Launchpad. The extractor needs to have its program '
            'started by selecting a resource and setting the extraction area. I\'d recommend checking '
            'the Agency panel for a step-by-step PI tutorial.'
        ),
        'agent_response': '',
    },
    {
        'player_name': 'FleetCommander7',
        'subject': 'Fleet warp mechanics confusion — who gets warped?',
        'message': (
            'During a fleet op yesterday, I tried to fleet warp my wing but only half the pilots '
            'actually warped. Some said they were "in warp" already. Does fleet warp not work if '
            'someone is already aligning? What are the exact conditions for fleet warp to grab someone?'
        ),
        'category': 'gameplay',
        'status': 'resolved',
        'ai_category': 'gameplay',
        'ai_response': (
            'Fleet warp only affects pilots who are not already in warp, tethered, or docked. Pilots '
            'who are aligning will be grabbed by fleet warp. The key condition is that the pilot must '
            'be in space and not currently in a warp tunnel. Check your fleet hierarchy too — wing '
            'warp only affects your wing, not the whole fleet.'
        ),
        'agent_response': (
            'Fleet warp grabs anyone in your wing who is in space, not docked, not tethered, and not '
            'already mid-warp. If pilots are aligning, they will be pulled into fleet warp. Make sure '
            'all pilots are actually in your wing (not just fleet) since wing warp only affects wing '
            'members. Also, pilots with "exempt from fleet warp" checked in their fleet settings will '
            'be excluded.'
        ),
    },
    {
        'player_name': 'MiningDrone',
        'subject': 'Best ore to mine in highsec for ISK right now?',
        'message': (
            'I\'m a returning player and ore prices seem completely different from when I left. '
            'What\'s the best ore to mine in highsec for profit? Is Veldspar still trash? Should '
            'I be doing ice mining instead? I have a Retriever with T2 strips.'
        ),
        'category': 'gameplay',
        'status': 'open',
        'ai_category': 'gameplay',
        'ai_response': (
            'Welcome back! Ore prices have shifted quite a bit. For highsec mining, Scordite and '
            'Pyroxeres tend to give the best ISK/hour currently. Ice mining in Retriever can also '
            'be profitable if you find quiet systems. Check the in-game market for current mineral '
            'prices and consider using a mining calculator to optimize your yield.'
        ),
        'agent_response': '',
    },
    {
        'player_name': 'GateKamper69',
        'subject': 'Player harassing me in local chat for 3 days',
        'message': (
            'A player named "Xx_Destroyer_xX" has been following me system to system and spamming '
            'slurs and threats in local chat for 3 days straight. I\'ve blocked them but they keep '
            'creating new alpha accounts. I have screenshots of everything. This is making the game '
            'unplayable for me.'
        ),
        'category': 'abuse',
        'status': 'in_progress',
        'ai_category': 'abuse',
        'ai_response': (
            'I take harassment very seriously and I\'m sorry you\'re dealing with this. I\'ve '
            'escalated this to our player conduct team for immediate investigation. Please submit '
            'your screenshots through the in-game bug report tool so we have a direct evidence chain. '
            'The conduct team will review and take appropriate action.'
        ),
        'agent_response': '',
    },
    {
        'player_name': 'CorpDirector',
        'subject': 'Corp theft — member stole everything from hangars',
        'message': (
            'A member we recruited last week just cleaned out our corporation hangars and left. '
            'They took about 15 billion ISK worth of ships and modules. We had hangar access set '
            'too loosely. Is there anything you can do? Is corp theft against the rules?'
        ),
        'category': 'abuse',
        'status': 'resolved',
        'ai_category': 'abuse',
        'ai_response': (
            'I understand this is a frustrating situation. Corporation theft, while upsetting, is '
            'considered a legitimate gameplay mechanic and is not against our rules. I\'d recommend '
            'reviewing your corporation\'s hangar access settings and role management to prevent '
            'future incidents.'
        ),
        'agent_response': (
            'Unfortunately, corporation theft is part of the sandbox gameplay and is not a violation '
            'of our rules. The game is designed to allow these types of player interactions. However, '
            'I strongly recommend reviewing your corp roles — use the "Hangar Access" tab in corp '
            'management to set division-specific permissions, and limit new members to a probationary '
            'division. I\'m sorry we can\'t recover the assets, but I hope this helps prevent it in '
            'the future.'
        ),
    },
    {
        'player_name': 'NebulaCrafter',
        'subject': 'Love the new wormhole nebula effects!',
        'message': (
            'Just wanted to say the new wormhole space visual effects are absolutely stunning. '
            'The nebula colors when you\'re inside a C3 are breathtaking. Your art team knocked '
            'it out of the park. More of this please!'
        ),
        'category': 'feedback',
        'status': 'resolved',
        'ai_category': 'feedback',
        'ai_response': (
            'Thank you so much for the kind words! I\'ll make sure to pass this along to our art '
            'team — they\'ll be thrilled to hear players are enjoying the new wormhole visuals. '
            'Feedback like this really motivates the team to keep pushing the visual experience.'
        ),
        'agent_response': (
            'Thanks for the awesome feedback! I\'ve forwarded your kind words to our art and '
            'graphics team — they put a lot of work into the wormhole nebula overhaul and it\'s '
            'great to hear players are noticing. Fly safe out there in J-space!'
        ),
    },
    {
        'player_name': 'IndustryTycoon',
        'subject': 'Suggestion: corp hangar sorting and search',
        'message': (
            'Corp hangars desperately need a search function and better sorting options. When you '
            'have thousands of items across 7 divisions, finding anything is a nightmare. Even just '
            'a text filter would save hours. Please consider this for a future update.'
        ),
        'category': 'feedback',
        'status': 'open',
        'ai_category': 'feedback',
        'ai_response': (
            'That\'s an excellent suggestion! Corp hangar organization is a common pain point we '
            'hear about. I\'ve added your feedback to our feature request tracker for the inventory '
            'team to review. Quality of life improvements like this are always on our radar.'
        ),
        'agent_response': '',
    },
]


class Command(BaseCommand):
    help = 'Seed the database with sample support tickets'

    def handle(self, *args, **options):
        Ticket.objects.all().delete()
        self.stdout.write('Cleared existing tickets.')

        for data in TICKETS:
            Ticket.objects.create(**data)
            self.stdout.write(f'  Created: {data["subject"][:50]}')

        self.stdout.write(self.style.SUCCESS(f'Seeded {len(TICKETS)} tickets.'))
