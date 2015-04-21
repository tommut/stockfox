stockfox.persistence.doesStockExist = function(stockSymbol){
	var savedStock = stockfox.persistence.getSavedStock( stockSymbol );
	return savedStock != null;
}

stockfox.persistence.getSavedStock  = function(stockSymbol){
	var savedStocks = stockfox.persistence.getSavedStocks();
	for( var i = 0; i < savedStocks.length; i++ ) {
		if ( savedStocks[i].symbol == stockSymbol ) {
			return  savedStocks[i];
		}
	}
	return null;;
}


// Function to add a new stock
stockfox.persistence.addStock = function(stock){
	var symbol = stock.symbol;
	// Should always be valid
	if(!(symbol == "")){
		// Also should always be calling this to add a completely new bookmark
		if(!stockfox.persistence.doesStockExist(stock.symbol)){
			var savedStocks = stockfox.persistence.getSavedStocks();
			stockfox.utils.insertIntoArray( savedStocks, stock, 0 );
			stockfox.persistence.updateStocksPref( savedStocks ); 
		} else{
			throw bookmarkExistsError;
		}
	} else{
		throw stockfox.globals.stockfox_invalidSomething;
	}
}

stockfox.persistence.updateStocksPref = function(savedStocks) {
	var stockString = JSON.stringify(savedStocks);
	stockfox.persistence.setUnicodePref( "stocks", stockString );
	stockfox.globals.stockFox_prefs.savePrefFile(null); 
}

/* get unicode string value from preference store */
stockfox.persistence.getUnicodePref = function(prefName) {
    return stockfox.globals.pSrv.getComplexValue(prefName, stockfox.globals.stockFox_nsISupportsString).data;
}

/* set unicode string value */
stockfox.persistence.setUnicodePref = function(prefName,prefValue) {
    var sString = Components.classes["@mozilla.org/supports-string;1"].createInstance(stockfox.globals.stockFox_nsISupportsString);
    sString.data = prefValue;
    stockfox.globals.pSrv.setComplexValue(prefName,stockfox.globals.stockFox_nsISupportsString,sString);
}


stockfox.persistence.getSavedStocks = function() {
	var stocks = stockfox.persistence.getUnicodePref( "stocks" );
	if ( stocks == null || stocks.length == 0 ) {
		// set up default list of stocks on new install
		var stockArr = new Array();		
		var oStock	= new stockfox.stockManager.Stock();
	            oStock.symbol			= "^GSPC"
	            oStock.name	 			= "S&P 500 INDEX";
				oStock.displayName	 	= "S&P 500";
	            oStock.stockPrice		= 1.12;
	            oStock.priceChange		= 1.22;
	            oStock.previousClose	= 1.12;
	            oStock.lastUpdate		= (new Date()).getTime();
		stockArr[0] = oStock;
		
        oStock	= new stockfox.stockManager.Stock();
	            oStock.symbol			= "^DJI"
	            oStock.name	 			= "Dow Jones Industrial Average";
	            oStock.displayName	 	= "Dow Jones";
	            oStock.stockPrice		= 88.12;
	            oStock.priceChange		= 1.22;
	            oStock.previousClose	= 85.12;
	            oStock.lastUpdate		= (new Date()).getTime();
		stockArr[stockArr.length] = oStock;
		
		var oStock	= new stockfox.stockManager.Stock();
	        oStock.symbol			= "YHOO"
	        oStock.name	 			= "Yahoo! Inc";
	        oStock.stockPrice		= 88.12;
	        oStock.priceChange		= 1.22;
	        oStock.previousClose	= 85.12;
	        oStock.lastUpdate		= (new Date()).getTime();
	    stockArr[stockArr.length] = oStock; 	
		
		// JSON available in FF 3.5 and later
		var stockString = JSON.stringify(stockArr);
		stockfox.persistence.setUnicodePref( "stocks", stockString );
	}
	else {
		stockArr = JSON.parse(stocks);
	}

	
	return stockArr;
}

// Function to add a new stock
stockfox.persistence.updateStock = function(stock){
	var symbol = stock.symbol;
	// Should always be valid
	if(!(symbol == "")){
		// Also should always be calling this to add a completely new bookmark
		if(!stockfox.persistence.doesStockExist(stock.symbol)){
			stockfox.persistence.addStock( stock );
		}
		else {
			var savedStocks = stockfox.persistence.getSavedStocks();
			for( var i = 0; i < savedStocks.length; i++ ) {
				if ( savedStocks[i].symbol == symbol ) {
					savedStocks[i] = stock;
					break;
				}
			}
			stockfox.persistence.updateStocksPref( savedStocks );
		} 
	} else{
		throw stockfox.globals.stockfox_invalidSomething;
	}
}