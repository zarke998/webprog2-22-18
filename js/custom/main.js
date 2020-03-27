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