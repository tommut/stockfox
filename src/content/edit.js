// Populate fields with preferences loaded
function stockfox_edit_load(){
	stockfox_edit_loadList();
	
	document.getElementById("stockfox-rotate-field").value = stockfox.globals.pSrv.getIntPref("speed");
    document.getElementById("stockfox-speed-field").value = stockfox.globals.pSrv.getIntPref("toolbar");
	document.getElementById("stockfox-update-field").value = (stockfox.globals.pSrv.getIntPref("update") / (60 * 1000));
	document.getElementById("stockfox-status-checkbox").checked = stockfox.globals.pSrv.getBoolPref("display.status");
	document.getElementById("stockfox-observeMarketClose-checkbox").checked = stockfox.globals.pSrv.getBoolPref("observeMarketClose");
	document.getElementById("stockfox-advanced-details-checkbox").checked = stockfox.globals.pSrv.getBoolPref("display.showDisplaySymbol");
	document.getElementById("stockfox-up-color").color = stockfox.globals.pSrv.getCharPref("color.up");
	document.getElementById("stockfox-down-color").color = stockfox.globals.pSrv.getCharPref("color.down");
	document.getElementById("stockfox-neutral-color").color = stockfox.globals.pSrv.getCharPref("color.neutral");
	document.getElementById("stockfox.details.site").value = stockfox.globals.pSrv.getCharPref("details.site");	
	//document.getElementById("stockfox.quotes.site").value = stockfox.globals.pSrv.getCharPref("quotes.site");	
}

// Default page to open when looking for symbol
function stockfox_edit_symbolLookup(){
	var sSymbol = document.getElementById('stockfox-add-field').value;
	if(opener){ 
		opener.gBrowser.selectedTab = opener.gBrowser.addTab('http://finance.yahoo.com/lookup?s=' + sSymbol);
		opener.focus();
	} else{ 
		window.open('http://finance.yahoo.com/lookup?s=' + sSymbol);
		window.focus();
	}
}

// Save Preferences
function stockfox_edit_save(andClose){
	try{
		var oTabBox = document.getElementById("stockfox-tabs");
		// Ticker Speed
		if(document.getElementById("stockfox-rotate-field").value == "" || isNaN(document.getElementById("stockfox-rotate-field").value) || !(document.getElementById("stockfox-rotate-field").value >= 1)){
			alert("That is an invalid entry for Ticker Speed");
			document.getElementById("stockfox-rotate-field").focus();
			oTabBox.selectedTab		= document.getElementById("stockfox-display-tab");
			oTabBox.selectedPanel	= document.getElementById("stockfox-display-panel");
			return false;
		}
		// Ticker Update
		if(document.getElementById("stockfox-update-field").value == "" || isNaN(document.getElementById("stockfox-update-field").value) || !(document.getElementById("stockfox-update-field").value >= 1)){
			alert("That is an invalid entry for Stock Updates");
			document.getElementById("stockfox-update-field").focus();
			oTabBox.selectedTab		= document.getElementById("stockfox-display-tab");
			oTabBox.selectedPanel	= document.getElementById("stockfox-display-panel");
			return false;
		}
        // Ticker Update
		if(document.getElementById("stockfox-speed-field").value == "" || isNaN(document.getElementById("stockfox-speed-field").value) || !(document.getElementById("stockfox-speed-field").value >= 1)){
			alert("That is an invalid entry for Toolbar speed");
			document.getElementById("stockfox-speed-field").focus();
			oTabBox.selectedTab		= document.getElementById("stockfox-display-tab");
			oTabBox.selectedPanel	= document.getElementById("stockfox-display-panel");
			return false;
		}
		// Detail Site URL
		if(document.getElementById("stockfox.details.site").value.search(/[a-zA-Z]/i) < 0){
			alert("Enter a valid url");
			document.getElementById("stockfox.details.site").focus();
			oTabBox.selectedTab		= document.getElementById("stockfox-display-tab");
			oTabBox.selectedPanel	= document.getElementById("stockfox-display-panel");
			return false;
		}
		/*
		// Quotes Site URL
		if(document.getElementById("stockfox.quotes.site").value.indexOf( "yahoo") == -1){
			alert("Enter a valid Yahoo finance site");
			document.getElementById("stockfox.quotes.site").focus();
			oTabBox.selectedTab		= document.getElementById("stockfox-display-tab");
			oTabBox.selectedPanel	= document.getElementById("stockfox-display-panel");
			return false;
		}
		*/
		
		// Ticker Speed
		stockfox.globals.pSrv.setIntPref("speed", parseInt(document.getElementById("stockfox-rotate-field").value));
        
        // Toolbar Speed
		stockfox.globals.pSrv.setIntPref("toolbar", parseInt(document.getElementById("stockfox-speed-field").value));
		
		// Ticker Update
		stockfox.globals.pSrv.setIntPref("update", parseInt(parseFloat(document.getElementById("stockfox-update-field").value) * (60 * 1000)));
		
		// Status Checkbox
		stockfox.globals.pSrv.setBoolPref("display.status", document.getElementById("stockfox-status-checkbox").checked);
		
		// observe market close
		stockfox.globals.pSrv.setBoolPref("observeMarketClose", document.getElementById("stockfox-observeMarketClose-checkbox").checked);
		
		// advanced - show display symbol
		stockfox.globals.pSrv.setBoolPref("display.showDisplaySymbol", document.getElementById("stockfox-advanced-details-checkbox").checked);
        
        var sB = window.opener.document.getElementById("statusbar-stockfox");
		
        
        if (sB != null){
            sB.setAttribute("collapsed", !(stockfox.globals.pSrv.getBoolPref("display.status")));
        }
		
		// Colors
		stockfox.globals.pSrv.setCharPref("color.up", document.getElementById("stockfox-up-color").color);
		stockfox.globals.pSrv.setCharPref("color.down", document.getElementById("stockfox-down-color").color);
		stockfox.globals.pSrv.setCharPref("color.neutral", document.getElementById("stockfox-neutral-color").color);
	
		// Details Site
		stockfox.globals.pSrv.setCharPref("details.site", document.getElementById("stockfox.details.site").value);
		
		// Quotes Site
		/*
		stockfox.globals.pSrv.setCharPref("quotes.site", document.getElementById("stockfox.quotes.site").value);
		*/		
		
		// Update		
		stockfox_edit_sendUpdate();
		
		try{
			if(andClose && opener)
				opener.focus();
		} catch(err){}
		
		return true;
		
	} catch(err){ alert("An unknown error occurred\n"+ err); }
	
	return false;
}

// Error catching update
function stockfox_edit_sendUpdate(){
	try{
			stockfox.globals.pSrv.setCharPref("lastupdate", (new Date()).getTime());
	} catch(e){}
}

// Create a bookmark object
function stockfox_edit_makeBmk(title, symbol, uri){
    var obj = {};
    obj.name = title;
    obj.symbol = symbol;
    obj.uri = uri;
    return obj;
}

// Attempt to add a new stock to bookmarks
function stockfox_edit_add(oStock, isVerified, sSymbol){
    try{
        // Not Verified
        if((typeof(isVerified) == 'undefined' || !isVerified)){
            if(!confirm("Could not verify that stock symbol, would you like to add it anyways?")){
                document.getElementById('stockfox-add-field').value = "";
                document.getElementById('stockfox-add-field').focus();
                return;
            } else{
                oStock 			= new stockfox.stockManager.Stock();
                oStock.symbol	= sSymbol;
                oStock.name		= sSymbol;
            }
        }
        
        // Correct Tab Selected
        if(document.getElementById('stockfox-tabs').selectedIndex > 0){
            return;
        }
        
        var sSymbol	= oStock.symbol;
        var sUri = stockfox.globals.pSrv.getCharPref("details.site");
        sUri = sUri.replace(/\$/g, sSymbol);
        
        // Confirm no duplicates
        if (!(stockfox.persistence.doesStockExist(sSymbol))){  
            var stock = stockfox_edit_makeBmk(oStock.name, oStock.symbol, sUri);
            stockfox.persistence.addStock(stock);
        }
        
        // Update List
        stockfox_edit_resetList();
        
        // Clear Field
        document.getElementById('stockfox-add-field').value = "";
        
        // Update Pref
        stockfox_edit_sendUpdate();
		
//		 var stockManager = window.arguments[0];
//		 stockManager.refreshStocks();
        
        // Reset Toolbar
        if(opener){ 
            opener.stockfox.ticker.oToolbarTicker.init();
    	} else{ 
    		window.stockfox.ticker.oToolbarTicker.init();
    	}
            
    } catch(err){ alert("An unknown error occurred.\n"+ err); }
}

// Add stock symbold after verification
function stockfox_edit_verify(){
    
        var sSymbol = document.getElementById('stockfox-add-field').value;
        
        // Correct Tab Selected
        if(document.getElementById('stockfox-tabs').selectedIndex > 0){
            return;
        }
        
        // Symbol Empty?
        if(sSymbol.search(/[a-z0-9]/i) < 0){
            alert("Enter a stock symbol to add");
            document.getElementById('stockfox-add-field').value = "";
            document.getElementById('stockfox-add-field').focus();
            return;
        }
        
        // Verify Symbol
		setTimeout(function() { stockfox_edit_verifyWindow(sSymbol) }, 5);
}

// Open Verify Window
function stockfox_edit_verifyWindow(sSymbol){
    window.openDialog('chrome://stockfox/content/verify.xul','StockFoxVerifyDialog','centerscreen, chrome, modal', sSymbol).focus();
}

// Load Symbol List
function stockfox_edit_loadList(iRowSelect){
    try{

		var aStocks = stockfox.persistence.getSavedStocks();
        var oList = document.getElementById("stockfox-edit-symbols");
        
        for(var i = 0; i < aStocks.length; i++){
			var oItem = oList.appendItem(aStocks[i].name, aStocks[i].symbol );
                oItem.setAttribute("onclick", "stockfox_edit_enableButtons(true)");
				oItem.setAttribute("ondblclick", "stockfox_edit_organize()");
                oItem.setAttribute("uri", "http://finance.yahoo.com/q?s=" +aStocks[i].symbol );   
                oItem.setAttribute( "symbol", aStocks[i].symbol );
				//oItem.setAttribute( "name", aStocks[i].name );
        }
        
        // Select Row
        if(iRowSelect > -1 && iRowSelect <= oList.getRowCount() - 1)
            oList.selectedIndex = iRowSelect;
        
    } catch(err){ alert("An unknown error occurred\n"+ err); } 
}

// Reset Symbol List
function stockfox_edit_resetList(iRowSelect){
    var oList = document.getElementById("stockfox-edit-symbols");
    
    if(iRowSelect == null)
        iRowSelect = -1;
    
    // Remove all items
    while(oList.childNodes.length > 0){
        oList.removeChild(oList.firstChild);
    }
    
    // Load List
	setTimeout(function() { stockfox_edit_loadList(iRowSelect) }, 200);
}

// Remove Symbol
function stockfox_edit_remove(){		
    try{
        var oList 	= document.getElementById("stockfox-edit-symbols");
        var oItem 	= oList.selectedItem;
        var iSelect = oList.selectedIndex;
        if(oItem != null && confirm("Are you sure you want to remove this stock symbol?")){
        
            if(oItem.getAttribute("symbol") == null){
                alert("Could not remove that symbol");
                return;
            }
			
			
            var uri = stockfox.globals.iSrv.newURI(oItem.getAttribute("uri"), "", null);
			
			var symbol = oItem.getAttribute("symbol");
			
			var stock = stockfox.persistence.getSavedStock( symbol );
			stockfox.utils.removeElement( stock );
            
            // Update Pref
            stockfox_edit_sendUpdate();
            
            // Select Row
            if(iSelect > (oList.getRowCount() - 2)){
                iSelect = oList.getRowCount() - 2;
            }
            
            // Rewrite List
            stockfox_edit_resetList(iSelect);
            
            // Reset Toolbar
            if(opener){ 
                opener.stockfox.ticker.oToolbarTicker.init();
        	} else{ 
        		window.stockfox.ticker.oToolbarTicker.init();
        	}
        }
                
    } catch(err){ alert("An unknown error occurred.\n"+ err); }
}

// Open the holding dialog
function stockfox_view_editHolding(bmk){
    if(opener){
		opener.openDialog('chrome://stockfox/content/holdings.xul','StockFoxEditHoldingDialog','centerscreen, chrome', bmk).focus();
	} else{
		window.openDialog('chrome://stockfox/content/holdings.xul','StockFoxEditHoldingDialog','centerscreen, chrome', bmk).focus();
	}
}


function stockfox_edit_organize(){
    var oList 	= document.getElementById("stockfox-edit-symbols");
    var oItem 	= oList.selectedItem;
    if(oItem != null ){
        if(oItem.getAttribute("symbol") == null){
            alert("Could not edit that symbol");
            return;
        }
		
		var symbol = oItem.getAttribute("symbol");
		var stock = stockfox.persistence.getSavedStock( symbol );
	    stockfox_view_editHolding(stock); 
		
		stockfox_edit_sendUpdate();
		
	     // Reset Toolbar
        if(opener){ 
            opener.stockfox.ticker.oToolbarTicker.init();
    	} else{ 
    		window.stockfox.ticker.oToolbarTicker.init();
    	}
	}
}

function stockfox_edit_moveup(){
    var oList 	= document.getElementById("stockfox-edit-symbols");
    var oItem 	= oList.selectedItem;
    if(oItem != null ){
        if(oItem.getAttribute("symbol") == null){
            alert("Could not edit that symbol");
            return;
        }
		
		var symbol = oItem.getAttribute("symbol");
		// move symbol up
		stockfox.utils.moveStockUp( symbol );
		
		var index = oList.selectedIndex;
		
		stockfox_edit_resetList(index-1);
		
	     // Reset Toolbar
        if(opener){ 
            opener.stockfox.ticker.oToolbarTicker.init();
    	} else{ 
    		window.stockfox.ticker.oToolbarTicker.init();
    	}
	}
}

function stockfox_edit_movedown(){
    var oList 	= document.getElementById("stockfox-edit-symbols");
    var oItem 	= oList.selectedItem;
    if(oItem != null ){
        if(oItem.getAttribute("symbol") == null){
            alert("Could not edit that symbol");
            return;
        }
		
		var symbol = oItem.getAttribute("symbol");
		// move symbol up
		stockfox.utils.moveStockDown( symbol );
		
		var index = oList.selectedIndex;
		
		stockfox_edit_resetList(index+1);
		
	     // Reset Toolbar
        if(opener){ 
            opener.stockfox.ticker.oToolbarTicker.init();
    	} else{ 
    		window.stockfox.ticker.oToolbarTicker.init();
    	}
	}
}


// Enable the remove button
function stockfox_edit_enableButtons(enabled){
    document.getElementById("stockfox-remove-button").setAttribute("disabled", (!enabled) );
	document.getElementById("stockfox-organize-button").setAttribute("disabled", (!enabled) );
	document.getElementById("stockfox-moveup-button").setAttribute("disabled", (!enabled) );
	document.getElementById("stockfox-movedown-button").setAttribute("disabled", (!enabled) );
}