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

//newer methods

//function getUsernameFromBase64(urlBase64String) {
//    var realBase64String = urlBase64String.replace(/-/g, '+').replace(/\./g, '/').replace(/_/g, '=');
//    var username = decryptAES(realBase64String, ENCRYPTION_KEY); //read key from server, do decrypt from server.
//    return username;
//}
//
////Creates an account and returns the id of that account.
//function createAccount(username){
//    var loginFlag = false;
//    var account_data = {
//        username: username,
//        user_email: username + '@mit.edu',
//    };
//
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
//
//}
//
//function kswak_login(encrypted_username) {
//    console.log('in kswak_login');
//    console.log('str: ' + encrypted_username);
//    var username = getUsernameFromBase64(encrypted_username);
//    console.log('finished base64: '+username);
//    var loginFlag = createAccount(username);
//    console.log('lf: ' + loginFlag);
//    return [username, loginFlag];
//    //BUGS:
//    //This method, when called, returns nothing and I need login flag
//    //Can't log in on server, need to do in client
//}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//
//function getUsernameFromBase64(urlBase64String) {
//    var realBase64String = Base64.decode64(urlBase64String.replace(/-/g, '+').replace(/\./g, '/').replace(/_/g, '='));
//    console.log('lets go deeper');
//    var username = decryptAES(realBase64String, ENCRYPTION_KEY); //read key from server, do decrypt from server.
//    return username;
//}
//
////Creates an account and returns the id of that account.
//function createAccount(username){
//    var loginFlag = false;
//    var account_data = {
//        username: username,
//        user_email: username + '@mit.edu',
//    };
//    var user = Meteor.users.findOne({username: username});
//    if (user == null) {
//        var account_id = Accounts.createUser({username: username, email: account_data['user_email'], password: MASTER, profile: {}});
//    } else { //user does exist
//        loginFlag = true;
//        //Meteor.loginWithPassword(user.username, MASTER); can't do this on the server...
//    }
//    return loginFlag;
//}
//
//function kswak_login(encrypted_username) {
//    console.log('in kswak_login');
//    var encrypted_string = encrypted_username['encrypted_username'];
//    console.log('str: ' + encrypted_string);
//    var username = getUsernameFromBase64(encrypted_string);
//    var loginFlag = createAccount(username);
//    return [username, loginFlag];
//    //BUGS:
//    //This method, when called, returns nothing and I need login flag
//    //Can't log in on server, need to do in client
//}
//
Meteor.methods({
    kswak_login: function(encrypted_username) {
        console.log('in kswak_login');
        console.log('str: ' + encrypted_username);
        var username = getUsernameFromBase64(encrypted_username);
        console.log('finished base64: '+username);
        var loginFlag = createAccount(username);
        console.log('lf: ' + loginFlag);
        return [username, loginFlag];
        //BUGS:
        //This method, when called, returns nothing and I need login flag
        //Can't log in on server, need to do in client
    },
    checkUser: function(username) {
        var f = false;
        Meteor.users.findOne({username: username}) ? f = true : f = false;
        return f;
    }
});//function getUsernameFromBase64(urlBase64String) {
//    var realBase64String = urlBase64String.replace(/-/g, '+').replace(/\./g, '/').replace(/_/g, '=');
//    var username = decryptAES(realBase64String, ENCRYPTION_KEY); //read key from server, do decrypt from server.
//    return username;
//}
