let STATE = {
    email: '',
    password: '',
    name: '',
    contacts: [{
        name: '',
        email: '',
        verified: false,
    }],
    community: false,
    message: '',
    alarmTime: 0,
    alertOn: false
};

//********************* Navigation ***********************/
// click on logo to sign-out
$('.logo').on('click', () => {
    localStorage.clear();
    return window.location.href = "index.html";
});

// navigate
$('.navigation-ul').on('click', 'li', function() {
    $(this).addClass('active');
    $(this).siblings().removeClass('active');
    let id = $(this).attr('id');
    $(`.${id}`).siblings().addClass('hidden');
    $(`.${id}`).removeClass('hidden');
});

//*********************** API ******************************/

// GET active user
function getAJAX(){
    $.ajax({
        url: `https://friend-alert.herokuapp.com/user/${localStorage.email}`,
        dataType: 'json',
        success: function(data){
            STATE = data[0];
            renderAlarm();
        },
        error: function(err){
            console.error(err);
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
        error: function(err){
            console.log(err.responseText);
        }
    });
};

// DELETE user
function deleteAJAX(){
    $.ajax({
        url: `https://friend-alert.herokuapp.com/user/${localStorage.email}`,
        type: 'DELETE',
        success: function(data){
            localStorage.clear();
            return window.location.href = "index.html";
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

    if(STATE.alertOn === true){
        $('#alarm-on-button').addClass('hidden');
        $('#alarm-off-button').removeClass('hidden');
        $('.hour').prop('disabled', true);
        $('.min').prop('disabled', true);
        $('textarea').prop('disabled', true);
    }
    if(STATE.alertOn === false){
        $('#alarm-on-button').removeClass('hidden');
        $('#alarm-off-button').addClass('hidden');
        $('.hour').prop('disabled', false);
        $('.min').prop('disabled', false);
        $('textarea').prop('disabled', false);
    }
    
};


$('#alarm-on-button').on('click', function(event) {
    event.preventDefault();
    let hour = Number($('.hour').val());
    let min = Number($('.min').val());
    if(hour === 0 && min === 0)
        return alert('enter hour and/or min');
    if(hour < 0 || min < 0)
        return alert('enter positive numbers');

    // check contact for DEMO mode
    if(STATE.email = 'friend.alert.demo@gmail.com') {
        if(STATE.contacts.length === 0){
            $('#alarm-container').removeClass('active');
            $('#contact-container').addClass('active');
            $('.alarm-container').addClass('hidden');
            $('.contact-container').removeClass('hidden');
            return alert(`Demo mode: add at least one emergency contact in the 'Contacts' tab before setting alarm. Contacts will be automatically deleted after timer expires.`);
        }
    }

    // check for verified contact for MAIN mode
    else {
        if(STATE.community === false){
            let haveVerified = false;
            STATE.contacts.forEach((contact) => {
                if(contact.verified === true){
                    haveVerified = true;
                }
            });
            if(!haveVerified){
                $('#alarm-container').removeClass('active');
                $('#contact-container').addClass('active');
                $('.alarm-container').addClass('hidden');
                $('.contact-container').removeClass('hidden');
                return alert(`You do not have any verified emergency contacts; at least one contact is required to send alerts. You can add and manage your contacts in the "Contacts" tab.`);
            }
        }
    }

    // turn on alarm/update account
    $(this).addClass('hidden');
    $('#alarm-off-button').removeClass('hidden');
    STATE.message = $('textarea').val();
    let query = {hour: hour, min: min, message: STATE.message, alertOn: true};
    let url = `https://friend-alert.herokuapp.com/user/time/${localStorage.email}`;
    STATE.alarmTime = new Date(Date.parse(new Date()) + (hour * 60 * 60 * 1000) + (min * 60 * 1000));
    STATE.alarmTime = Math.floor(STATE.alarmTime / 1000 / 60);
    putAJAX(url, query);
    
    // disable input fields when alarm is active
    $('.hour').prop('disabled', true);
    $('.min').prop('disabled', true);
    $('textarea').prop('disabled', true);
});

$('#alarm-off-button').on('click', function(event) {
    event.preventDefault();
    $(this).toggleClass('hidden');
    $('#alarm-on-button').removeClass('hidden');
    $('.hour').val(0);
    $('.min').val(0);
    STATE.message = '';
    $('textarea').val(STATE.message);
    let query = {hour: 0, min: 0, message: '', alertOn: false};
    let url = `https://friend-alert.herokuapp.com/user/time/${localStorage.email}`;
    $('.hour').prop('disabled', false);
    $('.min').prop('disabled', false);
    $('textarea').prop('disabled', false);
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
        let template = $(
            `<div class="contact-card">
                <h2>${contact.name}</h2>
                <h3>${contact.email}</h3>
                <h5>${verified}</h5>
                <button id="${i}" class="contact-delete">Delete</button>
            </div>`
        );
        if(localStorage.email === 'friend.alert.demo@gmail.com'){
            template = $(
                `<div class="contact-card">
                    <h2>${contact.name}</h2>
                    <h3>${contact.email}</h3>
                    <button id="${i}" class="contact-delete">Delete</button>
                </div>`
            );
        }
        container.append(template);
    });

};

$('.contact-form').on('submit', (event) => {
    event.preventDefault();
    let url = `https://friend-alert.herokuapp.com/user/${localStorage.email}`;
    processContact(url);
    renderContacts();
})

//delete contact
$('.contacts-results').on('click', 'button', function(event) {
    event.stopPropagation();
    let index = $(this).attr('id');
    STATE.contacts.splice(index, 1);
    let query = {contacts: STATE.contacts};
    let url = `https://friend-alert.herokuapp.com/user/${localStorage.email}`;
    putAJAX(url, query);
    renderContacts();
});

//********************** Manage Account ************************/

function renderAccount(){
    $('#account-email').val(STATE.email);
    $('#account-password').val(STATE.password);
    $('#account-name').val(STATE.name);
    if(STATE.community === true)
        $('#account-community').prop('checked', 'true');
};

// reset button
$('#account-reset').on('click', (event) => {
    event.preventDefault();
    renderAccount();
});

// save button
$('#account-submit').on('click', (event) => {
    event.preventDefault();
    let url = `https://friend-alert.herokuapp.com/user/${localStorage.email}`
    if(STATE.password != $('#account-password').val())
        STATE.password = $('#account-password').val();
    STATE.email = $('#account-email').val();
    STATE.name = $('#account-name').val();
    STATE.community = $('#account-community').prop('checked');
    localStorage.email = STATE.email;
    let query = {email: STATE.email, password: STATE.password, name: STATE.name, community: STATE.community};
    putAJAX(url, query);
    renderAccount();
});

// delete button
$('#account-delete').on('click', (event) => {
    event.preventDefault();
    if(confirm('Are you sure?'))
        deleteAJAX();
})

//********************* Demo Mode ******************************
function demoMode(){
    if(localStorage.email === 'friend.alert.demo@gmail.com'){
        $('.contact-container h3').html(`A verification email will be sent to new contact<p class="demo">(Disabled verification for demo mode)</p>`);
        $('.account-container h2').html(`Manage your account<p class="demo">(Disabled for demo mode)</p>`);
        $('.account-input').prop('disabled', true);
        $('.account-button').prop('disabled', true);
    };
};

//********************* run after DOM load ********************

$(function() {
    // check localStorage.email === null .... redirect to sign-in
    if(localStorage.email === undefined){
        return window.location.href = "index.html";
    }

    getAJAX();
    setInterval(() => {
        getAJAX();
    }, 60000);


    setTimeout(() => {
        renderContacts();
        renderAccount();
        $('textarea').val(STATE.message);
    }, 1500);

    demoMode()
});