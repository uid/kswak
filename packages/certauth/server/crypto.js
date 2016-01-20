// Requires that:
//    decrypt(encrypt(plaintext, key), key) -> plaintext
// and the JS implementations here must interoperate with the PHP implementations in
// php/crypto.php

function encrypt(plaintext, key) {
    // Set up encryption parameters
    plaintext = cryptoHelpers.encode_utf8(plaintext);
    var inputData = cryptoHelpers.convertStringToByteArray(plaintext);
    var keyAsNumber = cryptoHelpers.toNumbers(bin2hex(key));
    var iv = cryptoHelpers.generateSharedKey(16);

    var encrypted = slowAES.encrypt(
        inputData,
        slowAES.modeOfOperation.CBC,
        keyAsNumber,
        iv
    );

    // Set up output format "plaintextsize-iv-cipher")
    var retVal = plaintext.length + "-"
        + cryptoHelpers.toHex(iv) + "-"
        + cryptoHelpers.toHex(encrypted);

    return retVal;
}

function decrypt(input, key){

    // Split the input into its compontents
    var inputSplit = input.split("-");
    var originalSize = parseInt(inputSplit[0]);
    var iv = cryptoHelpers.toNumbers(inputSplit[1]);
    var cipherIn = cryptoHelpers.toNumbers(inputSplit[2]);
    // Set up encryption parameters
    var keyAsNumbers = cryptoHelpers.toNumbers( bin2hex( key ) );

    var decrypted = slowAES.decrypt(
        cipherIn,
        slowAES.modeOfOperation.CBC,
        keyAsNumbers,
        iv
    );

    // Byte-array to text
    var retVal = hex2bin(cryptoHelpers.toHex(decrypted));
    var retVal2 = cryptoHelpers.decode_utf8(retVal);
    return retVal2;
}


// Equivalent to PHP bin2hex
function bin2hex (s) {
    var i, f = 0,
        a = [];

    s += '';
    f = s.length;

    for (i = 0; i < f; i++) {
        a[i] = s.charCodeAt(i).toString(16).replace(/^([\da-f])$/, "0$1");
    }

    return a.join('');
}

// Equivalent to PHP hex2bin
function hex2bin(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

// Put these functions in a module for the sake of accessing them
// in the Meteor server shell, for debugging
crypto = {
  encrypt: encrypt,
  decrypt: decrypt,
  bin2hex: bin2hex,
  hex2bin: hex2bin
};

