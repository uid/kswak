Teachers = new Meteor.Collection("teachers");
Teachers.insert({username:"rcm"});
Teachers.insert({username:"robsoto"});


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

var MASTER = 'asd651c8138'; //used to generate the users password. concat. to end of username and run md5 algorithm on that for user password.
var ENCRYPTION_KEY = "26bc!@!$@$^W64vc"; //used for AES encryption, which is ultimately used to decrypt the encrypted username in the url.

//Returns a username from the base64 string in the login/:encrypted_info path.
function getUsernameFromBase64(urlBase64String) {
    var realBase64String = Base64.decode64(urlBase64String.replace(/-/g, '+').replace(/\./g, '/').replace(/_/g, '='));
    var username = decryptAES(realBase64String, ENCRYPTION_KEY); //read key from server, do decrypt from server.
    return username;
}

//Checks if a user exists. If they do, returns true.
function checkUser(username) {
    var exists = false;
    Meteor.users.findOne({username: username}) ? exists = true : exists = false;
    return exists;
}

//Creates an account if the user doesn't already exist in the db.
//Be sure to be mindful of the password checking in the nested if statement below. Master password must be shared between script and here, or else no one will be able to successfully log in.
function createAccount(username, password) {
    var account_data = {
        username: username,
        user_email: username + '@mit.edu',
    };
    console.log('in create accont');

    var exists = checkUser(username);
    var role;
    if (Teachers.findOne({username: username}) == null) {
        role = 'student'
    }
    else {
        role = 'teacher';
    }

    if (!exists) { //TODO: what if url is wrong? check if password formation is okay
        if (password == CryptoJS.MD5(username+MASTER).toString()) { //IMPORTANT
            var account_id = Accounts.createUser({
                username: username,
                email: account_data['user_email'],
                password: password,
                profile: {role: role}});
            user_signed_in = true;
            var id = AccountsTest.insert(account_data, function(err) {});
        }
        else {
            console.log('ERROR: GENERATED PASSWORD IN URL DOESN\'T MATCH GENERATED PASSWORD ON SERVER');
            throw Error();
        }
    }
    else {
        if (role == 'teacher') {
            console.log('updating db');
            var userID = Meteor.users.findOne({username: username});
            Meteor.users.update( userID, { $set: { 'profile.role' : 'teacher'} } );
            console.log(Meteor.users.findOne({username: username}).profile.role);
        }
    }
}

//Gets the username of a user and creates an account for them if they don't have one already. Returns a list in the form
Meteor.methods({
    kswak_login: function(encrypted_username, password) {
        var username = getUsernameFromBase64(encrypted_username);
        createAccount(username, password);
        return [username, password];
    },
    add_teacher: function(newTeacherList, editor) {
        if (editor.profile.role == 'teacher') {
            for (var nn=0;nn<newTeacherList.length;nn++) {
                var username = newTeacherList[nn];
                Teachers.insert({username: username});
                var userID = Meteor.users.findOne({username: username});
                if (userID != null) {
                    Meteor.users.update( userID, { $set: { 'profile.role' : 'teacher'} } );
                    console.log(Meteor.users.findOne({username: username}).profile.role);
                }
            }
        }
        else {
            console.log('ERROR: USER LACKS SUFFICIENT PRIVILEGES TO EDIT TEACHER ROSTER.')
        }
    },
    remove_teacher: function(teacher_username, editor) {
        if (editor.profile.role == 'teacher') {
            var id = Meteor.users.findOne({username: teacher_username}).id;
            console.log(id);
            if (id != null) {
                Meteor.users.update( id, { $set: { 'profile.role' : 'student'} } );
            }
        }
        else {
            console.log('ERROR: USER LACKS SUFFICIENT PRIVILEGES TO EDIT TEACHER ROSTER.')
        }
    }
});

