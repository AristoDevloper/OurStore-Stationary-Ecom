const OrderID = document.getElementById('orderId')
const PaymentMethod = document.getElementById('paymentType')

order_id = sessionStorage.getItem('orderId');
const payment_method = sessionStorage.getItem('Payment-Type');

OrderID.innerHTML = order_id;
PaymentMethod.innerHTML = payment_method;

if (payment_method == 'Esewa Payment'){
    fetch('/paymentCompleted/',{
        method:'POST',
        credentials:"same-origin",
        headers : {
            "Content-Type" : "application/json",
        },
        body:JSON.stringify({orderId:order_id})
    })
    .then(res=>res.json())
    .then(data=>{
        console.log(data)
    })
}