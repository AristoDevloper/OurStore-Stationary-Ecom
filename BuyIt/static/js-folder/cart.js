const logo = document.querySelector('.logo');
const cartLayout = document.querySelector('.cart-wrapper')
const cartTable = document.querySelector('.cart-items');
const Subtotal = document.getElementById('Subtotal');
const shippingFee = document.getElementById('ShippingFee');
const TotalPrice = document.getElementById('TotalPrice');

const checkoutBtn = document.querySelector('.checkout-btn');
let SubPrice = 0;
let total;

//Redirects to homepage
logo.addEventListener('click',()=>{
  window.location.href = '/';
})

// Fetch cart items from backend and render it in page
async function cartItemsFetch(){
  const response = await fetch('/cartData/',{
    method:'GET',
    credentials:"same-origin"
  })
  const data = await response.json();
  products = data;
  products.map(cartProductRender);
  Subtotal.innerHTML = `Rs. ${SubPrice}`;
  total = SubPrice+150;
  TotalPrice.innerHTML = `Rs. ${total}`;

if (products.length === 0) {
    cartLayout.innerHTML = `
    <h2>EMPTY CART</h2>
    <p>Add items to cart</p>
    <a href='/' class="home-btn">HomePage</a>
    `;

    cartLayout.style.textAlign = 'center';
    cartLayout.style.fontSize = '24px';
    cartLayout.style.fontWeight = '600';
    cartLayout.style.padding = '50px 0';
    cartLayout.style.color = '#555';

    // Optional: style the link like a button
    const homeBtn = cartLayout.querySelector('.home-btn');
    homeBtn.style.display = 'inline-block';
    homeBtn.style.marginTop = '20px';
    homeBtn.style.padding = '10px 20px';
    homeBtn.style.backgroundColor = '#2563eb'; // blue
    homeBtn.style.color = '#fff';
    homeBtn.style.textDecoration = 'none';
    homeBtn.style.borderRadius = '8px';
    homeBtn.style.fontWeight = '600';
    homeBtn.style.transition = 'all 0.25s ease';
    
    homeBtn.addEventListener('mouseenter', () => {
        homeBtn.style.backgroundColor = '#1e40af'; // darker blue on hover
    });
    homeBtn.addEventListener('mouseleave', () => {
        homeBtn.style.backgroundColor = '#2563eb';
    });
}

}
cartItemsFetch()

// Render the fetched cart items using js dom
function cartProductRender(data){
    // DESTRUCTURING THE FETCHED CART PRODUCTS
    const {
      // Product futher destructuring
      product:{
        product_name:name,
        product_description:detail,
        price
      },
      quantity,
      id
    } = data
    console.log(id)

    // CREATING ELEMENT FOR RENDERING 
    const CartItem = document.createElement('div');
    const ProductInfo = document.createElement('div');
    const Name = document.createElement('h3');
    const Detail = document.createElement('p');

    const ItemMeta = document.createElement('div');
    const Quantity = document.createElement('p');
    const Price = document.createElement('span');
    const removeBtn = document.createElement('button');

    // ADDING CLASSNAME TO THE CREATED ELEMENT SO THAT CSS IS APPLIED ACCORDINGLY
    CartItem.className = 'cart-item';
    ProductInfo.className = 'item-info';
    ItemMeta.className = 'item-meta';
    Quantity.className = 'quantity';
    Price.className = 'price';
    removeBtn.className = 'remove-btn';

    // Set the button text
    removeBtn.innerHTML = 'x';

// OPTIONAL: attach event listener for remove functionality
    removeBtn.addEventListener('click', () => {
      const cart_item_id = id;
      fetch('/removeCartItem/',{
        method:'POST',
        credentials:"same-origin",
        headers:{
            'Content-Type' : 'application/json',
        },
        body:JSON.stringify({cart_item_id})
      })
      window.location.href = '/cart/';
});
  
    ProductInfo.append(Name,Detail)
    ItemMeta.append(Quantity,Price,removeBtn)
    CartItem.append(ProductInfo,ItemMeta)
    cartTable.append(CartItem)

    Name.innerHTML = name;
    Detail.innerHTML = detail;
    Quantity.innerHTML = quantity;
    Price.innerHTML = `Rs. ${price}`;

    SubPrice += Number(price)*Number(quantity);
}

// TO PROCEED TO PAYMENT PAGE
checkoutBtn.addEventListener('click',()=>{
  sessionStorage.setItem('totalPrice',total);
  sessionStorage.setItem('Order-Type','CartOrder');
  window.location.href = '/payment_options/';
})
