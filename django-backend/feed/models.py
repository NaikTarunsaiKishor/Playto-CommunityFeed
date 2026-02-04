from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    """Extended user model with karma tracking"""
    avatar = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'users'
    
    @property
    def karma(self):
        """Calculate total karma from transactions"""
        return self.karma_transactions.aggregate(
            total=models.Sum('amount')
        )['total'] or 0
    
    @property
    def karma_24h(self):
        """Calculate karma earned in last 24 hours"""
        cutoff = timezone.now() - timezone.timedelta(hours=24)
        return self.karma_transactions.filter(
            created_at__gte=cutoff
        ).aggregate(total=models.Sum('amount'))['total'] or 0


class Post(models.Model):
    """Community feed post"""
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'posts'
        ordering = ['-created_at']
    
    @property
    def likes_count(self):
        return self.likes.count()
    
    @property
    def comments_count(self):
        return self.comments.count()


class Comment(models.Model):
    """Threaded comment with self-referential parent"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='replies'
    )
    content = models.TextField()
    depth = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'comments'
        ordering = ['created_at']
    
    @property
    def likes_count(self):
        return self.likes.count()
    
    def save(self, *args, **kwargs):
        # Auto-calculate depth based on parent
        if self.parent:
            self.depth = self.parent.depth + 1
        super().save(*args, **kwargs)


class Like(models.Model):
    """Polymorphic like for posts and comments"""
    LIKE_TYPE_CHOICES = [
        ('post', 'Post'),
        ('comment', 'Comment'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    like_type = models.CharField(max_length=10, choices=LIKE_TYPE_CHOICES)
    post = models.ForeignKey(
        Post, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='likes'
    )
    comment = models.ForeignKey(
        Comment, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='likes'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'likes'
        # Prevent double-likes with unique constraint
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'post'],
                condition=models.Q(like_type='post'),
                name='unique_post_like'
            ),
            models.UniqueConstraint(
                fields=['user', 'comment'],
                condition=models.Q(like_type='comment'),
                name='unique_comment_like'
            ),
        ]


class KarmaTransaction(models.Model):
    """Track karma changes for accurate leaderboard calculation"""
    KARMA_TYPE_CHOICES = [
        ('post_like', 'Post Like'),
        ('comment_like', 'Comment Like'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='karma_transactions')
    amount = models.IntegerField()
    karma_type = models.CharField(max_length=20, choices=KARMA_TYPE_CHOICES)
    reference_id = models.CharField(max_length=100)  # like_id for tracking
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'karma_transactions'
        ordering = ['-created_at']
