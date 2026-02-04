from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Post, Comment, Like, KarmaTransaction


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'karma', 'karma_24h', 'created_at']
    list_filter = ['is_staff', 'is_active', 'created_at']
    search_fields = ['username', 'email']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile', {'fields': ('avatar',)}),
    )


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'content_preview', 'likes_count', 'comments_count', 'created_at']
    list_filter = ['created_at', 'author']
    search_fields = ['content', 'author__username']
    raw_id_fields = ['author']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'post', 'parent', 'depth', 'content_preview', 'created_at']
    list_filter = ['created_at', 'depth']
    search_fields = ['content', 'author__username']
    raw_id_fields = ['author', 'post', 'parent']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'like_type', 'post', 'comment', 'created_at']
    list_filter = ['like_type', 'created_at']
    raw_id_fields = ['user', 'post', 'comment']


@admin.register(KarmaTransaction)
class KarmaTransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'karma_type', 'created_at']
    list_filter = ['karma_type', 'created_at']
    search_fields = ['user__username']
    raw_id_fields = ['user']
