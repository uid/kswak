
Meteor.methods({
  startCertAuth: startCertAuth
});

var SECRET; // initialized from Meteor.settings below

// A certificate login can't take more than this number of seconds, or it
// is cancelled.  Keep short to defeat replay attacks.
// This default can be overridden by Meteor.settings.CertAuthTimeoutSeconds.
var TIMEOUT_SECONDS = 10;

Meteor.startup(function () {
  if (Meteor.settings.CertAuthSecret) {
    SECRET = Meteor.settings.CertAuthSecret;
  } else {
    console.log("cert-auth can't function: no CertAuthSecret found.\n"
               +"Need to create settings.json, and/or run meteor --settings settings.json");
  }

  if (Meteor.settings.CertAuthTimeoutSeconds) {
    TIMEOUT_SECONDS = Meteor.settings.CertAuthTimeoutSeconds;
  }

  Accounts.validateLoginAttempt(validateCertAuth);
});

// encryptedCertInfo: JSON object encrypted by SECRET,
//    of the form { 
//         email:string    e.g. "bitdiddle@MIT.EDU" (optional)
//         name:string      e.g. "Ben Bitdiddle" (optional)
//         timestamp:int   seconds since epoch, e.g. 1444515609 (required)
//         referrer:string  URL from Referrer header, e.g. "http://classoverflow.meteor.com/" (optional)
//    }
// returns {email:string, password:string} where password is a randomly-generated one-time password that can be
// used to log in with Meteor.loginWithPassword() once, within the next TIMEOUT_SECONDS seconds. 
function startCertAuth(encryptedCertInfo) {
  // unpack the certificate info
  try {
    //console.log("encryptedCertInfo", encryptedCertInfo);
    var certInfoString = crypto.decrypt(encryptedCertInfo, SECRET);
    //console.log("certInfoString", certInfoString);
    var certInfo = JSON.parse(certInfoString);
  } catch (e) {
    console.log(e);
    throw new Error("can't decrypt certificate info -- CertAuthSecret in settings.json may be stale or corrupted");
  }

  var name = certInfo.name;
  var email = certInfo.email;
  var startingTimestamp = certInfo.timestamp;
  var authReferrerURL = certInfo.referrer;

  // check freshness of request (blocks replay attacks)
  assertRequestIsCurrent(startingTimestamp);

  // If referrer is present, check that it belongs to this Meteor server.
  // Reduces risk of a certain man-in-the-middle attack discussed in the readme.md.
  var meteorServerHost = this.connection.httpHeaders.host;  // only works inside a Meteor.method()
  assertConsistentReferrer(authReferrerURL, meteorServerHost);

  // get or create the corresponding user
  var userid = getOrCreateUser(email, name);

  // make a one-time password to give back to the client.
  var password = crypto.encrypt(email + Random.secret(), SECRET);
  //console.log("one-time password", password);

  // store the timestamp and password into this user
  Meteor.users.update({_id: userid}, { 
    $set: { 'services.password.timestamp': startingTimestamp } 
  });
  Accounts.setPassword(userid, password);

  return {
    email: email, 
    password: password
  };
}

// Find user account matching the email address if it exists, otherwise create new one.
// email:string, name:string.
// name is optional.
// email uses case-insensitive matching, as in the usual Meteor accounts system.
// Returns a userid or throws an exception if multiple matches.
function getOrCreateUser(email, name) {
  var user = findUserByEmail(email);
  if (user == null) {
    var userid = Accounts.createUser({
      email: email,
      profile: { 
        name: name
      }
    });
    user = Meteor.users.findOne({_id: userid});
  }

  // mark the email as verified (we trust the cert to belong to the email owner)
  Accounts.addEmail(user._id, email, true);

  // add name if missing
  if (name && (!user.profile || !user.profile.name)) {
    Meteor.users.update({_id: user._id}, { 
      $set: { 'profile.name': name } 
    });
  }

  return user._id;
}

// Accounts.findUserByEmail() is only available in Meteor 1.2, so here's another impl if needed
var findUserByEmail = Accounts.findUserByEmail ? Accounts.findUserByEmail : function findUserByEmail(email) {
  // try case-sensitive match first
  var user = Meteor.users.findOne({"emails.address": email});
  if (user) return user;

  // next try case-insensitive search using regex.
  var escapedEmail = email.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
  var users = Meteor.users.find({
    "emails.address": { $regex: '^' + escapedEmail + '$', $options: 'i' }
  }).fetch();

  if (users.length == 1) return users[0];
  else return null;
}

// Put these functions in a module for the sake of accessing them
// in the Meteor server shell, for debugging
CertAuth = {
  getOrCreateUser: getOrCreateUser,
};

// loginAttempt: documented by Accounts.validateLoginAttempt()
// returns true if login allowed, falsy or exception if disallowed
function validateCertAuth(loginAttempt) {
  var user = loginAttempt.user;

  if (!loginAttempt.allowed) return true; // already rejected
  if (loginAttempt.type != "password") return true; // only handle password service
  if (!("timestamp" in user.services.password)) return true; // only handle one-time passwords

  // check the timestamp that was stored above
  var startingTimestamp = user.services.password.timestamp;
  //console.log("startingTimestamp", startingTimestamp);
  assertRequestIsCurrent(startingTimestamp);

  // now that we've accepted the one-time password, 
  // delete it entirely so that it won't be accepted again
  Meteor.users.update({_id: user._id}, {
    $unset: {'services.password':1}
  });    

  return true;
}



// does nothing if this request is fresh enough, throws Error if it isn't.
function assertRequestIsCurrent(startingTimestamp) {
  var nowTimestamp = getTimestampNow();
  if (!areTimestampsClose(startingTimestamp, nowTimestamp, TIMEOUT_SECONDS)) {
    throw new Error("can't log in: \n"
                    + "certificate server request started at " + timestampToDate(startingTimestamp) + ",\n" 
                    + "        but Meteor server time is now " + timestampToDate(nowTimestamp) + ".\n"
                    + "Check that both server clocks are correct, or change CertAuthTimeoutSeconds in settings.json\n"
                    + "if network/server delays need more than " + TIMEOUT_SECONDS + " seconds grace.");
  }
}

// return current time in seconds since epoch
function getTimestampNow() {
  return new Date().getTime() / 1000
}

// return Date object for a timestamp (seconds since epoch)
function timestampToDate(timestamp) {
  return new Date(timestamp*1000);
}

// return true iff two timestamps are within window seconds of each other,
// in either order. 
function areTimestampsClose(timestamp1, timestamp2, windowSeconds) {
  return Math.abs(timestamp1 - timestamp2) <= windowSeconds;
}


function assertConsistentReferrer(authReferrerURL, meteorServerHost) {
  //console.log("authReferrerURL", authReferrerURL);
  if (!authReferrerURL) {
    return; // no information, can't reject
  }

  try {
    var authReferrerHost = authReferrerURL.match(/^https?:\/\/([^\/]+)/)[1];
    //console.log("authReferrerHost", authReferrerHost);
  } catch (e) {
    throw new Error("can't log in: can't find host in referrer URL: " + authReferrerURL);
  }

  //console.log("meteorServerHost", meteorServerHost);
  // if (meteorServerHost != authReferrerHost) {
  //   throw new Error("can't log in:\n"
  //                 + "certificate request came from a page at host " + authReferrerHost + ",\n"
  //                 + "              but this Meteor app is at host " + meteorServerHost);
  // }
}

