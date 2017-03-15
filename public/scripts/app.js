let STATE = {
    userEmail: '',
    userPassword: '',
};

//************* AJAX *******************/

// GET active user
function getAJAX(url){

    let respond;

    $.getJSON(url, function(res){
        if(res.length === 1){
            if(STATE.userPassword !== res[0].password)
                return alert('invalid password');
            respond = res;
            console.log(respond);
            return alert('success get AJAX');
        }
        return alert('invalid email');
    });

    /*fetch(url, {method: 'get'})
    .then(function(res) {
        console.log(res);
    })
    .catch(function(err) {
        console.error(err);
    });*/

}; // end getAJAX

// POST new user
function postAJAX(){
    alert(STATE.userEmail + ' ' + STATE.userPassword);
    $.ajax({
        url: 'http://localhost:8080/user/',
        data: {email: STATE.userEmail, password: STATE.userPassword},
        type: 'POST',
        dataType: 'json',
        success: function(){
            alert('client side POST Success');
        },
        error: function(err){
            console.log(err);
            alert('client side POST error');
        }
    });
};

//********** Sign-in Page **************/

//********* Sign-in
function validateSignIn(email) {
    let url = `http://localhost:8080/user/${email}`;
    getAJAX(url);
};

$('.sign-in-form').on('submit', (event) => {
    event.preventDefault();
    STATE.userEmail = $('.email').val();
    STATE.userPassword = $('.password').val();
    validateSignIn(STATE.userEmail);
});

//********** Create new user

$('.create-account').on('click', () => {
    STATE.userEmail = $('.email').val();
    STATE.userPassword = $('.password').val();
    postAJAX();
});
