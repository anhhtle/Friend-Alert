let STATE = {
    userEmail: '',
    userPassword: '',
    userName: '',
};

//************* AJAX *******************/

// GET active user
function getAJAX(url){

    $.ajax({
        url: url,
        dataType: 'json',
        success: function(data){
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
        },
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
        success: function(data){
            console.log(data);
        },
        error: function(err){
            console.error(err.responseText);
        }
    });

};

//********** Sign-in Page **************/

//require email and password
function validateInput(){
    if($('.email').val() === ''){
        $('.sign-in-message').text('Missing email');
        $('.sign-in-message').removeClass('hidden');
        return false;
    }
    if($('.password').val() === ''){
        $('.sign-in-message').text('Missing password');
        $('.sign-in-message').removeClass('hidden');
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
        let url = `https://friend-alert.herokuapp.com/user/${STATE.userEmail}`;
        getAJAX(url);
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
        toggle();
    }
});

//************ toggle sign-in and create account
function toggle(){
    const form = $('form');
    form.children('.name').slideToggle();
    form.children('.phone').slideToggle();
    form.children('button').toggleClass('hidden');
    form.siblings('div').addClass('hidden');
    form.siblings('p').text() === 'Create an account' ?
    form.siblings('p').text('Sign in') : form.siblings('p').text('Create an account'); 
};

$('.toggle').on('click', () => {
    toggle();
});
