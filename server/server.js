Questions = new Meteor.Collection("questions");
Meteor.publish("questions", function () {
    return Questions.find();
});

var MASTER = 'asd651c8138'
var ENCRYPTION_KEY = "26bc!@!$@$^W64vc"

function getUsernameFromBase64(urlBase64String) {
    var realBase64String = Base64.decode64(urlBase64String.replace(/-/g, '+').replace(/\./g, '/').replace(/_/g, '='));
    console.log('lets go deeper');
    var username = decryptAES(realBase64String, ENCRYPTION_KEY); //read key from server, do decrypt from server.
    return username;
}

//Creates an account and returns the id of that account.
function createAccount(username){
    var loginFlag = false;
    var account_data = {
        username: username,
        user_email: username + '@mit.edu',
    };
    var user = Meteor.users.findOne({username: username});
    if (user == null) {
        var account_id = Accounts.createUser({username: username, email: account_data['user_email'], password: MASTER, profile: {}});
    } else { //user does exist
        loginFlag = true;
        //Meteor.loginWithPassword(user.username, MASTER); can't do this on the server...
    }
    return loginFlag;
}

Meteor.methods({
    kswak_login: function(encrypted_username) {
        console.log('in kswak_login');
        var encrypted_string = encrypted_username['encrypted_username'];
        console.log('str: ' + encrypted_string);
        var username = getUsernameFromBase64(encrypted_string);
        var loginFlag = createAccount(username);
        return [username, loginFlag];
        //BUGS:
        //This method, when called, returns nothing and I need login flag
        //Can't log in on server, need to do in client
        //
    }

});

