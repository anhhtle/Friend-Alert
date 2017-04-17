# "Friend-Alert" Overview
This web app give user the ability to create an account and sign up emergency contacts. User can then set a countdown timer; when the timer expires, email alerts will be sent to contacts every hour until the alarm is turned off. The user can also opt-in to a "community". User's alerts will then be sent to other community members. In return, the user will recieve alerts from the community.

## Background
Friend-Alert plays on the concept of emergency contacts. This web app works best when you have an event, and knows how long it should take. Whether you are jogging at night alone or going on a blind date, you can have peace-of-mind that your emergency contacts will be notified if your alarm time expires. A unique feature of Friend-Alert is the "community" feature. If you do not have emergency contacts, or is not comfortable notifying your contacts for whatever reason, opting-in to the community will make sure that your alerts are read.

## Workflow
<ul>
    <li>Create an account</li>
    <li>Sign up your friends as emergency contacts</li>
    <ul>
        <li>Your friends will receive verification email</li>
    </ul>
    <li>(optional) Opt-in to "community"</li>
    <li>Write a small message to be sent out with your alerts</li>
    <li>Set the countdown clock</li>
    <li>When the timer expires, email alerts will be sent out</li>
    <ul>
        <li>Until you or one of your contacts turn off the alarm, alerts will be sent every hour</li>
    </ul>
</ul>

## Working version and screenshot
Use this link to try the app for yourself! https://friend-alert.herokuapp.com/index.html
![alt tag](https://github.com/anhhtle/Friend-Alert/blob/master/public/images/main.png)

## Technology
On the client side, the UI is coded with HTML and CSS and runs with Javascript and JQuery. The server side uses REST API and is coded with Nodejs with the express framework. The timer logic invole invoking a cronjob every minute. Mocha, Chai, and Travis CI is used for intergrated testing. The database of choice is Mongo and the app is hosted on Heroku.

## Future Enhancement
Add option for alerts to be send via text messages instead of email