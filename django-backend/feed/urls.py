from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'posts', views.PostViewSet, basename='post')
router.register(r'comments', views.CommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
    path('likes/', views.toggle_like, name='toggle-like'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('me/', views.current_user, name='current-user'),
]
