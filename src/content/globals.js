// define stockfox namespace
if(!stockfox) var stockfox={};
if(!stockfox.persistence) stockfox.persistence={};
if(!stockfox.globals) stockfox.globals={};
if(!stockfox.utils) stockfox.utils={};
if(!stockfox.stockManager) stockfox.stockManager={};
if(!stockfox.ticker) stockfox.ticker={};
if(!stockfox.holdings) stockfox.holdings={};
if(!stockfox.overlay) stockfox.overlay={};

//IO service: needed for creating URI objects
stockfox.globals.iSrv = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
stockfox.globals.stockFox_nsISupportsString = Components.interfaces.nsISupportsString;
//Preferences service
stockfox.globals.pSrv = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch("extensions.stockfox.");

stockfox.globals.stockFox_prefs = Components.classes["@mozilla.org/preferences-service;1"].
                getService(Components.interfaces.nsIPrefBranch);
// Replace unneccesary chars
stockfox.globals.trim = function(str){
	return str.replace(/^\s*/g, "").replace(/\s*$/g, "");
}

stockfox.globals.logIt = function (msg)
{
    var cSrv = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    cSrv.logStringMessage(msg);
	dump( msg );
	return msg;
}

// Custom errors
stockfox.globals.stockfox_bookmarkExistsError = new Error("The bookmark with the specified url already exists!");
stockfox.globals.stockfox_invalidSomething = new Error("Something you passed was invalid!");

