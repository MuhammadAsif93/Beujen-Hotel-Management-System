from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('rooms', views.RoomViewSet, basename='room')
router.register('bookings', views.BookingViewSet, basename='booking')
router.register('gallery', views.GalleryViewSet, basename='gallery')
router.register('blog', views.BlogViewSet, basename='blog')
router.register('contact', views.ContactViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
    path('newsletter/', views.NewsletterView.as_view()),
    path('admin/subscribers/', views.SubscriberListView.as_view()),
    path('admin/stats/', views.AdminStatsView.as_view()),
]
