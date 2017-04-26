let STATE = {
    userEmail: '',
    userPassword: '',
    userName: '',
};

//************* AJAX *******************/

// GET active user
function getAJAX(url, callback){
    $.ajax({
        url: url,
        dataType: 'json',
        success: callback,
        error: function(err){
            console.error(err);
        }
    });

}; // end getAJAX

// POST new user
function postAJAX(){
    $.ajax({
        url: 'https://friend-alert.herokuapp.com/user/',
        data: JSON.stringify({
            'email': STATE.userEmail,
            'password': STATE.userPassword,
            'name': STATE.userName,
        }),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        error: function(err){
            $('.sign-in-message').removeClass('hidden');
            $('.sign-in-message').text('Email already registered');
        }
    });
};


//********** Sign-in Page **************/

//require email and password
function validateInput(){
    let signInMessage = $('.sign-in-message');
    // check email is empty
    if($('.email').val() === ''){
        signInMessage.text('Missing email');
        signInMessage.removeClass('hidden');
        return false;
    }
    // check password is empty
    if($('.password').val() === ''){
        signInMessage.text('Missing password');
        signInMessage.removeClass('hidden');
        return false;
    }
    // check email input is in correct pattern
    const emailExp = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if(!emailExp.test($('.email').val())){
        signInMessage.text('Enter valid email');
        signInMessage.removeClass('hidden');
        return false;
    }
    return true;
};

//********* Sign-in
function processInput(data){
    if(data.length === 1){
        if(data[0].password === STATE.userPassword){
            // navigate to main page
            $('.sign-in-message').addClass('hidden');
            localStorage.setItem('email', STATE.userEmail);
            return window.location.href = 'main.html';
        }
        else{
            $('.sign-in-message').removeClass('hidden');
            $('.sign-in-message').text('Incorrect password');
            return;
        }
    }
    $('.sign-in-message').removeClass('hidden');
    $('.sign-in-message').text('E-email not registered');
};

$('.sign-in-button').on('click', (event) => {
    event.preventDefault();
    if(validateInput()) {
        STATE.userEmail = $('.email').val();
        STATE.userPassword = $('.password').val();
        let url = `https://friend-alert.herokuapp.com/user/${STATE.userEmail}`;
        getAJAX(url, processInput);
    }
});

//********** Create new user

$('.create-account-button').on('click', (event) => {
    event.preventDefault();
    if($('.name').val() === ''){
        $('.sign-in-message').text('Missing name');
        $('.sign-in-message').removeClass('hidden');
        return;
    }
    if(validateInput()) {
        STATE.userEmail = $('.email').val();
        STATE.userPassword = $('.password').val();
        STATE.userName = $('.name').val();
        postAJAX();
        reset();
        $('.signIn').addClass('hidden');
    }
});

//************ Email password **********************
// Get (send password email)
function getPwAJAX(url){
    $.ajax({
        url: url,
        dataType: 'json',
        success: function(){
            $('.sign-in-message').addClass('hidden');
            return alert('Check your email for your new password');
        },
        error: function(err){
            console.error(err);
        }
    });
}

function checkEmailExists(data){
    if(data.length === 0){
        $('.sign-in-message').removeClass('hidden');
        $('.sign-in-message').text('Email not registered');
    }
    else{
        let url = `https://friend-alert.herokuapp.com/user/pw/${STATE.userEmail}`;
        getPwAJAX(url);
    }
}

$('.email-password-button').on('click', (event) => {
    event.preventDefault();
    STATE.userEmail = $('.email').val();
    if(STATE.userEmail === ''){
        $('.sign-in-message').removeClass('hidden');
        $('.sign-in-message').text('Enter an email');
        return;
    }
    let url = `https://friend-alert.herokuapp.com/user/${STATE.userEmail}`;
    getAJAX(url, checkEmailExists);
});

//************ toggle sign-in and create account
const form = $('form');

function reset(){
    form.children('.password').removeClass('hidden');
    form.children('.name').addClass('hidden');
    form.children('.sign-in-button').removeClass('hidden');
    form.children('.create-account-button').addClass('hidden');
    form.children('.email-password-button').addClass('hidden');
    form.siblings('.sign-in-message').addClass('hidden');
    form.siblings('.create-account').removeClass('hidden');
    form.siblings('.reset').addClass('hidden');
}

$('.create-account').on('click', function(){
    form.children('.password').removeClass('hidden');
    form.children('.name').removeClass('hidden');
    form.children('.sign-in-button').addClass('hidden');
    form.children('.create-account-button').removeClass('hidden');
    form.children('.email-password-button').addClass('hidden');
    form.siblings('.sign-in-message').addClass('hidden');
    form.siblings('.signIn').removeClass('hidden');
    form.siblings('.forgot-password').removeClass('hidden');
    form.siblings('.reset').addClass('hidden');
    $(this).addClass('hidden');
});

$('.signIn').on('click', function(){
    reset();
    $(this).addClass('hidden');
});

//*************** Toggle Forgot password and Reset ********************/
$('.forgot-password').on('click', function() {
    form.children('.password').addClass('hidden');
    form.children('.name').addClass('hidden');
    form.children('.sign-in-button').addClass('hidden');
    form.children('.create-account-button').addClass('hidden');
    form.children('.email-password-button').removeClass('hidden');
    form.siblings('.sign-in-message').addClass('hidden');
    form.siblings('.reset').removeClass('hidden');
    $(this).addClass('hidden');
});

$('.reset').on('click', function(){
    reset();
    form.siblings('.create-account').removeClass('hidden');
    form.siblings('.forgot-password').removeClass('hidden');
    $(this).addClass('hidden');
});

//*************************** Demo Mode *******************************/
$('.demo').on('click', () => {
    localStorage.setItem('email', 'friend.alert.demo@gmail.com');
    return window.location.href = 'main.html';
});