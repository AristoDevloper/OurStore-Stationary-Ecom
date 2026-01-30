const subTotal = document.getElementById('subtotal');
const COD_charge = document.getElementById('COD-charge');
const Total = document.getElementById('total');
const order_id = sessionStorage.getItem('orderId');
const totalPrice = sessionStorage.getItem('totalPrice');
const ChargeOnCOD = 20;
const actualTotalPrice = Number(totalPrice) + ChargeOnCOD

subTotal.innerHTML = `Rs. ${totalPrice}`
COD_charge.innerHTML = `Rs. ${ChargeOnCOD}`
Total.innerHTML = `Rs. ${actualTotalPrice}`

async function OrderSuccessRedirect(){
    sessionStorage.setItem('Payment-Type','Cash On Delivery');
    await fetch('/codorderconfirm/',{
        method:'POST',
        credentials:"same-origin",
        headers:{
            'Content-Type' : 'application/json',
        },
        body:JSON.stringify({orderId:order_id,ChargeOnCOD})
    })
    .then(res=>res.json())
    .then(data=>console.log(data))
    window.location.href = '/order_placed/';
}