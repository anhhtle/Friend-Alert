let STATE = {
    email: '',
    password: '',
    name: '',
    phone: 0,
    contacts: [{
        name: '',
        email: '',
        phone: 0,
        verified: false,
        opt_out: false
    }],
    community: false,
    startTime: 0,
    alarmTime: 0,
    alertOn: false
};

//********************* Navigation ***********************/
$('li').on('click', function() {
    $(this).addClass('active');
    $(this).siblings().removeClass('active');
    let id = $(this).attr('id');
    $(`.${id}`).siblings().addClass('hidden');
    $(`.${id}`).removeClass('hidden');
});

//*********************** API ******************************/

// GET active user
function getAJAX(url){
    $.ajax({
        url: url,
        dataType: 'json',
        success: function(data){
            STATE = data[0];
            renderAlarm();
            renderContacts();
            renderAccount();
            alert(`successful GET user ${STATE.email}`);
        },
        error: function(err){
            alert(err);
        }
    });
}; // end getAJAX

// PUT user
function putAJAX(url, query){
    $.ajax({
        url: url,
        data: JSON.stringify(query),
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
        success: function(data){
            console.log(data);
        },
        error: function(err){
            alert(err.responseText);
        }
    });
};

//************************ Manage alarm **************************

function renderAlarm(){

    let currentTime = Date.parse(new Date());
    currentTime = Math.ceil(currentTime / 1000 / 60);

    let time = STATE.alarmTime - currentTime;
    let hour = Math.floor(time / 60);
    let min = time % 60;

    console.log(time);

    if(time < 0){
        hour = 0;
        min = 0;
    }

    $('.hour').val(hour);
    $('.min').val(min);

    if(time > 0){
        $('#alarm-on-button').addClass('hidden');
        $('#alarm-off-button').removeClass('hidden');
    }
};


$('#alarm-on-button').on('click', function(event) {
    event.preventDefault();
    $(this).addClass('hidden');
    $('#alarm-off-button').removeClass('hidden');
    let hour = Number($('.hour').val());
    let min = Number($('.min').val());
    let query = {hour: hour, min: min};
    let url = `http://localhost:8080/user/time/${localStorage.email}`;
    putAJAX(url, query);
});

$('#alarm-off-button').on('click', function(event) {
    event.preventDefault();
    $(this).toggleClass('hidden');
    $('#alarm-on-button').removeClass('hidden');
    $('.hour').val(0);
    $('.min').val(0);
    let query = {hour: 0, min: 0};
    let url = `http://localhost:8080/user/time/${localStorage.email}`;
    putAJAX(url, query);
})

//*********************** Manage Contacts **********************/
function processContact(url){
    let name = $('#contact-name').val();
    let email = $('#contact-email').val();
    // check if email already exists
    let exists = false;
    STATE.contacts.forEach((contact) => {
        if(email === contact.email){
            exists = true;
            alert('email already registered');
        }
    });

    // update DATEBASE with new contact
    if(!exists){
        let obj = {name: name, email: email, phone: 0, verified: false, opt_out: false};
        STATE.contacts.push(obj);
        let query = {contacts: STATE.contacts};
        putAJAX(url, query);
    }
};

function renderContacts(){
    let container = $('.contacts-results');
    container.html('');
    if(STATE.contacts.length === 0)
        return;

    STATE.contacts.map((contact, i) => {
        let verified = 'verified';
        if(contact.verified === false){
            verified = 'Not verified';
        }
        var template = $(
            `<div class="contact-card">
                <h2>${contact.name}</h2>
                <h3>${contact.email}</h3>
                <h5></h5>
                <button id="${i}" class="contact-delete">Delete</button>
            </div>`
        );
        container.append(template);
    });


    // for(let i = 0; i < STATE.contacts.length; i++){
    // } // end for loop
};

$('.contact-form').on('submit', (event) => {
    event.preventDefault();
    let url = `http://localhost:8080/user/${localStorage.email}`;
    processContact(url);
    renderContacts();
})

//delete contact
$('.contacts-results').on('click', 'button', function(event) {
    event.stopPropagation();
    $(this).css('color', 'red');
});

//********************** Manage Account ************************/

function renderAccount(){
    $('#account-email').val(STATE.email);
    $('#account-password').val(STATE.password);
    $('#account-name').val(STATE.name);
    if(STATE.community === false)
        $('#account-community').prop('checked');
};

$('.account-form').on('submit', (event) => {
    event.preventDefault();
    let url = `http://localhost:8080/user/${localStorage.email}`
    getAJAX(url);
});

//********************* run after DOM load ********************

$(function() {
    // check localStorage.email === null .... redirect to sign-in
    let url = `http://localhost:8080/user/${localStorage.email}`;
    getAJAX(url);
    setInterval(renderAlarm, 60000);
});