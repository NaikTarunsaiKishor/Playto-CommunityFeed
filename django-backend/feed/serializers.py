from rest_framework import serializers
from .models import User, Post, Comment, Like, KarmaTransaction


class UserSerializer(serializers.ModelSerializer):
    karma = serializers.IntegerField(read_only=True)
    karma_24h = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'karma', 'karma_24h', 'created_at']


class UserMinimalSerializer(serializers.ModelSerializer):
    """Minimal user info for nested serialization"""
    karma = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'karma']


class CommentSerializer(serializers.ModelSerializer):
    author = UserMinimalSerializer(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    replies = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'author', 'parent', 'content', 
            'depth', 'likes_count', 'replies', 'is_liked',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['depth']
    
    def get_replies(self, obj):
        """Recursively serialize nested replies"""
        # This is handled differently in the view for efficiency
        return []
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['post', 'parent', 'content']


class PostSerializer(serializers.ModelSerializer):
    author = UserMinimalSerializer(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'author', 'content', 'likes_count', 
            'comments_count', 'is_liked', 'created_at', 'updated_at'
        ]
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['content']


class PostDetailSerializer(PostSerializer):
    """Post with threaded comments"""
    comments = serializers.SerializerMethodField()
    
    class Meta(PostSerializer.Meta):
        fields = PostSerializer.Meta.fields + ['comments']
    
    def get_comments(self, obj):
        """Build threaded comment tree efficiently"""
        # Fetch all comments in single query (solves N+1)
        all_comments = list(obj.comments.select_related('author').prefetch_related('likes'))
        
        # Build lookup dict
        comment_dict = {c.id: {
            'id': c.id,
            'author': UserMinimalSerializer(c.author).data,
            'content': c.content,
            'depth': c.depth,
            'parent_id': c.parent_id,
            'likes_count': c.likes_count,
            'is_liked': self._is_comment_liked(c),
            'created_at': c.created_at.isoformat(),
            'replies': []
        } for c in all_comments}
        
        # Build tree structure
        root_comments = []
        for c in all_comments:
            comment_data = comment_dict[c.id]
            if c.parent_id and c.parent_id in comment_dict:
                comment_dict[c.parent_id]['replies'].append(comment_data)
            else:
                root_comments.append(comment_data)
        
        return root_comments
    
    def _is_comment_liked(self, comment):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return comment.likes.filter(user=request.user).exists()
        return False


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'user', 'like_type', 'post', 'comment', 'created_at']
        read_only_fields = ['user']


class LeaderboardSerializer(serializers.ModelSerializer):
    """Leaderboard entry with 24h karma"""
    karma_24h = serializers.IntegerField(read_only=True)
    total_karma = serializers.IntegerField(source='karma', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'karma_24h', 'total_karma']
