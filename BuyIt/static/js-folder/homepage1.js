const loginLink = document.getElementById('Login');
const profileLink = document.getElementById('Profile');
const orderLink = document.getElementById('orders');
const cartLink = document.getElementById('open-cart');
const contactLink = document.querySelectorAll('.contact');
const cartCount  = document.getElementById('cart-count')


fetch('/cartCount/',{
    method:'GET',
    credentials:"same-origin"
})
.then(res=>res.json())
.then(data=>{
    cartCount.innerHTML = data.cart_count
})

fetch('/authorizationChecker/',{
    method:'GET',
    credentials:"same-origin"
})
.then(res=>res.json())
.then(data=>{
    const {Authorized} = data
    if(Authorized){
        loginLink.style.display = 'none';
        cartLink.addEventListener('click',()=>{
            window.location.href = '/cart/'
        })
        contactLink.forEach((contact)=>{
            contact.addEventListener('click',()=>{
            window.location.href = '/contactUs/'
            
        })})
    }
    else {
        profileLink.style.display = 'none';
        orderLink.style.display = 'none';
        cartLink.addEventListener('click',()=>{
            window.location.href = '/login/';
        })
        contactLink.forEach((contact)=>{
            contact.addEventListener('click',()=>{
            window.location.href = '/login/'
        })
        cartCount.innerHTML = '0'
        })
    }
})
const productContainer = document.getElementById('home-products');

//FOR FETCHING DATA OF PRODUCTS TO BE SHOWN IN HOMEPAGE
async function productsFetch(){
    const response = await fetch('homepageShow/',{
        method:"GET",
        headers : {
            "Content-Type" : "application/json",
        },
    })
    const data = await response.json()
    let fetchedProduct = data;
    await fetchedProduct.forEach(productshower)

    clickedProduct = document.querySelectorAll(".product")
    productPageRedirect()
}
productsFetch()

// FOR ADDING PRODUCTS TO THE SCREEN 
function productshower(prod){
    const {
        id,images,price,product_name, in_stock
    } = prod;
    const productCard = document.createElement('div');
    const imageContainer = document.createElement('div');
    const productImage = document.createElement('img');
    const productName = document.createElement('p');
    const productPrice = document.createElement('p');
    const stockSituation= document.createElement('p');
    const rating = document.createElement('p');

    //setting attribute for storing data here
    productImage.setAttribute('src',images)
    productCard.setAttribute('data-price',price)
    productCard.setAttribute('data-name',product_name)
    productCard.setAttribute('data-id',id)

    // appending children and linking elements
    imageContainer.appendChild(productImage);
    productCard.append(imageContainer,productName,productPrice,stockSituation,rating);
    productContainer.appendChild(productCard);
    productCard.className = 'product';
    productName.className = 'product-name';
    productPrice.className = 'product-price'
    stockSituation.className = 'stock-situation'
    rating.className = 'rating'

    //actually showing the datas in page
    productName.innerHTML = product_name
    productPrice.innerHTML = `Rs.${price}`
    stockSituation.innerHTML = 'in stock'
    rating.innerHTML = `Rating <span class="rating-star">⭐⭐⭐⭐⭐ (2.5)</span>`

}

// TO REDIRECT TO THE SPECIFIC PRODUCT PAGE WITH SPECIFIC PRODUCT DETAILS
let clickedProduct;
function productPageRedirect(){
    clickedProduct.forEach(product => {
    product.addEventListener('click', e => {
        const id = product.getAttribute("data-id");
            sessionStorage.clear()
            sessionStorage.setItem("productId",id)
            window.location.href = '/productpage/';
    })
})
}

// CART LOGIC
let cartCountElement = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const openCartButton = document.getElementById('open-cart');

// SEARCH LOGIC
let searchBox = document.getElementById('search-box');
const searchBtn = document.getElementById('search-btn');
const homepage = document.getElementById('homepage');
const searchpage = document.getElementById('searchpage');
const searchResults = document.getElementById('search-results');
const priceFilter = document.getElementById('price-filter');
const priceVal = document.getElementById('price-val');
const logo = document.querySelector('.logo');

// FETCHING SPECIFIC SEARCHED PRODUCTS AS PER PROVIDED KEYWORD
async function searchPageProductFetch(keyword) {
    try {
    const response = await fetch(`resultpageproducts/?keyword=${keyword}`,{
        method:'GET',
        headers:{
            "Content-Type" : "application/json",
        },
    })
    if (!response.ok){
        console.error('server error:',response.status);
        return [];
    }
    const data = await response.json();
    product = data;
    return data;
    }
    catch(errors){
        console.error('Network error:', err);
        return [];
    }
}

//  FOR RENDERING SEARCH PRODUCTS USING JS DOM

let products;
function renderSearchResults(items) {
    searchResults.innerHTML = '';
    if (items.length === 0) { searchResults.innerHTML = `<p'>No products found.</p>`; }
    items.forEach(item => {
        const {
            id,images,price,product_name, in_stock
        } = item;
        const productCard = document.createElement('div');
        const imageContainer = document.createElement('div');
        const productImage = document.createElement('img');
        const productName = document.createElement('p');
        const productPrice = document.createElement('p');
        const stockSituation= document.createElement('p');
        const rating = document.createElement('p');

        //setting attribute for storing data here
        productImage.setAttribute('src',images)
        productCard.setAttribute('data-price',price)
        productCard.setAttribute('data-name',product_name)
        productCard.setAttribute('data-id',id)

        // appending children and linking elements
        imageContainer.appendChild(productImage);
        productCard.append(imageContainer,productName,productPrice,stockSituation,rating);
        searchResults.appendChild(productCard);
        productCard.className = 'product';
        productName.className = 'product-name';
        productPrice.className = 'product-price'
        stockSituation.className = 'stock-situation'
        rating.className = 'rating'

        //actually showing the datas in page
        productName.innerHTML = product_name
        productPrice.innerHTML = `Rs.${price}`
        stockSituation.innerHTML = 'in stock'
        rating.innerHTML = `Rating <span class="rating-star">⭐⭐⭐⭐⭐ (2.5)</span>`
    });
}

searchBtn.addEventListener('click', async () => {
console.log('Search Button is working');
    searchBox = document.getElementById('search-box');
    console.log("search btn working")
    const query = searchBox.value.toLowerCase();
    if (query){
        data = await searchPageProductFetch(query)
        homepage.style.display = 'none';
        searchpage.style.display = 'block';
        renderSearchResults(data);
        clickedProduct = document.querySelectorAll(".product");
        productPageRedirect();
}
else {
    window.location.href = '/';
}
});

priceFilter.addEventListener('input', () => {
    priceVal.textContent = priceFilter.value;
    const query = searchBox.value.toLowerCase();
    let filtered = products.filter(p => p.name.toLowerCase().includes(query) && p.price <= parseFloat(priceFilter.value));
    renderSearchResults(filtered);
});

// Logo click returns to homepage
logo.addEventListener('click', () => {
    window.location.href = '/';
});