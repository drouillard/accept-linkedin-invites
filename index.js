require('colors');

var wd = require('wd');
var userInfo = require("./linkedin_user_info.json");
var PromiseSimple = require('promise-simple');

var email =  userInfo.email;
var password = userInfo.password;

var browser = wd.promiseChainRemote();

wd.addPromiseChainMethod('arrangeAcceptingOfInvitations', arrangeAcceptingOfInvitations);

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
  .waitForElementByCss("#feed-nhome" , 10000)
  .get("https://www.linkedin.com/inbox/#invitations")
  .waitForElementByCss("#invitations" , 10000)
  .arrangeAcceptingOfInvitations()
  .fin(function() { return browser.quit(); })



function arrangeAcceptingOfInvitations(){
  var promise = PromiseSimple.defer();
  
  browser.eval("document.getElementById('invitations').getAttribute('data-count')", function(err,value){
    var numberOfInvites = parseInt(value);
    
    // if(numberOfInvites === 0){ return resolvePromise() }

    acceptInvitations(acceptInvitationCallback);

    function acceptInvitationCallback(){
      numberOfInvites = numberOfInvites - 10;

      if(numberOfInvites > 0){
        //LinkedIn accept invite API is slow. Can take up to 30 seconds.
        //So give enough time to restart the process to avoid getting an error
        console.log("Scheduling the acceptance of more invitations...")
        setTimeout(function(){
          acceptInvitations(acceptInvitationCallback); 
         }, 30000)
      }
      else{
        console.log("Invitations have all been accepted.")
        resolvePromise();
      }
    }

  })


  function acceptInvitations(cb){
    browser.get("https://www.linkedin.com/inbox/#invitations")
    .waitForElementByCss(".bulk-chk" , 5000)
    .elementByCss('.bulk-chk')
    .click()
    .elementByCss("li[bulk-action='bulkInvitationAccept'] a")
    .click()
    .then(setTimeout(cb,5000))
  }

  
  function resolvePromise(){
    promise.resolve('OK');
  }

  return promise;
}


