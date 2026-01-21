from django.shortcuts import render
from rest_framework.decorators import api_view,permission_classes,authentication_classes
from rest_framework.views import APIView
from rest_framework.response import Response 
from rest_framework import status
from django.db.models import Sum
import uuid
import hashlib
import hmac
import base64


from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt import token_blacklist
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from .authentication import *

from .models import *
from .serializer import *

# Creates JWT AUTH TOKEN TO BE USED FOR AUTHENTICATION LATER 
def get_tokens_for_user(user):
    if not user.is_active:
      raise AuthenticationFailed("User is not active")

    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# Create your views here.

# FOR REDIRECTING TO THE PAGES OF THE WEBSITE
def homepage(request):
    return render(request,'homepage.html')

def aboutPage(request):
    return render(request,'aboutpage.html')

def loginPage(request):
    return render(request,"loginpage.html")

def registerPage(request):
    return render(request,"signupPage.html")

def ConfirmCOD(request):
    return render(request,'confirmCOD.html')

@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def payment_options(request):
    return render(request,"payment-options.html")

@api_view(['GET'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def authentication_check(request):
    return Response({'Authorized':True,'proceedPage':'/payment_options/'})

# REDIRECTING TO PRODUCT PAGE VIEWS
def productPageRedirect(request):
    return render(request,"Product.html")

@api_view(["POST","GET"])
def productPageRedirectorURL(request):
    return Response({"response":"Its working", "redirect_url":"/productpage/"})

@api_view(['GET'])
def productData(request):
    id = request.GET.get('id')
    print(id)
    if (id!= '' and id):
        print(id!='' )
        product = Product.objects.get(id=id)
        print(product)
        serializer = productSerializer(product)
        print(serializer.data)
        return Response(serializer.data,status=status.HTTP_200_OK)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


def contactPage(request):
    return render(request,"contact.html")

def profilePage(request):
    return render(request,"profile.html")

@api_view(['POST','GET'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def profileInfo_Edit_or_Fetch(request):
    name = request.data.get('fullName')
    phone = request.data.get('phone')
    address = request.data.get('address')
    purpose = request.data.get('purpose','')
    user = request.user
    profile,_ = Profile.objects.get_or_create(
        user=user
    )
    if purpose == 'Save-Changes':
        profile.name = name
        profile.phone = phone
        profile.address = address
        profile.save()
    serializer = ProfileSerializer(profile)
    return Response(serializer.data,status=status.HTTP_200_OK)
    

# TO FETCH RANDOM PRODUCT DATA TO BE SHOWN IN HOME PAGE
@api_view(['GET'])
def homepage_show_products(request):
    products = Product.objects.order_by('?')[:15]
    serializer = ProductShowSerializer(products,many=True)
    return Response(serializer.data)

# TO FETCH DATA AS PER THE SEARCH KEYWORDS TO BE SHOWN IN SEARCH PAGE
@api_view(['GET'])
def resultpage_products(request):
    keyword = request.GET.get('keyword')
    print(keyword)
    if keyword and keyword.strip():
        kw = Keyword.objects.get(keyword=keyword)
        products = kw.products.all()
        serializer = ProductShowSerializer(products,many=True)
        if serializer:
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_404_NOT_FOUND)
    return Response({"status":"BAD REQUEST"},status=status.HTTP_400_BAD_REQUEST)


# ADD THE PRODUCT TO CART DATABASE TO BE USED LATER
@api_view(['POST'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def addToCart(request):
    id = request.data.get('product_ID')
    quantity = request.data.get('Quantity')
    user= request.user # comes from jwt if token is created for specific user
    print(id)
    print(user)
    product = Product.objects.get(id=id)
    cart,_ = Cart.objects.get_or_create(
        user=user
        ) # it creates a cart for specific user and if already exists it gets the cart

    cart_item,created = CartItem.objects.get_or_create(
        product=product,
        defaults={'quantity':1},
        cart = cart
    )

    # if product already in cart, increase quantity
    if not created:
        cart_item.quantity += int(quantity)
        cart_item.save()

    return Response({
        "success": True,
        "message": "Product added to cart",
        "product": product.product_name,
        "quantity": cart_item.quantity
    })

@api_view(['GET'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def cartCount(request):
    try:
        cart = request.user.cart
        count = cart.items.aggregate(
            total=Sum('quantity')
        )['total'] or 0

        return Response({
            'cart_count': count
        })

    except Exception:
        return Response({
            'cart_count': 0
        })


# REMOVE ITEMS FROM THE CART 
@api_view(['POST'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def removeFromCart(request):
    """Remove a cart item"""
    cart_item_id = request.data.get('cart_item_id')

    if not cart_item_id:
        return Response({'error': 'Cart item ID required'}, status=400)

    try:
        cart = Cart.objects.get(user=request.user)
    except Cart.DoesNotExist:
        return Response({'error': 'Cart not found'}, status=404)

    try:
        cart_item = cart.items.get(id=cart_item_id)
        cart_item.delete()
        return Response({'success': 'Item removed'})
    except CartItem.DoesNotExist:
        return Response({'error': 'Cart item not found'}, status=404)

# FETCHES DATA STORED IN YOUR CART TO BE SHOWN IN CART PAGE
@api_view(['GET'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def cartDataFetch(request):
    user = request.user
    cart = Cart.objects.get(user=user)
    if (cart):
        cartItems = cart.items.all()
        serializer = cartItemSerializer(cartItems,many=True)
        print(serializer.data)
        return Response(serializer.data,status=status.HTTP_200_OK)
    else:
        return Response({'message':'No products saved!!!'})


# FOR ADDING PRODUCTS WITH KEYWORDS, only for sellers to add products
@api_view(['GET'])
def keyword_list(request):
    ProductInput = request.data  # expecting a list of product with keywords
    
    for item in ProductInput:
        keywords_list = item.pop('keywords', [])  # remove keywords from data
        serializer = productSerializer(data=item)
        if serializer.is_valid():
            product = serializer.save()  # save product first

            # Handle keywords: create if not exists and link
            for kw in keywords_list:
                keyword_obj, created = Keyword.objects.get_or_create(keyword=kw)
                product.keywords.add(keyword_obj)

        else:
            print(serializer.errors)

    products = Product.objects.all()
    serializer = productSerializer(products, many=True)
    return Response(serializer.data)



# FOR REGISTERING MECHANISM 
@api_view(['POST'])
def sign_up(request):
    serializer = UserRegisterSerializer(data = request.data)
    if serializer.is_valid(raise_exception=True):
        user = serializer.save()
        token = get_tokens_for_user(user)
        response =  Response(serializer.data)
        response.set_cookie(
            key='jwt_access_token',
            value=token['access'],
            httponly=True,
            samesite='Strict',
            secure=False
        )
        response.set_cookie(
            key='jwt_refresh_token',
            value=token['refresh'],
            httponly=True,
            samesite='Strict',
            secure=False
            )
        return response
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        


# FOR LOGIING IN MECHANISM
@api_view(['POST'])
def User_login(request):
    serializer = UserLoginSerializer(data = request.data)
    if serializer.is_valid(raise_exception=True):
        print("Its working")
        email = serializer.validated_data.get('email')
        password = serializer.validated_data.get('password')
        user = authenticate(request,email=email, password=password)
        if user is not None:
            token = get_tokens_for_user(user)
            response =  Response({"Login status" :True})
            response.set_cookie(
                key='jwt_access_token',
                value=token['access'],
                httponly=True,
                samesite='Strict',
                secure=False
            )
            response.set_cookie(
                key='jwt_refresh_token',
                value=token['refresh'],
                httponly=True,
                samesite='Strict',
                secure=False
            )
            print("Its really working!!!")
            return response
        return Response(serializer.errors,status=status.HTTP_404_NOT_FOUND)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


# FOR LOGGING OUT MECHANISM

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def user_logout(request):
    refresh_token = request.COOKIES.get('jwt_refresh_token')
    if refresh_token:
        token = RefreshToken(refresh_token)
        token.blacklist()
    response = Response({"logged_out" :True})
    response.delete_cookie('jwt_access_token')
    response.delete_cookie('jwt_refresh_token')
    print("Logout is working!!")
    return response
    

# WHEN ORDER IS PLACED THIS VIEW EXECUTED TO PLACE ORDER  
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def place_order(request):
    total = request.data.get('Total')
    user = request.user
    order_type = request.data.get('orderType')
    payment_type = request.data.get('paymentType')
    
    order = Order.objects.create(
        user = user,
        payment_status="PENDING",
        total_cost = total,
    )
    profile = Profile.objects.get(user=user)
    address = profile.address
    print(address)
    order.address = address
    if payment_type == 'Esewa Payment':
        order.payment_type = payment_type
        order.transaction_uuid = uuid.uuid4()

    elif payment_type == 'COD':
        order.payment_type = 'CASH ON DELIVERY'

    order.save()

    if order_type == 'CartOrder':
        cart = Cart.objects.get(user=user)
        cartItems = cart.items.all()

        # loop through cart items and create OrderItems
        for item in cartItems:
            orderItem = OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
            )

        cart.items.all().delete()
        
    elif order_type == 'DirectOrder':
        productId = request.data.get('productId')
        quantity = int(request.data.get('quantity'))
        product = Product.objects.get(id=productId)

        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=quantity
        )
        
    return Response({
        "order_id": str(order.order_id),
        "message": "Order created"
    })

@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def esewa_payment_confirm(request):
    return render(request,'checkoutpage.html')


# FOR AUTHENTICATING AND REDIRECTING TO ESEWA PAYMENT PAGE
@api_view(['POST'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def eSewaCheckout(request):

    orderId = request.data.get('orderId')
    order = Order.objects.get(order_id=orderId)
    transaction_uuid = order.transaction_uuid
    total_amount = order.total_cost

    def genSHA256(key,message):
        key= key.encode('utf-8')
        message = message.encode('utf-8')

        hmac_sha256 = hmac.new(key, message, hashlib.sha256)
        digest = hmac_sha256.digest()
        signature = base64.b64encode(digest).decode('utf-8')
        return signature

    secret_key = '8gBm/:&EnhH.1/q'
    data_to_sign = (
        f"total_amount={total_amount},transaction_uuid={transaction_uuid},product_code=EPAYTEST"
    )
    signature = genSHA256(secret_key,data_to_sign)
    print(signature)

    context = {
        'signature' :signature,
        "transaction_uuid" : transaction_uuid,
        'total_amount':total_amount
    }
    return Response(context)

# RENDERS THE ORDER CONFIRMED PAGE 
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def orderComplete(request):
    return render(request,'orderSucess.html')

@api_view(['POST'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def COD_order_Confirmation(request):
    orderId = request.data.get('orderId')
    COD_charge = request.data.get('ChargeOnCOD')
    order = Order.objects.get(order_id=orderId)
    order.order_status = 'CONFIRMED'
    subtotal = order.total_cost
    order.total_cost = subtotal+COD_charge
    order.save()
    return Response({'The order with COD is confirmed !!!!'})

@api_view(['POST'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def orders_details(request):
    user = request.user
    orders = Order.objects.filter(user=request.user)
    serializer = OrderSerializer(orders,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)

# RENDERS THE ORDER HYSTERY PAGE
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def viewOrders(request):
    return render(request,'myorders.html')

# RENDERS THE CART PAGE
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def cartView(request):
    return render(request,'cart.html')

# When payment is done then this view is called to save the payment record 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def payment_completed(request):
    orderId = request.data.get('orderId')
    order = Order.objects.get(order_id=orderId)
    order.payment_status = 'PAID'
    order.order_status = 'CONFIRMED'
    order.save()
    return Response({
        'Message' : 'Payment Successful'
    })


