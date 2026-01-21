from django.db import models
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser,BaseUserManager
from django.conf import settings

import uuid

# Create your models here.


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)
    
class User(AbstractUser):
    username = models.CharField(max_length=30,null=True,blank=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

# USER PROFILE DATABASE MODEL
class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_profile",
        unique=True,
        editable=False
    )
    name = models.CharField(max_length=100,null=True,blank=True)
    phone = models.BigIntegerField(null=True,blank=True)
    address = models.TextField(null=True,blank=True)

    def __str__(self):
        return self.user.username
    

# PRODUCTS DATABASE MODEL AND RELATION    
    
class Keyword(models.Model):
    keyword = models.CharField(max_length=100,unique=True)

    def __str__(self):
        return self.keyword
    
class Product(models.Model):
    product_name = models.CharField(max_length=100,unique=True)
    price = models.IntegerField()
    images = models.ImageField(upload_to='product-images/',blank=True,null=True)
    product_description = models.TextField()
    product_features = models.TextField()
    in_stock = models.BooleanField(default=True)
    keywords = models.ManyToManyField(Keyword,blank=True,related_name='products')

    def __str__(self):
        return self.product_name
    
    
# CART AND CART ITEMS DATABASE MODELS AND THEIR RELATION
class Cart(models.Model):
    user = models.OneToOneField(
            settings.AUTH_USER_MODEL,
            on_delete=models.CASCADE,
            related_name="cart",
            unique=True
        )

    def __str__(self):
        return f"{self.user.username} cart"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE,related_name="items")
    product = models.ForeignKey(Product,on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    class Meta:
        unique_together = ('cart', 'product')


    def __str__(self):
        return f"{self.cart} product"
    
class Order(models.Model):
    order_id = models.CharField(max_length=30, unique=True)
    transaction_uuid = models.CharField(max_length=20,unique=True,null=True,blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,editable=False)
    total_cost = models.IntegerField(null=True,blank=True)
    address = models.CharField(max_length=100,null=True,blank=True)
    payment_type = models.CharField(
        max_length=20,
        choices=[('Esewa Payment','esewa payment'),('CASH ON DELIVERY','Cash on delivery')],
        default=''
    )
    payment_status = models.CharField(
        max_length=20,
        choices=[("PENDING","Pending"),("PAID","Paid"),("FAILED","Failed")],
        default="PENDING"
    )
    order_status = models.CharField(
        max_length=20,
        choices=[("PENDING","Pending"),("CONFIRMED","Confirmed"),
                 ("FAILED","Failed")],
        default="PENDING"
    )
    delivered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # GENERATES A UNIQUE ORDER ID STARTING WITH ORD 
    def save(self, *args, **kwargs):
        if not self.order_id:
            self.order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

# PURCHASED ITEMS AND LIST DATABASE MODELS AND THEIR RELATION

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE,related_name="purchased_products")
    product = models.ForeignKey(Product,on_delete=models.CASCADE,related_name='items')
    quantity = models.IntegerField(null=True,blank=True)


    def __str__(self):
        return f"{self.order.user.username} order"
    
    
