const ordersWrapper = document.getElementById('orders-wrapper');

fetch('/orderDetails/', {
    method: 'POST',
    credentials: "same-origin",
    headers: {
        "Content-Type": "application/json",
    },
})
.then(res => res.json())
.then(data => {
    const orders = Array.isArray(data) ? data : [data];
    orders.forEach(renderOrder);
});

function renderOrder(order) {
    const {
        order_id,
        purchased_products,
        total_cost,
        payment_type,
        order_status,
        payment_status,
        delivered,
        address
    } = order;

    const codCharge = payment_type === 'CASH ON DELIVERY' ? 20 : 0;
    const deliveryCharge = 150;

    const orderDiv = document.createElement('div');
    orderDiv.style.marginBottom = '40px';
    console.log(payment_status,address)

    orderDiv.innerHTML = `
        <h1>Order Details</h1>

        <div class="order-summary">
            <div class="summary-box">
                <span>Order ID</span>
                <strong>${order_id}</strong>
            </div>

            <div class="summary-box">
                <span>Payment Method</span>
                <strong>${payment_type}</strong>
            </div>

            <div class="summary-box">
                <span>Order Status</span>
                <strong class="status">${order_status}</strong>
            </div>

            <div class="summary-box">
                <span>Delivery Address</span>
                <strong>${address}</strong>
            </div>
            
            <div class="summary-box">
                <span>Delivered</span>
                <strong class="${delivered ? 'yes' : 'no'}">
                    ${delivered ? 'Yes' : 'No'}
                </strong>
            </div>

            <div class="summary-box">
                <span>Paid</span>
                <strong class="${payment_status=== 'PAID' ? 'yes' : 'no'}">
                    ${payment_status=== 'PAID' ? 'Yes' : 'No'}
                </strong>
            </div>
        </div>

        <div class="order-items">
            <div class="items">
                ${purchased_products.map(item => `
                    <div class="item">
                        <div>
                            <div class="item-name">${item.product.product_name}</div>
                            <div class="item-qty">Qty: ${item.quantity}</div>
                        </div>
                        <div class="item-price">Rs. ${item.product.price * item.quantity}</div>
                    </div>
                `).join('')}
            </div>

            <div class="Delivery-charge">
                <span>Delivery Charge</span>
                <span>Rs. ${deliveryCharge}</span>
            </div>

            ${payment_type === 'CASH ON DELIVERY' ? `
                <div class="codCharge">
                    <span>Extra COD Charge</span>
                    <span>Rs. ${codCharge}</span>
                </div>
            ` : ''}

            <div class="total">
                <span>Total</span>
                <span>Rs. ${total_cost}</span>
            </div>

            ${order_status === 'PENDING' ? `
                <div class="complete-order">
                    <button class="complete-order-btn"
                        onclick="handleCompleteOrder('${order_id}', '${payment_type}')">
                        Complete Order
                    </button>
                </div>
            ` : ''}
        </div>
    `;

    ordersWrapper.appendChild(orderDiv);

window.handleCompleteOrder=function (orderId, paymentType) {
    // Save order id
    sessionStorage.setItem('orderId', orderId);

    // Save payment type properly
    if (paymentType === 'CASH ON DELIVERY') {
        sessionStorage.setItem('Payment-Type', 'COD');
        window.location.href = '/confirmCOD/';
    } else {
        sessionStorage.setItem('Payment-Type', 'Esewa Payment');
        window.location.href = '/eSewaPaymentConfirm/';
    }
}
}