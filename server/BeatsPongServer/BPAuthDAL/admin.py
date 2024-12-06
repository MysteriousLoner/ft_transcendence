from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email')  # Columns to display in the admin list view
    search_fields = ('username', 'email')  # Fields to search in the admin site

