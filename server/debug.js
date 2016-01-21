
makeTeacher = function(userid) {
    Meteor.users.update({_id:userid}, 
                        {$set:{'profile.isTeacher':true}},
                        function(err) {
                            if (err) console.log(err);
                            else console.log(Meteor.users.findOne({_id:userid}));
                        })
}

makeFreshStudent = function(username) {
    var userid = Accounts.createUser({username:username});
    Accounts.setPassword(userid, "");
}

