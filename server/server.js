
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
            var userID = Meteor.users.findOne({username: username});
            Meteor.users.update( userID, { $set: { 'profile.role' : 'teacher'} } );
        }
    }
}

Future = Npm.require('fibers/future');

Meteor.methods({
    kswak_login: function(encrypted_username) {
        var username = getUsernameFromBase64(encrypted_username);
        createAccount(username);
        return username;
    },
	
	submit_response : function (question, user_answer) {
		var user_id = Meteor.user()._id;
		if (question.status == 'active'){
			var question_id = question._id;
			var response = Responses.findOne({user:user_id, question:question_id});		
			if (response != undefined){
				console.log('updating')
				Responses.update(response._id, {$set: {answer: user_answer}})
			}else{
				console.log('inserting');
				Responses.insert({user:user_id, question:question_id, answer: user_answer}, function(err){console.log('failed to insert')})
			}	
		}
	},
	
	remove_responses: function ( question_id){
		 Responses.find({question:question_id}).forEach( function(response){
                Responses.remove(response._id)
            });
	},
	
	insert_question: function( question_data){
		Questions.insert(question_data)
	},
	
	remove_question: function (question_id) {
		Questions.remove(question_id);
	},
	
	
	inactivate_question: function (){
		Questions.update( Questions.findOne({status:{$in:['active', 'frozen']}})._id, {$set:{status:'inactive'}})
	},
	
	activate_question: function(question_id){
		 Questions.update( question_id, {$set:{status:'active'}})
	},
	
	freeze_question: function(question_id){
		Questions.update(question_id, {$set:{status:'frozen'}});
	},
	
	update_question: function(question, title, c1,c2,c3,c4,c5){
		            Questions.update(question, {$set:{title:title,
                                              choice1:c1,
                                              choice2:c2,
                                              choice3:c3,
                                              choice4:c4,
                                              choice5:c5
                                              }})
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
            console.log(id);
            if (id != null) {
                Meteor.users.update( id, { $set: { 'profile.role' : 'student'} } );
            }
        }
        else {
            console.log('ERROR: USER LACKS SUFFICIENT PRIVILEGES TO EDIT TEACHER ROSTER.')
        }
    },
    isTeacher: function(userID) {
        var role = Meteor.users.findOne(userID).profile.role;
        return role == 'teacher'
    }
});
