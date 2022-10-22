if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}
function ready() {
    var removeCartItemButtons = document.getElementsByClassName('btn-danger')
    for (var i = 0; i < removeCartItemButtons.length; i++) {
        var button = removeCartItemButtons[i]
        button.addEventListener('click', removeCartItem)
    }
    var quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i];
        input.addEventListener('change', quantityChanged);
    }

    var addToCartButtons = document.getElementsByClassName('shop-item-button')
    for (var i = 0; i < addToCartButtons.length; i++) {
        var button = addToCartButtons[i]
        button.addEventListener('click', addToCartClicked)
    }

    

   
}




function purchaseClicked() {
    alert('Thank you for your purchase')
    var cartItems = document.getElementsByClassName('cart-items')[0]
    while (cartItems.hasChildNodes()) {
        cartItems.removeChild(cartItems.firstChild)
    }
    updateCartTotal()
}

function deleteRow(r) {
    var i = r.parentNode.parentNode.rowIndex;
    document.getElementById("table").deleteRow(i-3);
    updateCartTotal()
}

function removeCartItem(event) {
    var cartItemRow = document.getElementsByClassName('cart-row')[0];
    console.log(cartItemRow)
    var buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()
}
function quantityChanged(event) {
    var input = event.target
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1
    }
    updateCartTotal()
}
function addToCartClicked(event) {
    console.log('yesssssssssss');
    var button = event.target
    var shopItem = button.parentElement.parentElement
    var title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
    var price = shopItem.getElementsByClassName('shop-item-price')[0].innerText
    var category = shopItem.getElementsByClassName('shop-item-category')[0].innerText
    var subMenu = shopItem.getElementsByClassName('shop-item-submenu')[0].innerText
    console.log(category +'plus' +subMenu)
    var quantity = shopItem.getElementsByClassName('quantity')[0].value;
    var totalPrice = price*quantity
    console.log(totalPrice)

    console.log(price)
    
    addItemToCart(title, price, quantity, totalPrice, category, subMenu)
    updateCartTotal(price)
}
function addItemToCart(title, price, quantity, totalPrice, category, subMenu) {
    

   
       var cartRow = document.getElementById('table').insertRow();
    var cartRowContents = `
    <tr class="cart-row" style="margin-bottom: 5px">
            <td class="cart-item-title "> ${title}</td>
             <td class="cart-item-quantity"> <span style="display:none" class="cartq" >${quantity}</span><input class="cart-quantity-input" type="number" value="${quantity}"></td>
            <td class="cart-price">${totalPrice}</td>
           
            <td class="cart-category"> ${category}</td>
            <td class="cart-submenu"> ${subMenu}</td>
            <td > <a href="javascript:void(0)" onclick="deleteRow(this)" class="delete"> <i class="m-r-10 mdi mdi-delete"></i></a> </td>
            <td style="display: none"> <input class="cart-quantity-price" type="hidden" value="${price}"></td>
        </tr>
`
    cartRow.innerHTML = cartRowContents;
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged)
}


function quantityChanged(event) {
    var input = event.target

    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1
    }
    console.log('yesssssssssss');
    
    var shopItem = input.parentElement.parentElement
    var inputVal = shopItem.getElementsByClassName('cart-quantity-input')[0]
    console.log('input value is ',inputVal)
    var cartQ = shopItem.getElementsByClassName('cartq')[0]
    console.log('cartq is ',cartQ)
    console.log(input.value)
    var newValue = input.value;
    inputVal.value = newValue
    cartQ.innerText = input.value
    var price = shopItem.getElementsByClassName('cart-quantity-price')[0].value
    var newtotal = price * newValue
    var cartPrice = shopItem.getElementsByClassName('cart-price')[0];
    console.log(price)
    cartPrice.innerText = newtotal
    updateCartTotal(price)
}


function updateCartTotal(price) {
    var itemPrices = document.querySelectorAll("[class='cart-price']");
    var total = 0;
    for (var i=0;i<itemPrices.length;i++) {
        var a = itemPrices[i].innerText
        numPrice = parseFloat(a)
       
        var total = total + numPrice;
        console.log( total)
        total = Math.round(total * 100) / 100
        document.getElementsByClassName('cart-total-price')[0].innerText =  total
    }
    console.log(itemPrices)
    
}

