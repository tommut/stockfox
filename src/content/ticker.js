/*
	ERROR CODES
	100 - 199 : ticker.js
	200 - 299 : util.js
	300 - 399 : stockManager.js
	400 - 499 : edit.js
*/

stockfox.ticker.gStockTicker_isLoaded	= false;

stockfox.ticker.StockFox_paused		= false;
stockfox.ticker.oStockManager = null;

stockfox.ticker.oStatusTicker	= null;
stockfox.ticker.oToolbarTicker 	= null;

// Init Ticker(s)
stockfox.ticker.stockfox_init = function(){
	if(!stockfox.ticker.gStockTicker_isLoaded){
        stockfox.ticker.gStockTicker_isLoaded = true;
		
		setTimeout(function() { stockfox.ticker.stockfox_load() }, 500);
	}
	// Show Status Bar Ticker
	var toolbarBtn = document.getElementById('sfToolbar');
	if ( toolbarBtn ) { 
		toolbarBtn.setAttribute("collapsed", (!stockfox.globals.pSrv.getBoolPref("display.status")));
	}
}

// Load all stocks
stockfox.ticker.stockfox_load = function(){
    try{
		stockfox.ticker.oStockManager 	= new stockfox.stockManager.StockManager();
		stockfox.ticker.oStatusTicker	= new stockfox.globals.guiTicker(stockfox.ticker.oStockManager);
		stockfox.ticker.oToolbarTicker	= new stockfox.globals.toolbarTicker(stockfox.ticker.oStockManager);
	} catch(e){ 
		stockfox.utils.sendError("Could not load stock data", 100, e);
	}	
}

// Handle preference changes
stockfox.ticker.stockfox_prefListener = function(branch, name){
    if (name == "lastupdate"){
        if (stockfox.ticker.oStockManager){
            stockfox.ticker.oStockManager.init();
        }
    } else if (name == "toolbar"){
        if (stockfox.ticker.oStockManager){
            if(stockfox.ticker.oToolbarTicker)
                stockfox.ticker.oToolbarTicker.init();
        }
    }
}


// Send the user to Yahoo! for stock details
stockfox.ticker.stockfox_viewDetails  = function(sSymbol){
    try{
		var symbol = sSymbol;
        sUrl = stockfox.globals.pSrv.getCharPref("details.site");
		
		var savedStock = stockfox.persistence.getSavedStock( sSymbol );
		if ( savedStock != null ) {
			if ( savedStock.displaySymbol != undefined ) {
				symbol= savedStock.displaySymbol;
			}
		}
		
        sUrl = sUrl.replace(/\$/g, symbol);
        
        if(opener){
            opener.gBrowser.selectedTab = opener.gBrowser.addTab(sUrl);
            opener.focus();
        } else if(top.document.getElementById("content") != null){
            var oBrowser = top.document.getElementById("content");  
            oBrowser.selectedTab = oBrowser.addTab(sUrl);
        } else{
            window.open(sUrl).focus();
        }
    
    } catch(e){ 
    	//alert(e);
    	stockfox.globals.logIt("error 6: " + e.message); 
    }
}

// Sets what object context is being called on
stockfox.ticker.gStockFox_contextTarget = null;
stockfox.ticker.gStockFox_contextTarget = null;

// Populate the context menu popup
stockfox.ticker.contextPopup = function(oTarget){
    stockfox.ticker.gStockFox_contextTarget	= true;
    stockfox.ticker.gStockFox_contextTarget = oTarget;
    
    if(oTarget.id.substring(0,7) == "ticker_" || oTarget.id == "stockfox-container"){
        document.getElementById("stockfox-context-next").setAttribute("collapsed", true);
        document.getElementById("stockfox-context-prev").setAttribute("collapsed", true);
        document.getElementById("stockfox-context-hide").setAttribute("collapsed", true);
    } else{
        document.getElementById("stockfox-context-hide").setAttribute("collapsed", false);
		document.getElementById("stockfox-context-next").setAttribute("collapsed", false);
        document.getElementById("stockfox-context-prev").setAttribute("collapsed", false);
    }
    
    // Hide rotation options
    if(stockfox.ticker.oStockManager.stocks.length < 2){
        document.getElementById("stockfox-context-pause").setAttribute("collapsed", true);
        document.getElementById("stockfox-context-continue").setAttribute("collapsed", true);
        document.getElementById("stockfox-context-next").setAttribute("collapsed", true);
        document.getElementById("stockfox-context-prev").setAttribute("collapsed", true);
    // Show rotation options
    } else{
        // Pause/Play
        if(stockfox.ticker.StockFox_paused){
            document.getElementById("stockfox-context-pause").setAttribute("collapsed", true);
            document.getElementById("stockfox-context-continue").setAttribute("collapsed", false);
        } else{
            document.getElementById("stockfox-context-pause").setAttribute("collapsed", false);
            document.getElementById("stockfox-context-continue").setAttribute("collapsed", true);
        }
    }
    
    // Pause
    stockfox.ticker.oStatusTicker.pause();
    stockfox.ticker.oToolbarTicker.pause();
}

// Load Stock Symbol list in the tooltip
stockfox.ticker.stockfox_tooltip_loadList = function(){
    var oList   = document.getElementById("stockfox-view-symbols");
    
    // clear previous tooltip items
    while (oList.hasChildNodes()) {
         oList.removeChild(oList.firstChild);
       }        
    
    // Sort and Add Symbols to list
    if(stockfox.ticker.oStockManager) {
        var aSymbols     = stockfox.ticker.oStockManager.stocks;
        oList.setAttribute( "rows",  aSymbols.length );  // set size of stock list
        var sString        = "";
        var oItem        = null;
        for(var i = 0; i < aSymbols.length; i++){
            try{
                sString     = aSymbols[i].displayName +" "+ aSymbols[i].price +" ( "+ aSymbols[i].change +" / "+ aSymbols[i].changePercent +"% )";
                oItem         = oList.appendItem(sString, "");
                oItem.setAttribute("symbol", aSymbols[i].symbol);
				
				if ( stockfox.ticker.oStockManager.isMarketClosedCurrently() ) {
					oItem.style.color = stockfox.globals.pSrv.getCharPref("color.neutral");
				}
				else {
	                if(parseFloat(aSymbols[i].change) < 0)
	                    oItem.style.color = stockfox.globals.pSrv.getCharPref("color.down");
	                else if(parseFloat(aSymbols[i].change) > 0)
	                    oItem.style.color = stockfox.globals.pSrv.getCharPref("color.up");
	                else
	                    oItem.style.color = stockfox.globals.pSrv.getCharPref("color.neutral");
				}
            } catch(err){}
        }
     }
    
    // Last Update
    if(document.getElementById('stockfox-view-update') != null){
	   document.getElementById('stockfox-view-update').value = "Last Update: "+ stockfox.utils.formatDate( stockfox.ticker.oStockManager.mostRecentTradeDate );
    }
}

// When context is about to hide
stockfox.ticker.contextHiding = function(){
    stockfox.ticker.gStockFox_contextTarget = false;
    
    if(!stockfox.ticker.StockFox_paused){
        stockfox.ticker.oStatusTicker.play();
        stockfox.ticker.oToolbarTicker.play();
    }
}

// When mouse is over the element
stockfox.ticker.stockfox_mouseover = function(){
    // Pause
    stockfox.ticker.oStatusTicker.pause();
    stockfox.ticker.oToolbarTicker.pause();
}

// When mouse leaves hover state
stockfox.ticker.stockfox_mouseout = function(){
    // Un-Pause
    if(!stockfox.ticker.gStockFox_contextTarget && !stockfox.ticker.StockFox_paused){
        stockfox.ticker.oStatusTicker.play();
        stockfox.ticker.oToolbarTicker.play();
    }
}

// Send user to Yahoo! for more stock details
stockfox.ticker.context_view = function(){
    if(stockfox.ticker.gStockFox_contextTarget){
        stockfox.ticker.stockfox_viewDetails(stockfox.ticker.gStockFox_contextTarget.getAttribute('symbol'));
    }
}


// Hide ticker
stockfox.ticker.context_hide = function(){
    if(stockfox.ticker.gStockFox_contextTarget){
        stockfox.ticker.gStockFox_contextTarget.setAttribute("collapsed", true);
        
        // Set Preference
        stockfox.globals.pSrv.setBoolPref("display.status", false);
    }
}

// View all stocks
stockfox.ticker.context_viewAll = function(){
    if(stockfox.ticker.oStockManager)
        window.openDialog('chrome://stockfox/content/sidenav.xul','StockFoxViewDialog','centerscreen, chrome, resizable').focus();
}

// Show Next Stock
stockfox.ticker.context_showNext = function(){
    stockfox.ticker.oStatusTicker.next(true);
} 

// Show Previous Stock
stockfox.ticker.context_showPrev = function(){
    stockfox.ticker.oStatusTicker.previous(true);
} 

// Continue rotating stocks
stockfox.ticker.context_continue = function(){
    stockfox.ticker.StockFox_paused = false;		
    stockfox.ticker.oStatusTicker.play();
    stockfox.ticker.oToolbarTicker.play();
}

// Pause rotation
stockfox.ticker.context_pause = function(){
    stockfox.ticker.StockFox_paused = true;
    stockfox.ticker.oStatusTicker.pause();
    stockfox.ticker.oToolbarTicker.pause();
}