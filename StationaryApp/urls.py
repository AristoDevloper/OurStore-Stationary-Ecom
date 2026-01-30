from django.urls import path
from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('',homepage,name='homePage'),
    path('login/', loginPage ,name='login'),
    path('logout/',user_logout,name='logout'),
    path('register/', registerPage ,name='register'),
    path('product/', productPageRedirectorURL ,name='product'),
    path("productpage/", productPageRedirect, name="productpage") ,
    path('cart/',cartView,name='Cart'),
    path('cartCount/', cartCount, name='cart-count'),
    path('removeCartItem/',removeFromCart,name='Remove-cart-items'),
    path('payment_options/', payment_options ,name='choose_payment'),
    path('authorizationChecker/',authentication_check,name='Authorization-Checker'),
    path('about-us/', aboutPage, name='About_Section'),
    path('eSewaPaymentConfirm/',esewa_payment_confirm,name='esewa-pay-confirm'),
    path('esewa-payment/',eSewaCheckout,name='esewa-checkout-section'),
    path('paymentCompleted/',payment_completed,name='Payment Complete'),
    path('orderPlace/',place_order,name='placeOrder'),
    path('confirmCOD/',ConfirmCOD,name='ConfirmCOD'),
    path('codorderconfirm/',COD_order_Confirmation),
    path('orderDetails/',orders_details,name='Order Details'),
    path('order_placed/',orderComplete,name='order_complete'),
    path('your_orders/',viewOrders,name='your_orders'),
    path("loggingIn/",User_login,name="LoggedIn"),
    path("contactUs/",contactPage,name="contact"),
    path("signned-up/",sign_up,name="siggned_up"),
    path("myProfile/",profilePage,name="profilePage"),
    path('profile_edit/',profileInfo_Edit_or_Fetch,name='Profile-Edit'),
    path('homepageShow/',homepage_show_products,name="homepageShowProducts"),
    path('resultpageproducts/',resultpage_products,name='resultPageProducts'),
    path('addToCart/',addToCart,name='Cart-Add'),
    path('cartData/',cartDataFetch,name='CartData'),
    path('keywordsave/',keyword_list,name='keywords'),
    path('productdata/',productData,name='Product-Data'),
    path('updateCartQuantity/', update_cart_quantity, name='update_cart_quantity'),
    
    
    # FOR JWT TOKEN WORKS LIKE GENERATING TOKENS OR BLACKLISTING
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
]

# for storing media files for development and incase of production use cloud or other paid hosting services 
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)

