from django.contrib import admin
from .models import *
from django.contrib.auth.admin import UserAdmin

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('email', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Permissions', {'fields': ('is_staff','is_active','groups','user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email','password1','password2','is_staff','is_active')}
        ),
    )

# Register your models here.
admin.site.register(Profile)

admin.site.register(Product)

admin.site.register(Cart)
admin.site.register(Keyword)
admin.site.register(CartItem)

admin.site.register(Order)
admin.site.register(OrderItem)
