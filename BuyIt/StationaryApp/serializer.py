from rest_framework import serializers
from .models import *
from .utils import *
from django.contrib.auth import authenticate

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def validate(self,attrs):
        try:
            body = '''
Hello and welcome to OUR STORE!

We’re excited to have you join our community. Your account has been successfully created, and you can now explore a wide range of products, great deals, and a smooth shopping experience made just for you.

If you ever need help, our support team is always here for you.
Happy shopping, and thank you for choosing OUR STORE!

Warm regards,
Team OUR STORE
                '''
            email_data = {
                "body": body,
                "subject": "Welcome to OUR STORE 🎉",
                "to_email": attrs['email']
            }
            Util.send_email(email_data)
        except Exception as e:
            # Just print error, don't crash
            print(os.environ.get('EMAIL_USER'))
            print(os.environ.get('EMAIL_PASS'))
            print("Email failed to send:", e)
        return attrs

    def create(self,validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email= validated_data['email'],
            password=validated_data['password']
            )
        return user
        
class UserLoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password']

class keywordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Keyword
        fields = ['keyword']



class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'
        

class ProductShowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['product_name','id','price','images','in_stock']

class productSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'product_name','id','price','images',
            'product_description','product_features',
            'in_stock','keywords']
        
class userCartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart

class cartItemSerializer(serializers.ModelSerializer):
    product = productSerializer(read_only=True)
    class Meta:
        model = CartItem
        fields = ['product','quantity','id']

class OrderItemSerializer(serializers.ModelSerializer):
    product = productSerializer(read_only=True)
    class Meta:
        model = OrderItem
        fields = [
            'product',
            'quantity',
        ]

class OrderSerializer(serializers.ModelSerializer):
    purchased_products = OrderItemSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Order
        fields = [
            'order_id',
            'total_cost',
            'purchased_products',
            'payment_type',
            'order_status',
            'delivered',
            'payment_status',
            'address'
            ]

