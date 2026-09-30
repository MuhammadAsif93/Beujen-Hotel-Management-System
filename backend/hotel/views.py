from datetime import date, timedelta
from django.core.mail import EmailMultiAlternatives, send_mail
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth
from django.utils.html import escape
from rest_framework import viewsets, permissions, status, mixins
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from .models import Room, Booking, GalleryImage, ContactMessage, Subscriber, BlogPost, Review
from .permissions import IsAdminOrReadOnly
from .serializers import (RoomSerializer, BookingSerializer, GalleryImageSerializer, ContactMessageSerializer,
                          SendMailSerializer, SubscriberSerializer, BlogPostSerializer, ReviewSerializer)

PARSERS = [JSONParser, MultiPartParser, FormParser]


class RoomViewSet(viewsets.ModelViewSet):
    """Public: list/detail. Admin: create/update/delete.
    Filters: ?room_type= &min_price= &max_price= &guests= &wifi=true &start=YYYY-MM-DD&end=YYYY-MM-DD &search="""
    serializer_class = RoomSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = PARSERS

    def get_queryset(self):
        qs = Room.objects.all()
        u = self.request.user
        if not (u and u.is_staff):
            qs = qs.filter(is_active=True)
        p = self.request.query_params
        if p.get('room_type'):
            qs = qs.filter(room_type=p['room_type'])
        if p.get('min_price'):
            qs = qs.filter(price__gte=p['min_price'])
        if p.get('max_price'):
            qs = qs.filter(price__lte=p['max_price'])
        if p.get('guests'):
            qs = qs.filter(capacity__gte=p['guests'])
        if p.get('wifi') == 'true':
            qs = qs.filter(free_wifi=True)
        if p.get('search'):
            qs = qs.filter(Q(title__icontains=p['search']) | Q(description__icontains=p['search']))
        if p.get('start') and p.get('end'):
            busy = Booking.objects.filter(status__in=Booking.ACTIVE, start_date__lt=p['end'],
                                          end_date__gt=p['start']).values('room')
            qs = qs.exclude(id__in=busy)
        if p.get('ordering') in ('price', '-price', '-created_at'):
            qs = qs.order_by(p['ordering'])
        return qs

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def availability(self, request, pk=None):
        """Booked date ranges (frontend calendar me disable karne ke liye)."""
        rows = Booking.objects.filter(room_id=pk, status__in=Booking.ACTIVE, end_date__gte=date.today()) \
            .values('start_date', 'end_date', 'status')
        return Response(list(rows))

    @action(detail=True, methods=['get', 'post'], url_path='reviews',
            permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def reviews(self, request, pk=None):
        room = self.get_object()
        if request.method == 'GET':
            return Response(ReviewSerializer(room.reviews.all(), many=True).data)
        ser = ReviewSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        Review.objects.update_or_create(room=room, user=request.user, defaults=ser.validated_data)
        return Response({'detail': 'Review save ho gaya.'}, status=201)


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_permissions(self):
        if self.action in ('destroy', 'approve', 'reject'):
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        u = self.request.user
        qs = Booking.objects.select_related('room', 'user')
        if not u.is_staff:
            qs = qs.filter(user=u)
        s = self.request.query_params.get('status')
        return qs.filter(status=s) if s else qs

    def perform_create(self, serializer):
        b = serializer.save(user=self.request.user)
        send_mail('Booking received - Hilton Hotel',
                  f'Hi {b.name}, aapki booking #{b.pk} ({b.room.title}, {b.start_date} to {b.end_date}) '
                  f'receive ho gayi hai. Status: Waiting.', None, [b.email], fail_silently=True)

    def create(self, request, *a, **kw):
        resp = super().create(request, *a, **kw)
        resp.data['detail'] = 'Room Booked Successfully'
        return resp

    def _set_status(self, booking, new):
        if new == Booking.APPROVED:  # approve se pehle conflict check
            clash = Booking.objects.filter(room=booking.room, status=Booking.APPROVED,
                                           start_date__lt=booking.end_date, end_date__gt=booking.start_date
                                           ).exclude(pk=booking.pk).exists()
            if clash:
                raise ValidationError({'detail': 'In dates par room pehle se approved hai.'})
        booking.status = new
        booking.save(update_fields=['status'])
        send_mail(f'Booking {new.title()} - KETO Hotel',
                  f'Hi {booking.name}, aapki booking #{booking.pk} ({booking.room.title}) ab {new.upper()} hai.',
                  None, [booking.email], fail_silently=True)
        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        return self._set_status(self.get_object(), Booking.APPROVED)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        return self._set_status(self.get_object(), Booking.REJECTED)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        b = self.get_object()
        if b.status not in Booking.ACTIVE:
            raise ValidationError({'detail': 'Ye booking cancel nahi ho sakti.'})
        b.status = Booking.CANCELLED
        b.save(update_fields=['status'])
        return Response(self.get_serializer(b).data)


class GalleryViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = PARSERS


class BlogViewSet(viewsets.ModelViewSet):
    serializer_class = BlogPostSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = PARSERS
    lookup_field = 'slug'

    def get_queryset(self):
        qs = BlogPost.objects.all()
        return qs if self.request.user.is_staff else qs.filter(published=True)


class ContactViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin,
                     mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        return [permissions.AllowAny()] if self.action == 'create' else [permissions.IsAdminUser()]

    def create(self, request, *a, **kw):
        resp = super().create(request, *a, **kw)
        resp.data['detail'] = 'Shukriya! Aapka message mil gaya hai.'
        return resp

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        m = self.get_object()
        m.is_read = True
        m.save(update_fields=['is_read'])
        return Response({'detail': 'ok'})

    @action(detail=True, methods=['post'], url_path='send-mail')
    def send_mail_action(self, request, pk=None):
        """Admin reply: greeting, mail_body, action_text, action_url, end_line"""
        m = self.get_object()
        ser = SendMailSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data
        text = f"{d['greeting']}\n\n{d['mail_body']}\n"
        html = (f"<div style='font-family:Arial;max-width:560px;margin:auto'>"
                f"<h2 style='color:#ff3d00'>{escape(d['greeting'])}</h2>"
                f"<p>{escape(d['mail_body']).replace(chr(10), '<br>')}</p>")
        if d.get('action_text') and d.get('action_url'):
            text += f"\n{d['action_text']}: {d['action_url']}\n"
            html += (f"<p><a href='{escape(d['action_url'])}' style='background:#ff3d00;color:#fff;"
                     f"padding:10px 22px;border-radius:24px;text-decoration:none'>{escape(d['action_text'])}</a></p>")
        if d.get('end_line'):
            text += f"\n{d['end_line']}\n"
            html += f"<p style='color:#666'>{escape(d['end_line'])}</p>"
        html += '</div>'
        mail = EmailMultiAlternatives('Reply from KETO Hotel', text, None, [m.email])
        mail.attach_alternative(html, 'text/html')
        mail.send(fail_silently=False)
        m.replied = m.is_read = True
        m.save(update_fields=['replied', 'is_read'])
        return Response({'detail': f'Mail {m.email} ko bhej di gayi.'})


class NewsletterView(APIView):
    def post(self, request):
        ser = SubscriberSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        _, created = Subscriber.objects.get_or_create(email=ser.validated_data['email'].lower())
        return Response({'detail': 'Subscribe ho gaye!' if created else 'Aap pehle se subscribed hain.'},
                        status=201 if created else 200)


class SubscriberListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        return Response(SubscriberSerializer(Subscriber.objects.order_by('-created_at'), many=True).data)


class AdminStatsView(APIView):
    """Dashboard cards + charts data."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        bk = Booking.objects
        six_months_ago = date.today().replace(day=1) - timedelta(days=150)
        monthly = (bk.filter(created_at__date__gte=six_months_ago)
                   .annotate(m=TruncMonth('created_at')).values('m')
                   .annotate(bookings=Count('id'),
                             revenue=Sum('total_price', filter=Q(status=Booking.APPROVED)))
                   .order_by('m'))
        recent = BookingSerializer(bk.select_related('room')[:6], many=True, context={'request': request}).data
        return Response({
            'cards': {
                'total_rooms': Room.objects.count(),
                'total_bookings': bk.count(),
                'pending_bookings': bk.filter(status=Booking.WAITING).count(),
                'approved_bookings': bk.filter(status=Booking.APPROVED).count(),
                'revenue': bk.filter(status=Booking.APPROVED).aggregate(s=Sum('total_price'))['s'] or 0,
                'total_users': User.objects.filter(is_staff=False).count(),
                'unread_messages': ContactMessage.objects.filter(is_read=False).count(),
                'subscribers': Subscriber.objects.count(),
            },
            'status_breakdown': {s: bk.filter(status=s).count() for s, _ in Booking.STATUSES},
            'monthly': [{'month': r['m'].strftime('%b %Y'), 'bookings': r['bookings'],
                         'revenue': float(r['revenue'] or 0)} for r in monthly],
            'rooms_by_type': list(Room.objects.values('room_type').annotate(count=Count('id'))),
            'recent_bookings': recent,
        })
