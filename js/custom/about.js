function validateBusinessForm(){

    let $email = $("#businessEmail");
    let $message = $("#businessMessage");

    let $errorMessage = $("#businessError");
    $errorMessage.text("");

    let emailReg = /^[a-z]+[a-z\d]{2,}(\.[a-z\d]+)*@[a-z]{2,}(\.[a-z]{2,})+$/;
    if(!emailReg.test($email.val())){
        $errorMessage.text("Email can only contain lowercase letters and numbers and must contain @ symbol.");
        return false;
    }

    if($message.val().length < 10){
        $errorMessage.text("Message must be longer than 10 characters.");
        return false;
    }

    alert("Inquiry sent successfuly.");

    $email.val("");
    $message.val("");

    return false;
}