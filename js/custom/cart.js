let cart = [];

$(document).ready(function(){
    if(!localStorage){
        alert("Your system doesn't support local storage. You will be redirected in 5 seconds.");
        setTimeout(function(){
            location.href = "index.html";
        },5000);
    }
    else{
        getCartFromStorage();
        initializeCartProductList();
    }
});
///////////////////////////////////////////////////////////////////////////// EVENTS
function updateQuantity(){
    let quantity = this.value;
    let productId = this.dataset.prodid;

    if(quantity == 0){
        if(confirm("You are about to delete this product from the cart. Are you sure?")){
            removeItemFromCart(productId);
            $(this).closest(".cartProductItem").remove();

            if(cart.length == 0)
                localStorage.removeItem("cart");
            else
                localStorage.setItem("cart", JSON.stringify(cart));

        }
        else{
            this.value = 1;
            $(this).change();
        }
    }
    else{
        updateQuantityInCart(productId, quantity);
        let productPrice = $(this).closest(".cartProductItem").find(".productPrice").text();
        productPrice = parseFloat(productPrice.substring(1));

        let totalPrice = productPrice * quantity;
        totalPrice = Math.round(totalPrice*100 + Number.EPSILON) / 100;
        $(this).closest(".cartProductItem").find(".productTotalPrice").text(`$${totalPrice}`);
    }
}
//////////////////////////////////////////////////////////////////////////// FUNCTIONS
function initializeCartProductList(){
    let $cartProductList = $("#cartProductList");

    if(cart.length == 0){
        let $cartInfo = $("<tr></tr>");
        $cartInfo.html(`<td colspan="4"><h4 class="text-center cartProductListInfo">There are no items in the cart</h4></td>`);
        $cartProductList.prepend($cartInfo);
        return;
    }

    getJsonProducts(function(data){
        let cartIds = cart.map(p => p.id);

        let cartProducts = data.filter(p => {
            return cartIds.includes(p.id);
        });

        cartProducts = getProductsArray(cartProducts);

        cartProducts.forEach(p => {
            let productQuantity = cart.find(cartProduct => cartProduct.id == p.id).quantity;
            $cartProductList.prepend(createCartProductItem(p, productQuantity));
        });

        $(".productQuantity").change(updateQuantity);
    });
}
function getCartFromStorage(){
    let cartProducts = localStorage.getItem("cart");

    if(cartProducts != null)
        cart = JSON.parse(cartProducts);
}
function removeItemFromCart(productId){
    let prodToRemove = cart.findIndex(p => p.id == productId);
    cart.splice(prodToRemove,1);
}
function updateQuantityInCart(productId, quantity){
    cart.find(p => p.id == productId).quantity = quantity;
    localStorage.setItem("cart", JSON.stringify(cart));
}
function createCartProductItem(product, quantity){
    let price = getCurrentPrice(product.price);
    let totalPrice = (price * quantity);
    totalPrice = Math.round((totalPrice + Number.EPSILON) * 100) / 100;

    let $itemContainer = $(`<tr class="cartProductItem"></tr>`);
    let itemContent = `
    <td>
        <div class="media">
            <div class="d-flex">
                <img src="${product.image.src}" alt="${product.image.alt}">
            </div>
            <div class="media-body">
                <p>${product.title}</p>
            </div>
        </div>
    </td>
    <td>
        <h5 class="productPrice">$${price}</h5>
    </td>
    <td>
        <div class="product_count">
            <input type="text" name="qty" data-prodid="${product.id}" id="sst${product.id}" class="productQuantity" maxlength="12" value="${quantity}" title="Quantity:"
                class="input-text qty">
            <button onclick="var result = document.getElementById('sst${product.id}'); var sst = result.value; if( !isNaN( sst )) result.value++;$(result).change();return false;"
                class="increase items-count" type="button"><i class="lnr lnr-chevron-up"></i></button>
            <button onclick="var result = document.getElementById('sst${product.id}'); var sst = result.value; if( !isNaN( sst ) &amp;&amp; sst > 0 ) result.value--;$(result).change();return false;"
                class="reduced items-count" type="button"><i class="lnr lnr-chevron-down"></i></button>
        </div>
    </td>
    <td>
        <h5 class="productTotalPrice">$${totalPrice}</h5>
    </td>`;

    $itemContainer.html(itemContent);
    return $itemContainer;

    function getCurrentPrice(price){
        return price.newPrice ? price.newPrice : price.oldPrice;
    }
}
function getProductsArray(products) {
    let productsCache = [];
    products.forEach(p => {
        let prod = new Product(p.id, `${p.name} - ${p.brand.name}`,p.description, p.dateReleased, p.img, p.specifications.deckWidth, p.specifications.deckLength, p.specifications.truckHeight, p.specifications.wheelbase, p.price);
        productsCache.push(prod);
    });

    return productsCache;
}
function getJsonProducts(callbackSuccess, callbackError, async) {
    let ajaxAsync;
    if(async == null)
        ajaxAsync = true;
    else
        ajaxAsync = async;

    $.ajax({
        url: "data/data.json",
        method: "GET",
        async: ajaxAsync,
        dataType: "json",
        success: function (data) {
            if (callbackSuccess != null)
                callbackSuccess(data.products);
        },
        error: function (xhr, errType, errMsg) {
            if (callbackError != null)
                callbackError(xhr.responseText);
        }
    });
}