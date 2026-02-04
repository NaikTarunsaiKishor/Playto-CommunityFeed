from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction, IntegrityError
from django.db.models import Sum, F
from django.utils import timezone
from django.core.cache import cache
import threading

from .models import User, Post, Comment, Like, KarmaTransaction
from .serializers import (
    UserSerializer, PostSerializer, PostCreateSerializer, PostDetailSerializer,
    CommentSerializer, CommentCreateSerializer, LikeSerializer, LeaderboardSerializer
)

# Lock for handling concurrent like operations
like_locks = {}
lock_manager = threading.Lock()


def get_like_lock(key):
    """Get or create a lock for a specific like operation"""
    with lock_manager:
        if key not in like_locks:
            like_locks[key] = threading.Lock()
        return like_locks[key]


class PostViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for posts with optimized queries
    """
    queryset = Post.objects.select_related('author').prefetch_related('likes')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PostCreateSerializer
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """
        Get threaded comments for a post.
        Solves N+1 problem by fetching all comments in single query
        and building tree in memory.
        """
        post = self.get_object()
        
        # Single query to get all comments with related data
        all_comments = list(
            Comment.objects
            .filter(post=post)
            .select_related('author')
            .prefetch_related('likes')
            .order_by('created_at')
        )
        
        # Build comment tree in O(n) time
        comment_dict = {}
        root_comments = []
        
        for comment in all_comments:
            comment_data = CommentSerializer(comment, context={'request': request}).data
            comment_data['replies'] = []
            comment_dict[comment.id] = comment_data
        
        for comment in all_comments:
            comment_data = comment_dict[comment.id]
            if comment.parent_id and comment.parent_id in comment_dict:
                comment_dict[comment.parent_id]['replies'].append(comment_data)
            else:
                root_comments.append(comment_data)
        
        return Response(root_comments)


class CommentViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for comments with threading support
    """
    queryset = Comment.objects.select_related('author', 'post').prefetch_related('likes')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CommentCreateSerializer
        return CommentSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_like(request):
    """
    Toggle like on a post or comment.
    Handles concurrency with locking to prevent race conditions.
    """
    like_type = request.data.get('type')  # 'post' or 'comment'
    target_id = request.data.get('id')
    user = request.user
    
    if like_type not in ['post', 'comment']:
        return Response(
            {'error': 'Invalid like type'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create lock key for this specific like operation
    lock_key = f"{like_type}:{target_id}:{user.id}"
    like_lock = get_like_lock(lock_key)
    
    # Acquire lock to prevent race conditions
    with like_lock:
        try:
            with transaction.atomic():
                # Get target object
                if like_type == 'post':
                    target = Post.objects.select_for_update().get(id=target_id)
                    existing_like = Like.objects.filter(
                        user=user, post=target, like_type='post'
                    ).first()
                else:
                    target = Comment.objects.select_for_update().get(id=target_id)
                    existing_like = Like.objects.filter(
                        user=user, comment=target, like_type='comment'
                    ).first()
                
                if existing_like:
                    # Unlike - remove like and karma
                    karma_amount = -5 if like_type == 'post' else -1
                    KarmaTransaction.objects.create(
                        user=target.author,
                        amount=karma_amount,
                        karma_type=f'{like_type}_like',
                        reference_id=f'unlike_{existing_like.id}'
                    )
                    existing_like.delete()
                    liked = False
                else:
                    # Like - create like and add karma
                    like_data = {
                        'user': user,
                        'like_type': like_type,
                    }
                    if like_type == 'post':
                        like_data['post'] = target
                    else:
                        like_data['comment'] = target
                    
                    new_like = Like.objects.create(**like_data)
                    
                    karma_amount = 5 if like_type == 'post' else 1
                    KarmaTransaction.objects.create(
                        user=target.author,
                        amount=karma_amount,
                        karma_type=f'{like_type}_like',
                        reference_id=f'like_{new_like.id}'
                    )
                    liked = True
                
                # Get updated counts
                if like_type == 'post':
                    likes_count = target.likes.count()
                else:
                    likes_count = target.likes.count()
                
                return Response({
                    'liked': liked,
                    'likes_count': likes_count,
                    'author_karma': target.author.karma
                })
                
        except (Post.DoesNotExist, Comment.DoesNotExist):
            return Response(
                {'error': 'Target not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except IntegrityError:
            return Response(
                {'error': 'Like operation failed'}, 
                status=status.HTTP_409_CONFLICT
            )


@api_view(['GET'])
def leaderboard(request):
    """
    Get top users by karma earned in last 24 hours.
    Uses aggregation on karma_transactions table for accuracy.
    """
    cutoff = timezone.now() - timezone.timedelta(hours=24)
    
    # Aggregate karma from transactions in last 24 hours
    top_users = (
        User.objects
        .filter(karma_transactions__created_at__gte=cutoff)
        .annotate(
            karma_24h=Sum(
                'karma_transactions__amount',
                filter=models.Q(karma_transactions__created_at__gte=cutoff)
            )
        )
        .filter(karma_24h__gt=0)
        .order_by('-karma_24h')[:5]
    )
    
    # Add total karma
    result = []
    for user in top_users:
        result.append({
            'id': user.id,
            'username': user.username,
            'avatar': user.avatar,
            'karma_24h': user.karma_24h,
            'total_karma': user.karma
        })
    
    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    """Get current authenticated user info"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
