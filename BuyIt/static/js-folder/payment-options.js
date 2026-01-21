//total Price render
const TotalPrice = document.getElementById('total');
const Total = sessionStorage.getItem('totalPrice');

TotalPrice.innerHTML = `Total: Rs.${Total}`;

const orderType = sessionStorage.getItem('Order-Type');


const body = {
    Total, orderType
}

// To create body to be used for sending data request in backend as per the order type

    if (orderType==='DirectOrder'){
        const productId = sessionStorage.getItem('productId');
        const quantity = sessionStorage.getItem('quantity');
        body.productId = productId;
        body.quantity = quantity; 
        console.log(productId)
    }

// eSewa button
document.getElementById('esewa-btn').addEventListener('click', async () => {
    alert("Redirecting to eSewa checkout...");

    if (orderType === 'CartOrder' || orderType === 'DirectOrder') {
        const paymentType = 'Esewa Payment'
        body.paymentType = paymentType
        await place_order(body)
        window.location.href="/eSewaPaymentConfirm/";
    }
    else{
        document.innerHTML = 'NOT VALID ORDER!!!'
    }
});

// Cash on Delivery button
document.getElementById('cod-btn').addEventListener('click',async () => {
    alert("Order placed! You will pay upon delivery.");

    if (orderType === 'CartOrder' || orderType === 'DirectOrder') {
        const paymentType = 'COD'
        body.paymentType = paymentType
        await place_order(body)
        window.location.href = '/confirmCOD/';
    }
    else{
        document.innerHTML = 'NOT VALID ORDER!!!'
    }
    
});

async function place_order(body){
    response = await fetch('/orderPlace/',{
        method:'POST',
        credentials:"same-origin",
        headers:{
            "Content-Type" : "application/json",
        },
        body:JSON.stringify(body)
    })
    data = await response.json()
    console.log(data);
    const {order_id} = data
    sessionStorage.setItem('orderId',order_id)
}