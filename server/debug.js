
makeFreshStudent = function(username) {
    var userid = Accounts.createUser({username:username});
    Accounts.setPassword(userid, "");
}

