from django.contrib import admin
from .models import VerificationCode  # Make sure to import the model

# Register the VerificationCode model
@admin.register(VerificationCode)
class VerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'code', 'expriarationDate')  # Fields to display in the admin list view
    search_fields = ('username', 'email')  # Fields to search in the admin

    # Optional: Customize the admin form
    fieldsets = (
        (None, {
            'fields': ('username', 'email', 'code', 'password', 'expriarationDate')
        }),
    )

    def save_model(self, request, obj, form, change):
        if obj.password:
            obj.password = make_password(obj.password)
        super().save_model(request, obj, form, change)

# Alternatively, you can use the simpler registration without customization:
# admin.site.register(VerificationCode)
