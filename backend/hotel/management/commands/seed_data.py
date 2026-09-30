"""python manage.py seed_data  -> demo admin, user, rooms, gallery, blog (placeholder images generated)."""
import io, random
from datetime import date, timedelta
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from PIL import Image, ImageDraw

from accounts.models import User
from hotel.models import Room, Booking, GalleryImage, ContactMessage, BlogPost, Subscriber, Review

PALETTES = [((255, 61, 0), (30, 20, 60)), ((0, 120, 255), (10, 20, 50)), ((255, 170, 0), (60, 20, 20)),
            ((0, 190, 160), (10, 30, 40)), ((170, 80, 255), (25, 15, 50)), ((255, 90, 120), (40, 15, 35))]


def make_image(text, i, size=(1200, 800)):
    """Night skyline + water placeholder (real photos admin panel se upload karein)."""
    W, H = size
    warm, dark = PALETTES[i % len(PALETTES)]
    rnd = random.Random(i)
    img = Image.new('RGB', size)
    d = ImageDraw.Draw(img)
    horizon = int(H * 0.62)
    for y in range(horizon):
        t = (y / horizon) ** 1.6
        d.line([(0, y), (W, y)], fill=tuple(int(dark[k] * (1 - t) + warm[k] * t * 0.85) for k in range(3)))
    x = -20
    while x < W:
        w, h = rnd.randint(50, 110), rnd.randint(120, 400)
        d.rectangle([x, horizon - h, x + w, horizon], fill=(12, 16, 32))
        for wy in range(horizon - h + 14, horizon - 8, 22):
            for wx in range(x + 8, x + w - 10, 18):
                if rnd.random() < 0.45:
                    d.rectangle([wx, wy, wx + 7, wy + 11], fill=(255, 214, 140))
        x += w + rnd.randint(0, 8)
    for y in range(horizon, H):
        t = (y - horizon) / (H - horizon)
        d.line([(0, y), (W, y)], fill=(int(24 - 16 * t), int(100 - 62 * t), int(160 - 90 * t)))
    for _ in range(60):
        lx, ly = rnd.randint(0, W), rnd.randint(horizon + 6, H)
        d.line([(lx, ly), (lx + rnd.randint(20, 90), ly)], fill=(255, 214, 140), width=2)
    buf = io.BytesIO()
    img.save(buf, 'JPEG', quality=86)
    return ContentFile(buf.getvalue(), name=f'{text.lower().replace(" ", "_")}.jpg')


class Command(BaseCommand):
    def handle(self, *a, **kw):
        random.seed(1)
        admin, _ = User.objects.get_or_create(email='admin@keto.com', defaults={'name': 'Admin', 'is_staff': True, 'is_superuser': True})
        admin.set_password('Admin@123'); admin.save()
        user, _ = User.objects.get_or_create(email='user@gmail.com', defaults={'name': 'user', 'phone': '029384764783'})
        user.set_password('User@123'); user.save()

        if not Room.objects.exists():
            rooms = [
                ('Regular Room', 'Comfortable room with city view, work desk and fast WiFi. Perfect for solo travellers and couples.', 100, 'regular', 2, 'AC, TV, Work Desk'),
                ('Premium Room', 'Spacious king bed room with a lounge chair, large windows and complimentary breakfast.', 200, 'premium', 3, 'AC, TV, Breakfast, Mini Bar'),
                ('Deluxe Suite', 'Luxury suite with separate living area, panoramic skyline view and private pool access.', 300, 'deluxe', 4, 'AC, TV, Breakfast, Pool Access, Bathtub'),
                ('Family Room', 'Two large beds and extra space for the whole family.', 180, 'premium', 5, 'AC, TV, Breakfast'),
                ('Executive Room', 'Business friendly room with lounge access and city skyline.', 250, 'deluxe', 2, 'AC, TV, Lounge Access'),
                ('Budget Room', 'Clean, simple and affordable stay.', 70, 'regular', 2, 'AC, TV'),
            ]
            for i, (t, d, p, ty, cap, am) in enumerate(rooms):
                r = Room(title=t, description=d, price=p, room_type=ty, capacity=cap, amenities=am)
                r.image.save(f'room{i}.jpg', make_image(t, i), save=True)
            for i, name in enumerate(['Pool Night', 'Skyline Suite', 'Lobby', 'Rooftop Lounge', 'Spa', 'Restaurant', 'Garden', 'Bedroom']):
                g = GalleryImage(caption=name)
                g.image.save(f'g{i}.jpg', make_image(name, i + 2), save=True)
            for i, t in enumerate(['Top 5 reasons to stay with us', 'Best time to visit the city', 'Our new rooftop pool is open']):
                b = BlogPost(title=t, excerpt='A short read for our guests and travellers.',
                             content='Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' * 12)
                b.image.save(f'b{i}.jpg', make_image(t[:22], i + 1), save=True)

        if not Booking.objects.exists():
            r = Room.objects.all()
            today = date.today()
            Booking.objects.create(room=r[1], user=user, name='user', email=user.email, phone='029384764783',
                                   start_date=today + timedelta(days=5), end_date=today + timedelta(days=9),
                                   status='waiting', total_price=r[1].price * 4)
            Booking.objects.create(room=r[2], user=user, name='test', email='test@gmail.com', phone='1234567',
                                   start_date=today + timedelta(days=12), end_date=today + timedelta(days=15),
                                   status='approved', total_price=r[2].price * 3)
            Review.objects.get_or_create(room=r[1], user=user, defaults={'rating': 5, 'comment': 'Bohat acha room tha!'})
        if not ContactMessage.objects.exists():
            for n, m in [('yami', 'hello from me'), ('john', 'hi from usa'), ('alex', 'hi i am a Message')]:
                ContactMessage.objects.create(name=n, email=f'{n}@gmail.com', phone='784512', message=m)
        Subscriber.objects.get_or_create(email='news@gmail.com')
        self.stdout.write(self.style.SUCCESS('Seed done. admin@keto.com / Admin@123  |  user@gmail.com / User@123'))
