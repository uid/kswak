<?php

require('crypto.php');

// size of our random secrets, in bytes.  256 bytes = 2048 bits.
define(SECRET_SIZE_BYTES, 256);


// Master secret used as an encryption key by this script to seal app tokens.
// Private to this script; must be unique to every installed instance of this script, 
// and never published or shared or stored anywhere else.
// Should be at least SECRET_SIZE_BYTES long (typically represented in hex form, so the string is
// usually 2*SECRET_SIZE_BYTES characters long).
// This script will generate its own MASTER_SECRET when you run it the first time; see just below.
// Changing this secret invalidates all outstanding app token/secret pairs, so don't do it
// lightly.
define("MASTER_SECRET", "change me");

if (strlen(MASTER_SECRET) < SECRET_SIZE_BYTES) {
    // MASTER_SECRET is less than half as long as it should be,
    // so it hasn't been properly initialized yet.
    // Generate a secret and tell the developer where to put it.
    $proposedMasterSecret = makeRandomSecret(SECRET_SIZE_BYTES);
    header("Content-Type: text/plain");
    echo "This script is not ready to use yet.\n";
    echo "Edit it to change MASTER_SECRET to this randomly-generated value:\n";
    echo "define(\"MASTER_SECRET\", \"" . $proposedMasterSecret . "\");\n";
    return;

}


// Blacklist or whitelist particular app developers (by their email obtained from their own client 
// certificate).
// Return true if and only if app developer should be allowed to use this service to generate
// an app-specific token/secret pair.
function allowAppDeveloper($appDeveloperEmail) {
    // Write code here if you want to reject or accept only certain developers.
    // If you blacklist a badly-behaved developer, you may also need to blacklist
    // the apps they have already registered, in allowApp() below.
    return true;
}

// Blacklist or whitelist particular apps (identified by their app secret).
// Return true if and only if the app should be allowed to use this service to
// authenticate a user.
function allowApp($appSecret) {
    // Write code here if you want to reject or accept only certain apps.
    // The app secret is a string starting with an authenticated app developer's email
    // (e.g. "rcm@MIT.EDU-29383823..."), so you can blacklist or whitelist 
    // all of a developer's apps by checking for that prefix.
    return true;
}

$appToken = $_GET["token"];

if (!$appToken) {
    // This request is an app developer asking for a fresh secret/token pair.


    // require the developer to have an SSL client certificate
    if (! @$_SERVER['SSL_CLIENT_S_DN_CN']) {
        header("Content-Type: text/plain");
        echo "No valid certificate detected.\n";
        return;

    }

    $email = $_SERVER['SSL_CLIENT_S_DN_Email'];

    // Check blacklist/whitelist
    if (!allowAppDeveloper($email)) {
        header("Content-Type: text/plain");
        echo "Request not permitted.\n";
        return;
    }

    // Generate the secret/token pair.
    $appSecret = $email . "-" . makeRandomSecret(SECRET_SIZE_BYTES);
    $appToken = encrypt($appSecret, MASTER_SECRET);
    $appURL = "https://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]?token=$appToken";

    // Print out a Meteor settings.json file for the developer.
    header("Content-Type: text/plain");
    echo "{\n";
    echo "  \"public\": {\n";
    echo "    \"CertAuthURL\": \"" . $appURL . "\"\n";
    echo "  },\n";
    echo "  \"CertAuthSecret\": \"" . $appSecret . "\"\n";
    echo "}\n";
    return;
}

// Otherwise, this request is a user trying to log in.

// require an SSL client certificate
if (! @$_SERVER['SSL_CLIENT_S_DN_CN']) {
    // report the authentication failure using alert(), so that
    // Meteor user is notified by a popup.
    header("Content-Type: application/javascript");
    echo "alert('No valid certificate detected.');\n";
    return;
}

// Unseal the app token to recover the app secret.
$appSecret = decrypt($appToken, MASTER_SECRET);
// echo "// appSecret=" . $appSecret . "<br>\n";

// Check blacklist/whitelist
if (!allowApp($appSecret)) {
    header("Content-Type: application/javascript");
    echo "alert('Certificate logins from this app are no longer permitted.');\n";
    return;
}

$name = $_SERVER['SSL_CLIENT_S_DN_CN'];
$email = $_SERVER['SSL_CLIENT_S_DN_Email'];
$timestamp = time();
$clientIPAddress = $_SERVER['REMOTE_ADDR'];
$referrer = $_SERVER['HTTP_REFERER'];

$certInfo = '{';
$certInfo .= '"name":"' . $name . '",';
$certInfo .= '"email":"' . $email . '",';
$certInfo .= '"timestamp":' . $timestamp . ',';
$certInfo .= '"ip":"' . $clientIPAddress . '",';
$certInfo .= '"referrer":"' . $referrer . '"';
$certInfo .='}';
// echo "// certInfo=" . $certInfo . "<br>\n";

// seal up the certificate info with the app's secret, 
// so that only the app can unseal it
$encryptedCertInfo = encrypt($certInfo, $appSecret);
// echo "// encryptedCertInfo=" . $encryptedCertInfo . "<br>\n";

// return the sealed certInfo through a JSONP callback
$callbackName = $_GET["callback"];
// echo "// callback=" . $callbackName . "<br>\n";

header("Content-Type: application/javascript");
echo $callbackName . "('" . $encryptedCertInfo . "');\n";
?>
