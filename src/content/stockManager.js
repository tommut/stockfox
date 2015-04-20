// Manage stock updates
stockfox.stockManager.StockManager = function(oUpdateCallback){
	this.stocks = new Array();
	
	this.updateCallback	= oUpdateCallback;
	
	this.mostRecentTradeDate = null;
		
		// Init Object
		this.init = function(){
			// Refresh Stocks
			this.refreshStocks();
		}
		
		// Refresh Stocks
		this.refreshStocks = function(){
			try{
				// Retreive Symbols
				stockfox.utils.loadStocks(stockfox.persistence.getSavedStocks());
				
			} catch(err){
				stockfox.utils.sendError("Could not load stock data", 300, err);
			}
            
			// Set Refresh Interval
			setTimeout(function() { stockfox.ticker.oStockManager.refreshStocks() }, stockfox.globals.pSrv.getIntPref("update"));
		}
		
		// Add loaded stocks
		this.addLoadedStocks = function(aStocks){
			if(aStocks != null){
				this.stocks = new Array();
				this.stocks = aStocks;
				
				// record the most recent trade time
				this.mostRecentTradeDate = null;
       			for(var i = 0; i < this.stocks.length; i++){
					this.mostRecentTradeDate = stockfox.utils.getMostRecentTradeDate( this.mostRecentTradeDate,  this.stocks[i].lastUpdate );
					if ( this.stocks[i].priceAlert != null  && this.stocks[i].priceAlert != 0) { 
						this.handlePriceAlert( this.stocks[i] );
					}
				}
				if(this.updateCallback != null){
					try{
						this.updateCallback.update();
					} catch(e){}
				}
			}
		}
		
		this.handlePriceAlert = function( stock ) { 
			var priceAlert = parseFloat(stock.priceAlert);
			// if the price exceeds the user-set price alert, then alert
			var shouldAlert = parseFloat(stock.price) >= priceAlert ;  
			if ( stock.priceAlert < 0 ) {  // or if it's a negative value (alert if price goes below a value)
				priceAlert = -1 * priceAlert;
				shouldAlert = parseFloat(stock.price) <= priceAlert;
			}
			if ( shouldAlert ) {
				if ( !this.isMarketClosedCurrently() ) {
					
					var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				                    .getService(Components.interfaces.nsIPromptService);
					var flags=promptService.BUTTON_TITLE_IS_STRING * promptService.BUTTON_POS_0 +
							promptService.BUTTON_TITLE_IS_STRING * promptService.BUTTON_POS_1;     
					var msg = "Price alert for " + stock.symbol + "(" + stock.name + ") set at " +
						priceAlert + "; current stock price is " + stock.price;
						
					var lastAlertDateTime = stockfox.globals.pSrv.getCharPref("alerts.lastAlert");
					
					if ( lastAlertDateTime != null ) {
						var lastAlertDate = new Date( parseInt(lastAlertDateTime) );
						if ( lastAlertDate.getDate() != new Date().getDate() ) {
							stockfox.globals.pSrv.setCharPref("alerts.stocks","");
						}
						
					}
					var alreadyAlerted = false;
					var stockAlertPref = stockfox.globals.pSrv.getCharPref("alerts.stocks");
					if ( stockAlertPref == null ) {
						stockAlertPref = "";
					}
					
					var stockAlerts = stockAlertPref.split(",");
					for ( var i = 0; i < stockAlerts.length; i++ ) { 
						var stockAlert = stockAlerts[i];
						if ( stockAlert == stock.symbol ) { 
							alreadyAlerted = true;
							break;
						}
					}		
									
					
					if ( !alreadyAlerted ) {
						stockAlerts[stockAlerts.length] = stock.symbol;
						//alert( "SETTING STOCKALERT! " + JSON.stringify(stockAlerts) + " AND THIS TIME: " + new Date().getTime() );
						stockfox.globals.pSrv.setCharPref("alerts.lastAlert", new Date().getTime());
						stockfox.globals.pSrv.setCharPref("alerts.stocks", stockAlerts.join());
						
						// audible alert
						var gSound = Components.classes["@mozilla.org/sound;1"].createInstance(Components.interfaces.nsISound);
						gSound.beep();	
						
						// open alert dialog
						var buttonPressed = promptService.confirmEx(window,  "StockFox Price Alert for "+stock.symbol ,
					 	 	msg,  flags,  "Cancel Alert" , 	"Ok" , null, null, {});		  
						  
						// cancel pressed
						if ( buttonPressed == 0 ) {	
							stock.priceAlert = 0;
							stockfox.persistence.updateStock( stock );
							
							// remove any alerts
							for ( var i = 0; i < stockAlerts.length; i++ ) { 
								var stockAlert = stockAlerts[i];
								if ( stockAlert == stock.symbol ) { 
									stockfox.utils.removeElementByIndex( stockAlerts, i );
									stockfox.globals.pSrv.setCharPref("alerts.stocks", stockAlerts.join());
									break;
								}
							}
						}								
						
						// add this stock to alerted list so it doesn't come back again
					}
						
				}
			}
		
		}
		
		this.isMarketClosedCurrently = function() {
			if ( this.mostRecentTradeDate == null ) { 
				return false;
			}
			
			// if it's Saturday/Sunday, or after 2 am, but before 9:30 EDT - report as closed
			// get date in NY timezone	(the last trade dates are already in NY timezone)
		    // create Date object for current location
			var d = new Date();
		   
		    // convert to msec;  add local time zone offset; get UTC time in msec
		    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
			// get date for New York (where stock exchange lives)
		    // using supplied offset
			var offset = -5;   // NY is -5 GMT
		    var currentDate = new Date(utc + (3600000*offset));
			
			// actually - may want to convert both to EDT
			utc = this.mostRecentTradeDate.getTime() + (this.mostRecentTradeDate .getTimezoneOffset() * 60000);
		    var mostRecentTradeDateEDT = new Date(utc + (3600000*offset));
			
			var closed = false;
			
			// if the most recent trade is from a previous day, we are not open yet
			if ( currentDate.getDay() != mostRecentTradeDateEDT.getDay() ) { 
				closed = true;
				
				// if the trade is from yesterday and it is between midnight and 4 AM, let's
				// still show yesterday's trades (for the night owls out there)
				if ( (currentDate.getHours() >= 0 && currentDate.getHours() <= 3) &&
					  ( currentDate.getDate() == mostRecentTradeDateEDT.getDate() - 1 ) ) { 
					closed = false;
				}
			}
			
			return closed;
		}
        
	// Load Stock List when first created
	this.init();
}

// Stock object
stockfox.stockManager.Stock = function(){
	this.symbol			= null;
	this.name			= null;
	this.price			= "N/A";
	this.prevClose		= null;
	this.change			= "N/A";
	this.changePercent	= "N/A";
	this.lastUpdate 	= 0;
	this.displayName    = null;
	this.priceAlert 	= null;
}

// Stock object functions
stockfox.stockManager.Stock.prototype = {
	get stockPrice(){
		return this.price;
    },
  
    set stockPrice(price){
		//Remove unneeded formating
	//	if ( price.indexOf( "<" ) > -1 ) { 
	try {
	var parsed = parseFloat(price);;
	}
	catch ( e ) { 
	}
	// var stringParse = parseString( price );
		if ( (price+"").indexOf( "<" ) > -1 ) { 
	//	if (isNaN(price = parseFloat(price)) ) {
			price = price.replace(new RegExp("<[^>]*>", "g"), ""); // HTML 
			var aPrice = price.split("-");
		if(aPrice.length > 1)
			price = aPrice[1];
		}
		
		this.price = price;
		
		if( !isNaN(price = parseFloat(price)) ){
			this.price = price.toFixed(2);
		}
    },
	
	get priceChange(){
		return this.change;
    },
  
    set priceChange(change){
		if(change != null){
			this.change = change;
			
			// Format as Number
			if( !isNaN(change = parseFloat(change)) ){
				this.change = change.toFixed(2);
				
				if(this.change > 0){
					this.change = "+"+ this.change;
				}
			}
		
			this.calculate();
		}
    },
	
	get previousClose(){
		return this.prevClose;
    },
  
    set previousClose(pclose){
		if(pclose != null){
			this.prevClose = pclose;
			// Format as Number
			if( !isNaN(pclose = parseFloat(pclose)) ){
				this.prevClose = pclose;
			}
		
			this.calculate();
		}
    },	
	
	calculate: function(){
		// Fill Change Percent
		if( !isNaN(this.change) && !isNaN(this.prevClose)){
			this.changePercent = ((Math.abs(parseFloat(this.change)) / parseFloat(this.prevClose)) * 100).toFixed(2);
		}
	}
};