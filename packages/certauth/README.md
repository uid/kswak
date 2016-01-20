CertAuth allows a Meteor app hosted anywhere (e.g. on meteor.com, or on Modulus), to authenticate users who have client certificates from a different domain (e.g. mit.edu).  It requires the ability to host a PHP script on an SSL-enabled server that can authenticate the client certificates. 

This package requires Meteor version 1.2 or higher.

# How to Use

## Install the PHP script

1\. Copy the `php/` folder to a server that can authenticate your users' client certificates.  At MIT, you can host it on scripts.mit.edu.  Multiple Meteor apps can use the same PHP script location, so you really only need to host it once for all users of the domain.

2\. Visit the `php/certauth.php` script in a web browser, using the URL where you hosted it.  For example, at MIT we would browse to:

    https://6005.mit.edu:444/certauth/certauth.php

The script will generate a random master secret key and display it to you, something like this:

    This script is not ready to use yet.
    Edit it to change MASTER_SECRET to this randomly-generated value:
    define("MASTER_SECRET", "b33f9b0242110134...19cd01");

Edit `certauth.php` to include this generated key.

**This key should be kept private to the PHP script.**  Don't put it in any other scripts, don't commit it into a git repo, definitely don't accidentally publish it on Github.  Make sure the PHP script is not readable by anybody but you and the web server process.

If you accidentally expose the master secret, you can generate a new one by starting over with the original copy of `certauth.php` and re-doing steps 1-2.  After that, however, existing Meteor apps will no longer be able to authenticate their users, and they will all have to regenerate their `settings.json` file using steps 5-6 below.

## Install the certauth package into your Meteor app

This package is not yet listed on Atmosphere, so you have to add it locally. Suppose you cloned this repo to `/path/to/certauth` on your machine.

3\. In your Meteor app, make a `packages` folder with a symlink to `certauth` in it:

    cd /path/to/your/meteor/app
    mkdir packages/
    ln -s /path/to/certauth packages/

4\. Add the package using `meteor add`:

    meteor add rcm:certauth

You should now be able to `meteor list` and find `rcm:certauth` on your list of installed packages.  In the future, when you want to update the certauth package to the latest version, you should `git pull` in your certauth clone, and then run `meteor update` in your Meteor app.

## Obtain a token/secret pair for your Meteor app

5\. Visit the `certauth.php` script in your web browser again, making sure to use `https:` and provide your own valid client certificate, in order to authenticate yourself as your app's developer.  For example, at MIT we would browse to:

    https://6005.mit.edu:444/certauth/certauth.php

Assuming the script was configured correctly in step 2 above, you should get back a randomly-generated secret key and its corresponding public token.  The token/secret pair are formatted as JSON suitable for a Meteor settings file, something like:

    {
      "public": {
        "CertAuthURL": "https://6005.mit.edu:444/certauth/certauth.php?token=524-1c1edfa...8fb69"
      },
      "CertAuthSecret": "rcm@MIT.EDU-f093eae69...cdaed"
    }

The secret will start with your own email address.

6\. Store the JSON as a file called `settings.json` in the root of your Meteor app.  If you already have a `settings.json` file, then just insert the two properties in the appropriate places.   `CertAuthURL` must be in the `public` section (visible to the client), and `CertAuthSecret` must not be (so that it is visible to the server only).

**Your secret key, `CertAuthSecret`, should be kept private.**  Don't put it in any other scripts, don't commit it into a git repo, definitely don't accidentally publish it on github.

> **Add settings.json to your .gitignore file right now, so that you never accidentally commit it to your git repo or push it to Github.**

Every running instance of your app can use a different token/secret pair, so each developer and each deployment should have their own private `settings.json`.  The token/secret pair are only used during an authentication transaction, not for any persistently stored data.  Because nothing stored in your Meteor database depends on the secret key, multiple application instances with different keys can use the same database.  If you accidentally expose a secret key, just generate a new one by repeating steps 4-5.

7\. Start your app using `meteor --settings settings.json`.  You'll have to run Meteor this way from now on, so that your app has access to the token/secret pair.


## Call CertAuth in your Meteor app

CertAuth has exactly one function, available only on client:

    CertAuth.login()

This function visits the `CertAuthURL` url to authenticate the user's client certificate and collect information from it (in a cryptographically sealed bundle), and then passes that bundle back to the Meteor server to log in.  The Meteor server side creates an account for the user if it doesn't already exist.

If you ever want to log the user out, just use `Meteor.logout()` as usual.

8\. To try CertAuth before you change your app's code, just go to the browser console in your Meteor app.  Evaluate `CertAuth.login()` and you should see your certificate used to create an account and log in.

9\. For examples of how to integrate CertAuth into your app, look at the simple test app at [https://github.com/uid/test-certauth](https://github.com/uid/test-certauth). It's an app that can log in, display the user's name, and log out.  You can set up run this example app by cloning it and following steps 3-7 above.

