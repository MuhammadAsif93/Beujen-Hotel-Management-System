from datetime import date
from django.db.models import Avg
from rest_framework import serializers
from .models import (Room, Booking, GalleryImage, ContactMessage, Subscriber, BlogPost, Review)


class RoomSerializer(serializers.ModelSerializer):
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    amenities_list = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = ['id', 'title', 'description', 'price', 'room_type', 'free_wifi', 'capacity',
                  'amenities', 'amenities_list', 'image', 'is_active', 'avg_rating', 'review_count', 'created_at']

    def get_avg_rating(self, obj):
        v = obj.reviews.aggregate(a=Avg('rating'))['a']
        return round(v, 1) if v else None

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_amenities_list(self, obj):
        return [a.strip() for a in obj.amenities.split(',') if a.strip()]


class BookingSerializer(serializers.ModelSerializer):
    room_title = serializers.CharField(source='room.title', read_only=True)
    room_type = serializers.CharField(source='room.room_type', read_only=True)
    room_image = serializers.SerializerMethodField()
    price = serializers.DecimalField(source='room.price', max_digits=10, decimal_places=2, read_only=True)
    nights = serializers.IntegerField(read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'room', 'room_title', 'room_type', 'room_image', 'price', 'user', 'name', 'email',
                  'phone', 'guests', 'start_date', 'end_date', 'nights', 'status', 'total_price', 'created_at']
        read_only_fields = ['id', 'user', 'status', 'total_price', 'created_at']

    def get_room_image(self, obj):
        if not obj.room.image:
            return None
        req = self.context.get('request')
        return req.build_absolute_uri(obj.room.image.url) if req else obj.room.image.url

    def validate(self, data):
        start, end, room = data['start_date'], data['end_date'], data['room']
        if start < date.today():
            raise serializers.ValidationError({'start_date': 'Start date guzri hui nahi ho sakti.'})
        if end <= start:
            raise serializers.ValidationError({'end_date': 'End date start date ke baad honi chahiye.'})
        if not room.is_active:
            raise serializers.ValidationError({'room': 'Ye room abhi available nahi hai.'})
        if data.get('guests', 1) > room.capacity:
            raise serializers.ValidationError({'guests': f'Is room me max {room.capacity} guests aa sakte hain.'})
        clash = Booking.objects.filter(room=room, status__in=Booking.ACTIVE,
                                       start_date__lt=end, end_date__gt=start).exists()
        if clash:
            raise serializers.ValidationError({'detail': 'Room is already booked please try different date'})
        return data

    def create(self, data):
        data['total_price'] = data['room'].price * (data['end_date'] - data['start_date']).days
        return super().create(data)


class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = ['id', 'image', 'caption', 'created_at']


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'phone', 'message', 'is_read', 'replied', 'created_at']
        read_only_fields = ['id', 'is_read', 'replied', 'created_at']


class SendMailSerializer(serializers.Serializer):
    greeting = serializers.CharField(max_length=150)
    mail_body = serializers.CharField()
    action_text = serializers.CharField(required=False, allow_blank=True)
    action_url = serializers.URLField(required=False, allow_blank=True)
    end_line = serializers.CharField(required=False, allow_blank=True)


class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ['id', 'email', 'created_at']
        read_only_fields = ['id', 'room', 'created_at']
        extra_kwargs = {'email': {'validators': []}}


class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'excerpt', 'content', 'image', 'published', 'created_at']
        read_only_fields = ['slug', 'created_at']


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'room', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'room', 'created_at']
