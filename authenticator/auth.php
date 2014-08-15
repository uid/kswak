<!--
THIS IS ONLY A TEMPLATE, NOT WHAT IS RUNNING. SEE README.
-->

<html>

<head>
    <title>kswak Certificate Authentication</title>
    <style>
        body {text-color: white;}
        #coverup {top: 0px; z-index: 2; background-color: white; position: absolute; width: 100%; height: 100%;}
        #nocoverup {z-index: -1;}
    </style>
</head>
<body>
<?php
require( 'lib/slowaes/php/aes_fast.php');
require( 'lib/slowaes/php/cryptoHelpers.php');
define("ENCRYPTION_KEY", "REPLACE ME WITH KSWAK KEYS");
define("MASTER", "REPLACE ME WITH KSWAK KEYS"); //used for password generation
$div_id = 'coverup';

$debug = false; //turns $url_string in later if statement to localhost.

function encryptAES( $plaintext, $key ){

    // Set up encryption parameters.
    $plaintext_utf8 = utf8_encode($plaintext);
    $inputData = cryptoHelpers::convertStringToByteArray($plaintext);
    $keyAsNumbers = cryptoHelpers::toNumbers(bin2hex($key));
    $keyLength = count($keyAsNumbers);
    $iv = cryptoHelpers::generateSharedKey(16);

    $encrypted = AES::encrypt(
        $inputData,
        AES::modeOfOperation_CBC,
        $keyAsNumbers,
        $keyLength,
        $iv
    );

    // Set up output format (space delimeted "plaintextsize iv cipher")
    $retVal = $encrypted['originalsize'] . " "
        . cryptoHelpers::toHex($iv) . " "
        . cryptoHelpers::toHex($encrypted['cipher']);

    return $retVal;
}

function decryptAES( $input, $key ){

    // Split the input into its parts
    $cipherSplit = explode( " ", $input);
    $originalSize = intval($cipherSplit[0]);
    $iv = cryptoHelpers::toNumbers($cipherSplit[1]);
    $cipherText = $cipherSplit[2];

    // Set up encryption parameters
    $cipherIn = cryptoHelpers::toNumbers($cipherText);
    $keyAsNumbers = cryptoHelpers::toNumbers(bin2hex($key));
    $keyLength = count($keyAsNumbers);

    $decrypted = AES::decrypt(
        $cipherIn,
        $originalSize,
        AES::modeOfOperation_CBC,
        $keyAsNumbers,
        $keyLength,
        $iv
    );

    // Byte-array to text.
    $hexDecrypted = cryptoHelpers::toHex($decrypted);
    $retVal = pack("H*" , $hexDecrypted);

    return $retVal;
}

function base64_url_encode($input) {
    return strtr(base64_encode($input), '+/=', '-._');
}

function base64_url_decode($input) {
    return base64_decode(strtr($input, '-._', '+/='));
}

if (@$_SERVER['SSL_CLIENT_S_DN_CN']) {
    $user_full_name = $_SERVER['SSL_CLIENT_S_DN_CN'];
    $user_email = $_SERVER['SSL_CLIENT_S_DN_Email'];
    $issuer = $_SERVER['SSL_CLIENT_I_DN_O'];
    $email_chunks = explode("@", $user_email);
    $username = $email_chunks[0];
    $password = md5($username . MASTER);
    if ($issuer == 'Massachusetts Institute of Technology') {
        $encrypted_username = encryptAES($username, ENCRYPTION_KEY);
        if ($debug) {
            $url_string = 'localhost';
        }
        else {
            $url_string = $_SERVER["QUERY_STRING"];
            echo $url_string;
        }

        $url_username = base64_url_encode($encrypted_username);
//        echo "<br />";
//        echo $encrypted_username;
//        echo "<br />";
//        echo $url_username;
//        echo "<br />";
//        echo base64_url_decode($url_username);

        //note the hardcoded login/username in the url! This is for kswak specifically.
        echo "<meta http-equiv=\"refresh\" content=\"0;URL=http://".$url_string."login/".$url_username.'&'.$password."\">";
    }
} else {
    $div_id = 'nocoverup'; //to not hide the ugly redirect echo in the above if statement.
    ?><br>No valid certificates have been detected. <br>Your certificates may have expired or may not be installed on this machine. Please retry using a valid MIT certificate. <a href="http://ist.mit.edu/certaid">CertAid</a> may be able to help you on your adventure.<?php } ?>
</p>
    <div id="<?php echo $div_id ?>"></div>
</body>
</html>

