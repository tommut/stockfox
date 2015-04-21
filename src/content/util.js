// Request Listener
stockfox.utils.loadStocks_listener = {
	oInput:null,
	
	onDataAvailable: function (request, ctxt, input, offset, count){
		try{
			this.oInput = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
			this.oInput.init(input);
		} catch(e){ stockfox.utils.sendError("Could not load stock data", 202, e); }
	},

    onStartRequest: function (request, ctxt) { },
	
	onStopRequest: function (request, ctxt, status){
		try{
            //stockfox.globals.logIt("Begin logging");
			if(this.oInput == null){
				stockfox.utils.sendError("Could not load stock data", 202, "oInput is not defined\\nIs your internet connection up?");
				return;
			}
            //stockfox.globals.logIt("Attempt to get request from http channel");
			request = request.QueryInterface(Components.interfaces.nsIHttpChannel);
			if ( request == null ) { 
				request = request.QueryInterface(Components.interfaces.nsIHttpChannel);
				if ( request == null ) { 
					return;
				}
			}
			
			try {
				if(request == null || request.responseStatus  == null || request.responseStatus != 200){
					stockfox.utils.sendError("Could not load stock data", 201, "Could not connect to website.\\nIs your internet connection up?");
					return;
				}
			}
			catch (e ) {
				//alert(e);
				stockfox.globals.logIt("error 4: " + e.message);
			}
            
            var tmp = null;
			try { 
				tmp = this.oInput.available();
			}
			catch( e ) {
				// this call was failing in one instance; though the next oInput.available() call below still succeeded fine; tfm: 3/29/10
			}
			
			//Parse Response
            //stockfox.globals.logIt("Begin response splitting");
			var aResponse = null;
			try {
				aResponse = this.oInput.read(this.oInput.available()).split("\n");
			} 
			catch (e) {
			}
			//stockfox.globals.logIt(aResponse);
			// Create Stock Object
            var aStocks = new Array();
			if (aResponse != null) {
				//stockfox.globals.logIt("Begin array formation");
				for (var i = 0; i < aResponse.length; i++) {
					if (aResponse[i] != null && aResponse[i] != "") {
						var aInfo = aResponse[i].split(",");
						if (aInfo.length > 2) {
							var oStock = stockfox.utils.formatResponse(aResponse[i]);
							if (oStock != null) 
								aStocks[aStocks.length] = oStock;
						}
					}
				}
			}
			//stockfox.globals.logIt("Array formation complete");
			if(stockfox.ticker.oStockManager != null){
				stockfox.ticker.oStockManager.addLoadedStocks(aStocks);
				
				if(stockfox.ticker.oStatusTicker != null) {
					var observeMarketClose = stockfox.globals.pSrv.getBoolPref("observeMarketClose");  
					stockfox.ticker.oStatusTicker.next(false,observeMarketClose);
				}
                    
                if(stockfox.ticker.oToolbarTicker != null && stockfox.ticker.oToolbarTicker.start == false)
                    stockfox.ticker.oToolbarTicker.init();
			}
		} catch(err){
			stockfox.utils.sendError("Could not load stock data", 200, err);
		}		
	}
}

// Format the array that holds the response stats
stockfox.utils.formatResponse = function(aResponse, ignoreName){
    var aInfo = aResponse.split(",");
    if(aInfo.length > 2){
        if(aInfo.length > 7){
            // This occurs if the stock name has a comma inside it, causes the array to split and responses aren't as expected
            for(var i = 0; i < aInfo.length; i++){
                // Get the opening quotes
                var tmpPos1 = aInfo[i].indexOf("\"");
                if(tmpPos1 != -1){
                    // If opening quotes exist, get the closing quotes
                    var tmpPos2 = aInfo[i].indexOf("\"", tmpPos1+1);
                    if (tmpPos2 == -1){
                        /* If the closing quotes don't exist within the same part of the array, add each additional part of the array until
                                   * the closing quotes are found 
                                   */
                        for(var j = (i + 1); j < aInfo.length; j++){
                            // If this part of the array has the closing quotes at the end, finish off constructing this part of the array
                            if(aInfo[j].lastIndexOf("\"") == (aInfo[j].length-1)){
                                aInfo[i] = aInfo[i] + " " + aInfo[j];
                                j++;
                                // Shift the remaining pieces of the array back one
                                while (j < aInfo.length){
                                    aInfo[(j-1)] = aInfo[j];
                                    j++;
                                }
                                break;
                            // If haven't found the last piece of the array, continue adding the pieces together
                            } else if(aInfo[j].lastIndexOf("\"") == -1){
                                aInfo[i] = aInfo[i] + aInfo[j];
                            }
                        }
                    }
                }
            }
        }
        var oStock	= new stockfox.stockManager.Stock();
        oStock.symbol			= aInfo[0].replace(/^\"|\"$/g, ""); // Strip Quotes
        oStock.name	 			= aInfo[1].replace(/^\"|\"$/g, ""); // Strip Quotes
        oStock.stockPrice		= aInfo[2].replace(/^\"|\"$/g, ""); // Strip Quotes
        oStock.priceChange		= aInfo[3].replace(/^\"|\"$/g, ""); // Strip Quotes
        oStock.previousClose	= aInfo[4].replace(/^\"|\"$/g, ""); // Strip Quotes
		oStock.displayName = oStock.symbol;
		var savedStock = null;
		
		// workaround for Yahoo.  The Dow Jones no longer allows yahoo to provide 
		// this info via their web service for Dow ^DJI; so instead we must use the 
		// 1/100 Dow symbol ^DJX and multiply by 100
		if (oStock.symbol == "^DJX") {
			// if the results are for ^DJX, check the saved stocks to see if
			// there is a ^DJI, in which case we will assume that we just used
			// the workaround to query for the replacement stock ^DJX, and 
			// we will change the stock name back to ^DJI and multiply by 100
			// to get the rounded DOW value
			savedStock = stockfox.persistence.getSavedStock( "^DJI" );
			
			if (savedStock != null || stockfox.persistence.getSavedStock( "^DJX" ) == null ) { 
				oStock.symbol = "^DJI";
				oStock.displayName = oStock.symbol;
				oStock.stockPrice = oStock.stockPrice * 100;
				oStock.priceChange = oStock.priceChange * 100;
				oStock.previousClose = oStock.previousClose * 100;
			}
		}
		
		if (savedStock == null) {
			savedStock = stockfox.persistence.getSavedStock(oStock.symbol);
		}
		if ( savedStock != null ) {
			oStock.priceAlert = savedStock.priceAlert;
		}
		if ( !ignoreName ) {
			oStock.lastUpdate = aInfo[5].replace(/\"/g, "")  + " " + 
				aInfo[6].replace(/\"/g, "");  // if ignoring the name (Adding Stock) don't get the last update time (as those parameters are not requested)
			//alert( oStock.symbol + ": " + oStock.stockPrice + ": " +  oStock.lastUpdate );
			if ( savedStock != null ) {
				if ( savedStock.displayName != undefined ) {
					oStock.displayName = savedStock.displayName;
				}
			}
		}
		//alert( "return stock: " + JSON.stringify(oStock) );
        return oStock;
    }
    return null;
}





// Send Error to tickers
stockfox.utils.sendError = function(sMsg, iCode, sError){
	// Status Bar
	var oTicker	= document.getElementById("sfToolbar");
	if(oTicker != null){
		oTicker.setAttribute("label", "ERROR: "+ iCode);
		 var sfLabel	= document.getElementById("stockfox_label");
         sfLabel.value = "ERROR: "+ iCode;
		
		oTicker.setAttribute("symbol", "");
		oTicker.setAttribute("tooltiptext", sMsg);
		oTicker.setAttribute("ondblclick", "alert('"+ sError +"');");
	}
	
	// Toolbar Element
	var oTicker	= document.getElementById("stockfox-toolbar-label");
	if(oTicker != null){
		oTicker.setAttribute("value", "ERROR: "+ iCode);
		oTicker.setAttribute("symbol", "");
		oTicker.setAttribute("ondblclick", "alert('"+ sError +"');");
	}
}


// Populate stocks from query result
stockfox.utils.loadStocks = function(aStocks){
    if (aStocks.length > 0)
    {
        try{
            var sSymbols = "";
            var DJI_WORKAROUND = false;
            for(var i = 0; i < aStocks.length; i++){
        		// Make Symbols
    			if(i > 0) sSymbols += "+";
				
				// workaround for Yahoo.  The Dow Jones no longer allows yahoo to provide 
				// this info via their web service for Dow ^DJI; so instead we must use the 
				// 1/100 Dow symbol ^DJX and multiply by 100 when we get the price back
				if (aStocks[i].symbol == "^DJI") {
					aStocks[i].symbol = "^DJX";
				}
                
    			sSymbols +=  aStocks[i].symbol;
        	}
    		// Make Request
    		try{
    			var rand			= "&rand=" + Math.round(Math.random() * 200);
    			var oLoader			= Components.classes["@mozilla.org/network/stream-loader;1"].getService(Components.interfaces.nsIStreamLoader);
    			var oUri 			= Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIURI);
				
				var quoteSite = stockfox.globals.pSrv.getCharPref( "quotes.site" );
				if ( quoteSite == null || quoteSite.length == 0 ) {
					quoteSite = "finance.yahoo.com";
				}
				
				// http://finance.yahoo.com/d/quotes.csv?s=IBM&f=snl1c1pt1d1
				var flags = stockfox.globals.pSrv.getCharPref("quotes.detailsFlags");	
    			oUri.spec = "http://" + quoteSite + "/d/quotes.csv?s="+ sSymbols +"&f="+ flags + rand;   // d1t1 - last date and time
    			
    			//uk.finance.yahoo.com  --  add in an option for that...  
				//ca.finance.yahoo.com   - maybe make it a dropdown?  If I could find a directory of countries
				//de.finance.yahoo.com  - or localize it to whichever stock site?
    			var oChannel		= stockfox.globals.iSrv.newChannelFromURI(oUri).QueryInterface(Components.interfaces.nsIHttpChannel);
    			oChannel.asyncOpen(stockfox.utils.loadStocks_listener, null);
    				
    			oChannel 	= null;
    			oUri		= null;
    		} catch(err) { 
    			//alert("ERROR: "+ err)
    			stockfox.globals.logIt("error 3: " + err.message);
    		}
    		return null;
    	} catch(err){ throw err; }
        
    	return null;
    } else{
        return null;
    }
}



// Last updated string formating
stockfox.utils.formatDate = function(d){
	if ( d == null || d.length == 0 ) { 
		return "";
	}
	
	//var d		= new Date(iTimestamp);
	var iHour	= d.getHours();
    var iMins   = d.getMinutes();
    
    // Make sure there's a 0 in front of single digit minutes
    (iMins > 9?iMins = iMins:iMins = "0" + iMins);    
	var sAmPm	= "am";
	
	if(iHour > 12){
		iHour 	= iHour - 12;
		sAmPm	= "pm";
	}
	
	var sTime 	=	iHour +":"+ iMins + sAmPm +" ";
		sTime 	+=	(d.getMonth() + 1) +"/"+ d.getDate() +"/"+ d.getFullYear();
	
	
	// add yesterday, or other day
	var currentDate = new Date();
	if ( currentDate.getDay() != d.getDay() ) { 
		if ( d.getDay() == 0 ) { 
			sTime += " (Sunday)";
		}
		else if ( d.getDay() == 1 ) { 
			sTime += " (Monday)";
		}
		else if ( d.getDay() == 2 ) { 
			sTime += " (Tuesday)";
		}
		else if ( d.getDay() == 3 ) { 
			sTime += " (Wednesday)";
		}
		else if ( d.getDay() == 4 ) { 
			sTime += " (Thursday)";
		}
		else if ( d.getDay() == 5 ) { 
			sTime += " (Friday)";
		}
		else if ( d.getDay() == 6 ) { 
			sTime += " (Saturday)";
		}
	}
	
		
	return sTime;
}

// position is the number where you want to add the new element (stock) into 
// the array: stockFoxStocks	
stockfox.utils.insertIntoArray = function(stockFoxStocks, stock, position) {
	var origLength = stockFoxStocks.length;
	if ( position > origLength ) {
		position = origLength;
	}
	
	stockFoxStocks.length = stockFoxStocks.length + 1;

	for ( var i = origLength; i >=0; i-- ) {
		if ( i == position ) {
			stockFoxStocks[i] = stock;
			break;
		}
		else if ( i > position ) {
			stockFoxStocks[i] = stockFoxStocks[i-1];
		}
		else if ( i < position ) {
			break;
		}
	}
}


// index is the number of the element you wish to remove
// from the array: stockFoxStocks	
stockfox.utils.removeElementByIndex = function(stockFoxStocks, index) {
    for (index = index; index<stockFoxStocks.length;index++) {
        // assigns the value of elementnr+1 to elementnr, so you move all items by 1
        stockFoxStocks[index] = stockFoxStocks[index + 1];
    }
    stockFoxStocks.length=stockFoxStocks.length-1;
    
}

stockfox.utils.isDaylight = function() {
	var bInDST = false;
    // 2nd sunday of march
    var oDate = new Date();
    var dstStartDate = new Date();
    dstStartDate.setMonth(2);
    dstStartDate.setDate(1);
	//dstEndDate.setYear(2009);
    dateIdx = dstStartDate.getDay() ? 8 - dstStartDate.getDay() : 1;
    dstStartDate.setDate(dateIdx + 7);

    // first sunday of november
    var dstEndDate = new Date();
    dstEndDate.setMonth(10);
    dstEndDate.setDate(1);
    //dstEndDate.setYear(2009);

    var dateIdx = dstEndDate.getDay() ? 8 - dstEndDate.getDay() : 1;
    dstEndDate.setDate(dateIdx);

    if ((oDate.getMonth() > dstStartDate.getMonth()) && (oDate.getMonth() < dstEndDate.getMonth())) {
        bInDST = true;
    } else if (oDate.getMonth() == dstStartDate.getMonth()) {
        if (oDate.getDate() >= dstStartDate.getDate()) {
            bInDST = true;
        } else {
            bInDST = false;
        }
    } else if (oDate.getMonth() == dstEndDate.getMonth()) {
        if (oDate.getDate() < dstEndDate.getDate()) {
            bInDST = true;
        } else {
            bInDST = false;
        }
    } else {
        bInDST = false;
    }
    return bInDST;
}

stockfox.globals.isDST = stockfox.utils.isDaylight();

// index is the number of the element you wish to remove
// from the array: stockFoxStocks	
stockfox.utils.removeElement = function(stock) {
   	var savedStocks = stockfox.persistence.getSavedStocks();
	var indexToRemove = -1;
	for( var i = 0; i < savedStocks.length; i++ ) {
		if ( savedStocks[i].symbol == stock.symbol ) {
			indexToRemove = i;
			break;
		}
	}
	
	if ( indexToRemove > -1 ) {
		stockfox.utils.removeElementByIndex( savedStocks, indexToRemove );
		stockfox.persistence.updateStocksPref( savedStocks );
	}
}

stockfox.utils.getDateFromString = function(stockDateString) {
	var date = new Date();
	date.setMilliseconds( 0 );
	date.setSeconds( 0 );
	
	// 6:25pm 2/12/2010
	var index = stockDateString.indexOf( ':' );
	var hours = parseInt( stockDateString.substring( 0, index ) );
	var minutes = parseInt( stockDateString.substring( index + 1, index + 3) );
	var amOrPm = stockDateString.substring( index + 3, index + 5 );
	
	if ( amOrPm == "pm" ) { 
		if ( hours != 12 ) {
			hours = hours + 12;
		}
	}
	else { 
		if ( hours == 12 )  {  // 12 AM 
			hours = 0;
		}
	}
	date.setHours( hours );
	date.setMinutes( minutes );
	
	var dateArray = stockDateString.substring( index + 6 ).split( '/' );
	
	var month = parseInt( dateArray[0] );
	var date2 = parseInt( dateArray[1] );
	var year = parseInt( dateArray[2] + "".substring(0,4) );
	date.setMonth( month - 1 )/ // 0-11
	date.setDate( date2 );
	date.setFullYear( year );
	
	// convert to EDT
	var timezoneHours = date.getTimezoneOffset()/60;
	var DSTOffset = 5;
	if (  stockfox.globals.isDST ) {
		DSTOffset = DSTOffset - 1; // if in DST, should only be -4 EDT
	}
	var timezoneDiff = timezoneHours - DSTOffset; // 5 = EST
	date.setHours( date.getHours() - timezoneDiff );
	return date;
}



stockfox.utils.getMostRecentTradeDate = function( currentRecentTradeDate, stockDateString ) {
	var stockDate = stockfox.utils.getDateFromString( stockDateString );
	
	var currentDate = new Date();  // in current time zone; compareed to stock date (from current timezone)
//	var timezoneHours = currentDate.getTimezoneOffset()/60;
//	var timezoneDiff = timezoneHours - 5; // 5 = EDT
//	currentDate.setHours( currentDate.getHours() - timezoneDiff );
	
	var tCurrent = currentDate.getTime();
	var t2 = stockDate.getTime();
	if ( currentRecentTradeDate == null ) { 
		// if stock time is greater than the current date; must be yahoo mistake; return current date
		if ( t2 > tCurrent ) {
			// could instead assume that it was yesterday's date...
			stockDate.setDate( stockDate.getDate() - 1 );
			t2 = stockDate.getTime();
			if ( t2 > tCurrent ) {
				return currentDate;
			}
			else {
				return stockDate;
			}
		}
		else {
			return stockDate;
		}
	}
	else {
		var t1 = currentRecentTradeDate.getTime();
	
	    // Calculate the difference in milliseconds
		if ( t1 < t2 ) {
			if ( t2 > tCurrent ) {
				return currentRecentTradeDate; // if the stock date is greater than the current date; probably a mistake - use last known good date
			}
			else {
				return stockDate;
			}
		}
		else {
			return currentRecentTradeDate;
		}		
	}
}

stockfox.utils.moveStockUp = function(stockSymbol) {
   	var savedStocks = stockfox.persistence.getSavedStocks();
	var indexFound = -1;
	for( var i = 0; i < savedStocks.length; i++ ) {
		if ( savedStocks[i].symbol == stockSymbol ) {
			indexFound = i;
			break;
		}	
	}
	
	if ( indexFound > 0 ) {
		var tmpStock = savedStocks[indexFound-1];
		savedStocks[indexFound-1] = savedStocks[indexFound];
		savedStocks[indexFound] = tmpStock;
	}
		
	stockfox.persistence.updateStocksPref( savedStocks );
}

stockfox.utils.moveStockDown = function(stockSymbol) {
   	var savedStocks = stockfox.persistence.getSavedStocks();
	var indexFound = -1;
	for( var i = 0; i < savedStocks.length; i++ ) {
		if ( savedStocks[i].symbol == stockSymbol ) {
			indexFound = i;
			break;
		}
	}
	
	if ( indexFound > -1 && indexFound < savedStocks.length-1 ) {
		var tmpStock = savedStocks[indexFound+1];
		savedStocks[indexFound+1] = savedStocks[indexFound];
		savedStocks[indexFound] = tmpStock;
	}
		
	stockfox.persistence.updateStocksPref( savedStocks );
}
