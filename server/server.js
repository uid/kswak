var teacherList = ['rcm','sarivera']

Questions = new Meteor.Collection("questions");
Meteor.publish("questions", function () {
    return Questions.find();
});

Responses = new Meteor.Collection("responses");
Meteor.publish("responses", function () {
    return Responses.find();
});

AccountsTest = new Meteor.Collection("accountstest");
Meteor.publish("accountstest", function () {
    return AccountsTest.find();
});

var MASTER = 'asd651c8138';
var ENCRYPTION_KEY = "26bc!@!$@$^W64vc";

function getUsernameFromBase64(urlBase64String) {
    var realBase64String = Base64.decode64(urlBase64String.replace(/-/g, '+').replace(/\./g, '/').replace(/_/g, '='));
    var username = decryptAES(realBase64String, ENCRYPTION_KEY); //read key from server, do decrypt from server.
    return username;
}

function checkUser(username) {
    var exists = false;
    Meteor.users.findOne({username: username}) ? exists = true : exists = false;
    return exists;
}

//Creates an account and returns the id of that account.
function createAccount(username){
    var account_data = {
        username: username,
        user_email: username + '@mit.edu',
    };

    var exists = checkUser(username);
    if (!exists) {
    	var account_id;
    	if (teacherList.indexOf(username) == -1){
        	var account_id = Accounts.createUser({username: username, email: account_data['user_email'], password: MASTER, profile: {role: 'student'}});
        }
        else{
        	var account_id = Accounts.createUser({username: username, email: account_data['user_email'], password: MASTER, profile: {role: 'teacher'}});
        }
        user_signed_in = true;
        var id = AccountsTest.insert(account_data, function(err) {});
        console.log('at id:' + id);
    }

//    function callback(data) {
//        if (!data) {
//            var account_id = Accounts.createUser({username: username, email: account_data['user_email'], password: MASTER, profile: {role: 'student'}});
//            user_signed_in = true;
//            var id = AccountsTest.insert(account_data, function(err) {});
//            console.log('at id: ' + id);
//
//        } else { //user does exist
//            loginFlag = true;
//            Meteor.loginWithPassword(username, MASTER);
//        }
//    }

//    Meteor.call('checkUser',
//               username,
//               function(err, data){
//                   console.log('checkUser callback')
//                   console.log(data)
//                   callback(data);
//               });
}

Meteor.methods({
    kswak_login: function(encrypted_username) {
        var username = getUsernameFromBase64(encrypted_username);
        createAccount(username);
        return username;
    },
});
