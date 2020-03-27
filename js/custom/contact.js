function validateContact(){
    let $name = $("#contactName");
    let $email = $("#contactEmail");
    let $subject = $("#contactSubject");
    let $message = $("#contactMessage");

    let $errorMessage = $("#contactError");
    $errorMessage.text("");

    let nameReg = /^[A-Z][a-z]+$/;
    if(!nameReg.test($name.val())){
        $errorMessage.text("Name must start with capital letter and contain only lowercase letters.");
        return false;
    }

    let emailReg = /^[a-z]+[a-z\d]{2,}(\.[a-z\d]+)*@[a-z]{2,}(\.[a-z]{2,})+$/;
    if(!emailReg.test($email.val())){
        $errorMessage.text("Email can only contain lowercase letters and numbers and must contain @ symbol.");
        return false;
    }

    let subjectReg = /^[A-z\s-]+$/;
    if(!subjectReg.test($subject.val())){
        $errorMessage.text("Subject can only contain letters, white space and dash(-). ");
        return false;
    }

    if($message.val().length < 10){
        $errorMessage.text("Message must be longer than 10 characters.");
        return false;
    }

    alert("Message sent successfuly.");

    $name.val("");
    $email.val("");
    $subject.val("");
    $message.val("");

    return false;
}