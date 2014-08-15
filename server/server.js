Teachers = new Meteor.Collection("teachers");
Teachers.insert({username:"rcm"});
Teachers.insert({username:"maxg"});
Teachers.insert({username:"robsoto"});
Teachers.insert({username:"sarivera"});
Teachers.insert({username:"peitao"});
Teachers.insert({username:"iveel"});

Questions = new Meteor.Collection("questions");
Meteor.publish("questions", function () {
    var userID = this.userId;
    if (Meteor.users.findOne(userID) != null) {
        if (Meteor.users.findOne(userID).profile.role == 'teacher'){
            return Questions.find();
        }
        else {
            return Questions.find({status:{$in:['active', 'frozen']}});
        }
    }
    else{
        return Questions.find({status:{$in:['active', 'frozen']}});
    }
});

Meteor.publish("directory", function () {
    var userID = this.userId;
    if (Meteor.users.findOne(userID) != null) {
        if (Meteor.users.findOne(userID).profile.role == 'teacher'){
            return Meteor.users.find();
        }
    }
});

Responses = new Meteor.Collection("responses");
Meteor.publish("responses", function () {
    var userID = this.userId;
    if (Meteor.users.findOne(userID) != null) {
        if (Meteor.users.findOne(userID).profile.role == 'teacher'){
            return Responses.find();
        }
        else {
            return Responses.find({user:userID});
        }
    }
    else {
        return Responses.find({user:userID});
    }
});

AccountsTest = new Meteor.Collection("accountstest");
Meteor.publish("accountstest", function () {
    return AccountsTest.find();
});

var MASTER = Meteor.settings.MASTER;
var ENCRYPTION_KEY = Meteor.settings.ENCRYPTION_KEY;

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

//Creates an account if the user doesn't already exist in the db.
//Be sure to be mindful of the password checking in the nested if statement below. Master password must be shared between script and here, or else no one will be able to successfully log in.
function createAccount(username, password) {
    var account_data = {
        username: username,
        user_email: username + '@mit.edu',
    };

    var exists = checkUser(username);
    var role;
    (Teachers.findOne({username: username}) == null) ? role = 'student' : role = 'teacher';

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
            var userID = Meteor.users.findOne({username: username});
            Meteor.users.update( userID, { $set: { 'profile.role' : 'teacher'} } );
        }
    }
}

var isTeacher = function(userID) {
        var role = Meteor.users.findOne(userID).profile.role;
        return role == 'teacher'
    }


var isStudent = function(userID) {
        var role = Meteor.users.findOne(userID).profile.role;
        return role == 'student'
    }



Meteor.methods({
    kswak_login: function(encrypted_username, password) {
        var username = getUsernameFromBase64(encrypted_username);
        createAccount(username, password);
        return [username, password];
    },

    submit_response : function (question, user_answer) {
        var user_id = Meteor.user()._id;
        if (question.status == 'active' && isStudent(user_id)){
            var question_id = question._id;
            var response = Responses.findOne({user:user_id, question:question_id});
            if (response != undefined){
                Responses.update(response._id, {$set: {answer: user_answer}})
            }else{
                Responses.insert({user:user_id, question:question_id, answer: user_answer})
            }
        }else{
            console.log('not a student')
        }
    },

    remove_responses: function ( question_id){
        if (isTeacher( Meteor.user()._id) ){
             Responses.find({question:question_id}).forEach( function(response){
                    Responses.remove(response._id)
                });
        }
    },

    insert_question: function( question_data){
        if (isTeacher( Meteor.user()._id) ){
            return Questions.insert(question_data)
        }
    },

    remove_question: function (question_id) {
        if (isTeacher( Meteor.user()._id) ){
            Questions.remove(question_id);
        }
    },


    inactivate_question: function (){
        if (isTeacher( Meteor.user()._id) ){
            var active = Questions.findOne({status:{$in:['active', 'frozen']}})
            if (active != undefined){
                Questions.update(active._id,  {$set:{status:'inactive'}})
            }
        }
    },

    activate_question: function(question_id){
        if (isTeacher( Meteor.user()._id) ){
            Questions.update( question_id, {$set:{status:'active'}})
        }
    },

    freeze_question: function(question_id){
        if (isTeacher( Meteor.user()._id) ){
            Questions.update(question_id, {$set:{status:'frozen'}});
        }
    },

    update_question: function(question, title, choices){
        if (isTeacher( Meteor.user()._id) ){
            Questions.update(question, {$set:{title:title, choices:choices}})
        }
    },

    add_teacher: function(newTeacherList, editor) {
        if (editor.profile.role == 'teacher') {
            for (var nn=0;nn<newTeacherList.length;nn++) {
                var username = newTeacherList[nn];
                Teachers.insert({username: username});
                var userID = Meteor.users.findOne({username: username});
                if (userID != null) {
                    Meteor.users.update( userID, { $set: { 'profile.role' : 'teacher'} } );
                }
            }
        }
        else {
            console.log('ERROR: USER LACKS SUFFICIENT PRIVILEGES TO EDIT TEACHER ROSTER.')
        }
    },
    //todo: this is borked, debug.
    remove_teacher: function(teacher_username, editor) {
        if (editor.profile.role == 'teacher') {
            var id = Meteor.users.findOne({username: teacher_username})._id;
            if (id != null) {
                Meteor.users.update( id, { $set: { 'profile.role' : 'student'} } );
            }
        }
        else {
            console.log('ERROR: USER LACKS SUFFICIENT PRIVILEGES TO EDIT TEACHER ROSTER.')
        }
    }
});
