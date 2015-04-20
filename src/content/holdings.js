stockfox.ticker.oStockManager 	= null;
stockfox.holdings.edited = false;

// Callback on stockfox.ticker.oStockManager
stockfox.holdings.updateListener = {
	update : function(){ 
	stockfox.holdings.view_refreshList(-1) }
}

// Load Stock Symbol list precursor
stockfox.holdings.view_load =function(){
	stockfox.ticker.oStockManager = new stockfox.stockManager.StockManager(stockfox.holdings.updateListener);
	
	//stockfox.holdings.view_loadList(-1);
}

// Load Stock Symbol list
stockfox.holdings.view_loadList = function(iRowSelect){
	if(iRowSelect == null)
		iRowSelect = -1;
        
    var sList 	= document.getElementById("stockfox-stocklist-box");
	var hList 	= document.getElementById("stockfox-holdings-box");
    var lHead   = document.createElement("listhead");
    var lCols   = document.createElement("listcols");
    
    // Create the holdings table layout
    var lHeader = document.createElement("listheader");
    lHeader.setAttribute("label", "Stock Description");
    lHeader.setAttribute("tooltiptext", "Stock Description");
    lHead.appendChild(lHeader);
    
    lHeader = document.createElement("listheader");
    lHeader.setAttribute("label", "Quantity");
    lHeader.setAttribute("tooltiptext", "Quantity");
    lHead.appendChild(lHeader);
    
    lHeader = document.createElement("listheader");
    lHeader.setAttribute("label", "Avg. Cost");
    lHeader.setAttribute("tooltiptext", "Avgerage Cost");
    lHead.appendChild(lHeader);
    
    lHeader = document.createElement("listheader");
    lHeader.setAttribute("label", "Market Value/Gain or Loss");
    lHeader.setAttribute("tooltiptext", "Market Value/Gain or Loss");
    lHead.appendChild(lHeader);
    
    hList.appendChild(lHead);
    
    var lCol = document.createElement("listcol");
    lCol.setAttribute("flex", 1);
    lCols.appendChild(lCol);
    
    lCol = document.createElement("listcol");
    lCol.setAttribute("flex", 1);
    lCols.appendChild(lCol);
    
    lCol = document.createElement("listcol");
    lCol.setAttribute("flex", 1);
    lCols.appendChild(lCol);
    
    lCol = document.createElement("listcol");
    lCol.setAttribute("flex", 1);
    lCols.appendChild(lCol);
    
    hList.appendChild(lCols);
    
	var aStocks = stockfox.persistence.getSavedStocks();
    
	// Sort and Add Symbols to list
	var aSymbols 	= stockfox.ticker.oStockManager.stocks;  
    
	for(var i = 0; i < aSymbols.length; i++){
		try{
            // Stock List Section
			var sString 	= aSymbols[i].symbol +" "+ aSymbols[i].price +" ( "+ aSymbols[i].change +" / "+ aSymbols[i].changePercent +"% )";
			var oItem 		= sList.appendItem(sString, "");
			oItem.setAttribute("symbol", aSymbols[i].symbol);
			oItem.setAttribute("onclick", "stockfox.holdings.view_enableView()");
			oItem.setAttribute("ondblclick", "stockfox.holdings.view_moreDetails()");
			oItem.setAttribute("tooltiptext", aSymbols[i].displayName + ": Last Updated: "+ aSymbols[i].lastUpdate ); 
			
			// if it's Saturday/Sunday, or after 2 am, but before 9:30 - no change
			var currentDate = new Date();
             if ( stockfox.ticker.oStockManager.isMarketClosedCurrently() ){
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
                
            // Portfilo Section
			// do it here
			var quantity = 0;
            var cost = 0;
			for( var j = 0; j < aStocks.length; j++ ) {
				if ( aStocks[j].symbol == aSymbols[i].symbol ) {
					if ( aStocks[j].quantity != null ) { 
						quantity = aStocks[j].quantity;
					}
					if ( aStocks[j].price != null ) { 
						cost = aStocks[j].price;
					}
					break;
				}
			}
            // Create a holding according to the table layout for Portfolio tab
            var lItem = document.createElement("listitem");
            var lCell = document.createElement("listcell"); 
            lCell.setAttribute("label", aSymbols[i].name);
            lItem.appendChild(lCell);
            var lCell = document.createElement("listcell"); 
            lCell.setAttribute("label", quantity);
            lItem.appendChild(lCell);
            
            var lCell = document.createElement("listcell"); 
            lCell.setAttribute("label", cost);
            lItem.appendChild(lCell);
            var lCell = document.createElement("listcell");
            var mValue = (aSymbols[i].price * quantity);
            var purchaseCost = (cost * quantity);
            if(mValue < purchaseCost) 
				lCell.style.color = stockfox.globals.pSrv.getCharPref("color.down");
			else if(mValue > purchaseCost) {
				lCell.style.color = stockfox.globals.pSrv.getCharPref("color.up");
			}
			else
				lCell.style.color = stockfox.globals.pSrv.getCharPref("color.neutral");
            lCell.setAttribute("label", mValue.toFixed(2) + "/" + (mValue - purchaseCost).toFixed(2));
            lItem.appendChild(lCell);            
            // Set listitem details
			lItem.setAttribute("onclick", "stockfox.holdings.view_enableView()");
			lItem.setAttribute("ondblclick", "stockfox.holdings.edit_holding()");
            lItem.setAttribute("symbol", aSymbols[i].symbol);
			lItem.setAttribute("tooltiptext", aSymbols[i].displayName + ": Last Updated: "+ aSymbols[i].lastUpdate ); 
			
			hList.appendChild(lItem);
				
		} catch(err){
            stockfox.globals.logIt(err);
        }
	}
    
	// Last Update
	if(document.getElementById('stockfox-view-update') != null){
		document.getElementById('stockfox-view-update').value = "Last Update: "+  stockfox.utils.formatDate( stockfox.ticker.oStockManager.mostRecentTradeDate);
	}
	// Select Row
	hList.selectedIndex = iRowSelect;
    sList.selectedIndex = iRowSelect;
}

// Reset Holdings Symbol List
stockfox.holdings.view_refreshList = function(iRowSelect){
	var hList = document.getElementById("stockfox-holdings-box");
	var sList = document.getElementById("stockfox-stocklist-box");
    
	if(iRowSelect == null)
		iRowSelect = -1;
    
	// Remove all holdings
	while (hList.firstChild){
        hList.removeChild(hList.firstChild);
    }

    // Remove all items
	while (sList.firstChild){
        sList.removeChild(sList.firstChild);
    }
	
	// Load List
	setTimeout(function() { stockfox.holdings.view_loadList(iRowSelect) }, 100);
}
	
// Enable whichever buttons
stockfox.holdings.view_enableView = function(){
    var lPanelSelect = document.getElementById("stockfox-tabbox").selectedIndex;
    var lBoxSelect = document.getElementById("stockfox-tabbox").selectedPanel.firstChild.selectedIndex;
	document.getElementById("stockfox-view-button").setAttribute("disabled", (lBoxSelect == -1) );
    document.getElementById("stockfox-editholding-button").setAttribute("disabled", lBoxSelect == -1 );
}

// View Details about stock symbol
stockfox.holdings.view_moreDetails = function(){
	// Get Symbol
	var oList = (document.getElementById("stockfox-tabbox").selectedIndex == 0? document.getElementById("stockfox-stocklist-box") : document.getElementById("stockfox-holdings-box"));
	if(oList != null && oList.selectedItem != null){
		sSymbol = oList.selectedItem.getAttribute("symbol");
	}
	
	// Direct User
	if(sSymbol != null){
		try{
			var symbol = sSymbol;
			var savedStock = stockfox.persistence.getSavedStock( sSymbol );
			if ( savedStock != null ) {
				if ( savedStock.displaySymbol != undefined ) {
					symbol= savedStock.displaySymbol;
				}
			}
		

            sUrl = stockfox.globals.pSrv.getCharPref("details.site");
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
		} catch(e){ alert(e); }
		try{
			//self.close();  
		} catch(e){ }
	} else{
		alert("Could not launch more information");
	}
}


// Edit user holding in the side menu
stockfox.holdings.edit_holding = function(){ 
	var hList = (document.getElementById("stockfox-tabbox").selectedIndex == 0? 
		document.getElementById("stockfox-stocklist-box") : document.getElementById("stockfox-holdings-box"));
	
	var hItem = null;
	if(hList != null && hList.selectedItem != null){
		hItem = hList.selectedItem;
	}
    
    if(hItem.getAttribute("symbol") == null){ 
        alert("Could not remove that symbol");
        return;
    }
    
    // Need to check and handle possible duplicates
  
  	var symbol = hItem.getAttribute("symbol");
	var stock = stockfox.persistence.getSavedStock( symbol );
    stockfox.holdings.stockfox_view_editHolding(stock);
	stockfox.holdings.edited = true;
}

// Open the holding dialog
stockfox.holdings.stockfox_view_editHolding = function(bmk){
    if(opener){
		opener.openDialog('chrome://stockfox/content/holdings.xul','StockFoxEditHoldingDialog','centerscreen, chrome', bmk).focus();
	} else{
		window.openDialog('chrome://stockfox/content/holdings.xul','StockFoxEditHoldingDialog','centerscreen, chrome', bmk).focus();
	}
}