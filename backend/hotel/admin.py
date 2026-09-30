from django.contrib import admin
from .models import Room, Booking, GalleryImage, ContactMessage, Subscriber, BlogPost, Review

for m in (Room, Booking, GalleryImage, ContactMessage, Subscriber, BlogPost, Review):
    admin.site.register(m)
