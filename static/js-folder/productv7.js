// Getting Add-To-Cart Button to use later
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');


const productId = sessionStorage.getItem("productId")
console.log(`From sessionStorage${productId}`)


const openCartButton = document.getElementById('open-cart');
const buyNowButton = document.getElementById('buy-btn');


let Price;
let Quantity;


const cartCount  = document.getElementById('cart-count')


function cartcountrenderer(){
    fetch('/cartCount/',{
        method:'GET',
        credentials:"same-origin"
    })
    .then(res=>res.json())
    .then(data=>{
        if (data.code != 'token_not_valid'){
            cartCount.innerHTML = data.cart_count
        }
        else {
            cartCount.innerHTML = '0';
        }
        
    })
}



console.log(productId)
// FETCHING THE SPECIFIC PRODUCT DATA  
async function productDataFetch(){
    const response = await fetch("/productdata/?id="+productId,{
        method:"GET",
        headers:{
            'Content-Type':'application/json'
        }
    })
    data = await response.json()
    if (!data) {
        console.log('Failed to fetch data')
    }
    else {
        console.log('Data is fetched')
    }
    console.log(data);
    productRenderer(data)
}


productDataFetch()


// RENDERING THE FETCHED DATA ON THE PAGE ALONG WITH THE ELEMENTS CSS BEING APPLIED
function productRenderer(data){
    console.log("Data will be rendered here!!!")
    console.log(data)

    // DESTRUCTURING PRODUCT DATAS
    const {product_name:name,
        images,price,
        product_description:description,
        product_features:features
        } = data
        const in_stock = true


    // RENDERING THE DATA IN PAGE USING JS DOM
    const image = document.getElementById('product-img');
    image.setAttribute('src',images)
    const productName = document.getElementById('product-name')
    const productPrice = document.getElementById('product-price')
    const productDescription = document.getElementById('product-desc')
    const productFeatures = document.querySelector('.features')
    const stockSituation = document.querySelector('.stock-info')


    productName.innerHTML = name;
    productPrice.innerHTML = `Rs.${price}`;
    productDescription.innerHTML = description
    productFeatures.innerHTML = features


    Price = price


    if (in_stock){
        stockSituation.innerHTML = `in stock`
    }
    else{
        stockSituation = document.querySelector('.stock-info')
        stockSituation.style.color = "red";
        stockSituation.innerHTML = `out of stock`;
    }
}



// Upon click on BUY NOW Button Redirects to page where you choose payment options
buyNowButton.addEventListener('click', ()=>{
    console.log('Buy now button is working!!!')
    fetch('/authorizationChecker/',{
        method:'GET',
        credentials:"same-origin"
    })
    .then(res=>res.json())
    .then(data=>{
        const {proceedPage,Authorized} = data
        if(Authorized){
            Quantity = document.getElementById('quantity').value;
            const price = Price*Quantity 
            const total = price + 150;
            sessionStorage.setItem('totalPrice',total);
            sessionStorage.setItem('Order-Type','DirectOrder');
            sessionStorage.setItem('quantity',Quantity);
            window.location.href = proceedPage;
        }
        else{
            window.location.href = '/login/';
        }
    }) 
})




// ADDS PRODUCTS TO THE CART AND ALSO TO THE CART DATABASE
addToCartButtons.forEach(button => {
    button.addEventListener('click', async () => {
        await fetch('/authorizationChecker/',{
        method:'GET',
        credentials:"same-origin"
        })
        .then(res=>res.json())
        .then(data=>{
            const {Authorized} = data
            const product_ID = sessionStorage.getItem("productId")
            Quantity = document.getElementById('quantity').value;
            if(Authorized){
                const body = {
                    product_ID,
                    Quantity,
                }


                fetch('/addToCart/',{
                    method:'POST',
                    credentials:"same-origin",
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify(body)
                })
                .then(res=>res.json())
                .then(data=>{
                    console.log(data)
                    button.textContent = 'Added!'; button.style.backgroundColor = '#2ecc71';
                    setTimeout(() => { button.textContent='Add to Cart'; button.style.backgroundColor='#3498db'; }, 800);
                    cartcountrenderer()
                })
                .catch(err=>console.error('Something went wrong')); 


            }
            else{
                window.location.href = '/login/';        
            }
        })


    });
});


// Comment submission
const dataCopy = {}


async function authenticationCheck(){
    const response = await fetch('/authorizationChecker/',{
        method: 'GET',
        credentials:"same-origin"
    })
    const data = await response.json()
    dataCopy.Authorized = data.Authorized
    const response2 = await fetch('/profile_edit/',{
        method:'GET',
        credentials:"same-origin"
    })
    const data2 = await response2.json()
    dataCopy.username = data2.name
    
    commentSubmission(dataCopy)
    console.log(dataCopy)
    if (dataCopy.Authorized){
        cartcountrenderer();
    };
}


authenticationCheck()


function commentSubmission(data){
    const userLogged = data.Authorized; // true if logged in
    const username = data.username; // dynamically set after login


    const submitBtn = document.getElementById("submit-comment");
    const commentText = document.getElementById("comment-text");
    const commentError = document.getElementById("comment-error");


    submitBtn.addEventListener("click", () => {


        commentError.textContent = ""; // clear previous error


        if (!userLogged) {
            commentError.textContent = "Please login to comment";
            return;
        }


        const text = commentText.value.trim();


        if (text === "") {
            commentError.textContent = "Comment cannot be empty";  
            return;
        }


    // Create comment
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment");        


    commentDiv.innerHTML = `
        <span class="comment-user">${username}</span>
        <span class="comment-time">• just now</span>
        <p class="comment-text">${text}</p>
        <div class="comment-actions">
            <button>Like</button>
            <button>Reply</button>
        </div>
    `;


    document.querySelector(".comment-section").appendChild(commentDiv); //adds comment at the last of comment section


    commentText.value = "";   //Resets comment after submitting comment
    });
}


// ---------- NAV AUTH FIX STARTS HERE ----------

const loginLink   = document.getElementById('Login');
const profileLink = document.getElementById('Profile');
const orderLink   = document.getElementById('Orders'); // ensure this id exists in HTML
const contactLinks = document.querySelectorAll('.contact');

fetch('/authorizationChecker/', {
    method: 'GET',
    credentials: 'same-origin'
})
.then(res => res.json())
.then(data => {
    const { Authorized } = data;

    if (Authorized) {
        // Hide Login if user is logged in
        if (loginLink) loginLink.style.display = 'none';

        // Cart button goes to cart
        if (openCartButton) {
            openCartButton.addEventListener('click', () => {
                window.location.href = '/cart/';
            });
        }

        // Contact links go to contact page
        contactLinks.forEach(contact => {
            contact.addEventListener('click', () => {
                window.location.href = '/contactUs/';
            });
        });
    } else {
        // Hide profile and orders if not logged in
        if (profileLink) profileLink.style.display = 'none';
        if (orderLink)   orderLink.style.display   = 'none';

        // Cart button goes to login
        if (openCartButton) {
            openCartButton.addEventListener('click', () => {
                window.location.href = '/login/';
            });
        }

        // Contact links go to login
        contactLinks.forEach(contact => {
            contact.addEventListener('click', () => {
                window.location.href = '/login/';
            });
        });

        // Reset cart count
        if (cartCount) cartCount.innerHTML = '0';
    }
})
.catch(err => {
    console.error('Auth check failed', err);
});
