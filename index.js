require('colors');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var userInfo = require("./linkedin_user_info.json");
var PromiseSimple = require('promise-simple');

var email =  userInfo.email;
var password = userInfo.password;

chai.use(chaiAsPromised);
chai.should();

var wd;
try {
  wd = require('wd');
} catch( err ) {
  wd = require('../../lib/main');
}

// enables chai assertion chaining
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

// adding custom promise chain method
wd.addPromiseChainMethod(
  'elementByCssSelectorWhenReady',
  function(selector, timeout) {
    return this
      .waitForElementByCssSelector(selector, timeout)
      .elementByCssSelector(selector);
  }
);

var browser = wd.promiseChainRemote();



// enables chai assertion chaining
chaiAsPromised.transferPromiseness = wd.transferPromiseness;


function acceptAllInvitations() {
  var promise = PromiseSimple.defer();
  
  browser.waitForElementByCss(".bulk-chk" , 5000)
  .elementByCss('.bulk-chk')
  .click()
  .elementByCss("li[bulk-action='bulkInvitationAccept'] a")
  .click()
  .resolve(promise)
  
  function resolvePromise(){
    promise.resolve('OK');
  }


  return promise;
}

wd.addPromiseChainMethod('acceptAllInvitations', acceptAllInvitations);

// optional extra logging
browser.on('status', function(info) {
  console.log(info.cyan);
});
browser.on('command', function(eventType, command, response) {
  console.log(' > ' + eventType.cyan, command, (response || '').grey);
});
browser.on('http', function(meth, path, data) {
  console.log(' > ' + meth.magenta, path, (data || '').grey);
});

browser
  .init({browserName:'chrome'})
  .get("https://www.linkedin.com/uas/login")
  .elementById('session_key-login').type(email)
  .elementById('session_password-login').type(password)
  .elementById('btn-primary')
  .click()
  .waitForElementByCss(".feed-nhome" , 5000)
  .get("https://www.linkedin.com/inbox/#invitations")
  .acceptAllInvitations()
  .done();

  //  .fin(function() { return browser.quit(); })

  
  // .title()
  //   .should.become('WD Tests')
  // .elementById('i am a link')
  // .click()
  // .eval("window.location.href")
  //   .should.eventually.include('guinea-pig2')
  // .back()
  // .elementByCss('#comments').type('Bonjour!')
  // .getValue().should.become('Bonjour!')
  // .fin(function() { return browser.quit(); })
  // .done();
