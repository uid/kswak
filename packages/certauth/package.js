Package.describe({
  name: 'rcm:certauth',
  version: '0.1.1',
  // Brief, one-line summary of the package.
  summary: 'CertAuth allows a Meteor app hosted anywhere (e.g. on meteor.com, or on Modulus), to authenticate users who have client certificates from a different domain (e.g. mit.edu).',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/uid/certauth.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.0.2');
  api.use('ecmascript');
  api.use('random');
  api.use('accounts-password');
  api.addFiles([
    './client/certauth-client.js',
  ], 'client');
  api.addFiles([
    './server/certauth-server.js',
    './server/crypto.js',
    './server/slowaes/aes.js',
    './server/slowaes/cryptoHelpers.js',
    './server/slowaes/jsHash.js',
  ], 'server');
  api.export('CertAuth', 'client');
  api.export([
    'CertAuth', 'crypto'
  ], 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('rcm:certauth');
  api.addFiles('certauth-tests.js');
  // not done yet
});
