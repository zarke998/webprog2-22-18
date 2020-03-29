$(document).ready(function(){
    $("#newsletterSignup").click(validateNewsletter);
    
});

function validateNewsletter(){
    let email = $("#newsletterEmail").val();
    let emailReg = /^[a-z]+[a-z\d]{2,}(\.[a-z\d]+)*@[a-z]{2,}(\.[a-z]{2,})+$/;

    let $newsletterError = $("#newsletterError");
    $newsletterError.text("");

    if(!emailReg.test(email)){
        $newsletterError.text("Email can contain only lowercase letters and numbers and must contain @.");
        return;
    }

    if(localStorage){
        if(localStorage.getItem("newsletterEmail") && localStorage.getItem("newsletterEmail") == email){
            alert("You have already signed up for newsletter.");
            return;
        }
        else
            localStorage.setItem("newsletterEmail", email);
    }

    alert("Sign up successful.");
}

function addToCart(e){
    e.preventDefault();

    let productId = parseInt(this.dataset.id);

    if(localStorage){
        let cart = localStorage.getItem("cart");
        if(cart){
            cart = JSON.parse(cart);
            let currentItem = cart.find(p => p.id == productId);

            if(typeof currentItem == "undefined"){
                currentItem = {
                    id: productId,
                    quantity: 1
                };
                cart.push(currentItem);
            }
            else{
                currentItem.quantity++;
            }
            let json = JSON.stringify(cart);
            localStorage.setItem("cart", json);
        }
        else{
            cart = [
                {
                    id: productId,
                    quantity: 1 
                }
            ];
            let json = JSON.stringify(cart);
            localStorage.setItem("cart", json);
        }

        alert("Product added to cart.");
    }
    else{
        alert("Error adding product to bag. Your system doesn't support local storage.");
    }
}