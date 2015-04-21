if(!stockfox.overlay) stockfox.overlay={};


stockfox.overlay.initialize = function () {
    // run this later and let the window load.
    //window.setTimeout(function () {
    	stockfox.overlay.start();
   // }, 100);
}

stockfox.overlay.start = function () {
	console.log( "START" )
//	alert ("START" );
//    var preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces
//        .nsIPrefService).getBranch("extensions.httprequester.");
//    if (preferencesService) {
        var firstrun = true;
        try {
        	 firstrun = stockfox.globals.pSrv.getBoolPref("firstrun");
            //firstrun = preferencesService.getBoolPref("firstrun");
        } catch (e) {
            firstrun = true;
        }

        console.log( "FIRSTRUN?: " + firstrun)

       if (firstrun) {
        	stockfox.globals.pSrv.setBoolPref("firstrun", false);
            /* Code related to firstrun */
            stockfox.overlay.installButton("nav-bar", "sfToolbar");

        } 
        stockfox.ticker.stockfox_init();
//    }
};


/**
 * Installs the toolbar button with the given ID into the given
 * toolbar, if it is not already present in the document.
 *
 * @param {string} toolbarId The ID of the toolbar to install to.
 * @param {string} id The ID of the button to install.
 * @param {string} afterId The ID of the element to insert after. @optional
 */
stockfox.overlay.installButton = function (toolbarId, id, afterId) {
	var sfId = document.getElementById(id);
	console.log( "sfId:" + sfId );
    //if (!document.getElementById(id)) {
        var toolbar = document.getElementById(toolbarId);

        // If no afterId is given, then append the item to the toolbar
        var before = null;
        if (afterId) {
            let elem = document.getElementById(afterId);
            if (elem && elem.parentNode == toolbar)
                before = elem.nextElementSibling;
        }

        toolbar.insertItem(id, before);
        toolbar.setAttribute("currentset", toolbar.currentSet);
        document.persist(toolbar.id, "currentset");
console.log( "SETTING id: " + toolbar.id  + " before: " + before + " -- currentset: " + toolbar.currentSet)
//        if (toolbarId == "addon-bar")
//            toolbar.collapsed = false;
   // }
}