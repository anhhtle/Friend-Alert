let STATE = {
    userEmail: '',
    userPassword: '',
    userName: '',
    userPhone: 0
};

//************* AJAX *******************/

// GET active user
function getAJAX(url){

    $.ajax({
        url: url,
        dataType: 'json',
        success: function(data){
            if(data.length === 1){
                if(STATE.userPassword !== data[0].password)
                    return alert('invalid password');
                console.log(data);
                // navigate to main page
                localStorage.setItem('email', STATE.userEmail);
                return window.location.href = "index.html";
            }
            return alert('invalid email');
        },
        error: function(err){
            alert(err);
        }
    });

}; // end getAJAX

// POST new user
function postAJAX(){
    $.ajax({
        url: 'http://localhost:8080/user/',
        data: JSON.stringify({
            'email': STATE.userEmail,
            'password': STATE.userPassword,
            'name': STATE.userName,
            'phone': STATE.userPhone
        }),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        success: function(data){
            console.log(data);
            alert('client side POST Success');
        },
        error: function(err){
            alert(err.responseText);
        }
    });

};

//********** Sign-in Page **************/

//require email and password
function validateInput(){
    if($('.email').val() === ''){
        alert('missing email');
        return false;
    }
    if($('.password').val() === ''){
        alert('missing password');
        return false;
    }
    return true;
}

//********* Sign-in

$('.sign-in-button').on('click', (event) => {
    event.preventDefault();
    if(validateInput()) {
        STATE.userEmail = $('.email').val();
        STATE.userPassword = $('.password').val();
        let url = `http://localhost:8080/user/${STATE.userEmail}`;
        getAJAX(url);
    }
});

//********** Create new user

$('.create-account-button').on('click', (event) => {
    event.preventDefault();
    if(validateInput()) {
        STATE.userEmail = $('.email').val();
        STATE.userPassword = $('.password').val();
        STATE.userName = $('.name').val();
        STATE.userPhone = $('.phone').val();
        postAJAX();
    }
});

//************ toggle sign-in and create account
$('.toggle').on('click', () => {
    const form = $('form');
    form.children('.email').toggleClass('border');
    form.children('.password').toggleClass('border');
    form.children('.name').slideToggle();
    form.children('.phone').slideToggle();
    form.children('button').toggleClass('hidden');
    form.siblings().text() === 'Create an account' ?
        form.siblings().text('Sign in') : form.siblings().text('Create an account'); 
});
