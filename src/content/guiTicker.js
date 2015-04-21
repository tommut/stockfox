	
stockfox.globals.stockFox_lastStatusBarClick = new Date().getTime();
stockfox.globals.handleClick = function(event, symbol, obj) { 
	if (event.button==1) { 
		stockfox.ticker.context_showNext();
		return;
	}
	
	if ( event.button != 0 &&  event.button != 1 ) {
		return;
	}

	var currentClickTime = new Date().getTime();
	if ( stockfox.globals.stockFox_lastStatusBarClick != null &&  
		( (currentClickTime - stockfox.globals.stockFox_lastStatusBarClick ) < 700 ) ) {
		// double click
		if (event.button==0) {
			stockfox.ticker.stockfox_viewDetails (symbol);
		}
    }
	else {
//		if (event.button==0) stockfox.ticker.context_showNext(); 
//		if (event.button==1) stockfox.ticker.context_showPrev();

	}
	stockfox.globals.stockFox_lastStatusBarClick = currentClickTime;
}

stockfox.globals.handleDblClick = function(event, symbol) { 
	if (event.button==1) { 
		stockfox.ticker.context_showNext();
		return;
	}
	
	if ( event.button != 0 &&  event.button != 1 ) {
		return;
	}


	var currentClickTime = new Date().getTime();
	if ( stockfox.globals.stockFox_lastStatusBarClick != null &&  
		( (currentClickTime - stockfox.globals.stockFox_lastStatusBarClick ) < 700 ) ) {
		// double click
		if (event.button==0) {
			stockfox.ticker.stockfox_viewDetails (symbol);
		}
    }
	else {
//		if (event.button==0) stockfox.ticker.context_showNext(); 
//		if (event.button==1) stockfox.ticker.context_showPrev();

	}
	stockfox.globals.stockFox_lastStatusBarClick = currentClickTime;
}

// Ticker tracker
stockfox.globals.guiTicker = function(bStockManager){
	this.increment	= -1;
	this.errorCount	= 0;
	this.manager	= bStockManager; 
	this.rotate		= null;
	this.paused		= false;
	
	this.pause = function(){
		this.paused = true;
	}
	
	this.play = function(){
		this.paused = false;
	}
	
	this.next = function(force, stopIfMarketClosed){
		if(stopIfMarketClosed && stockfox.ticker.oStockManager.isMarketClosedCurrently()) {
			try{
				if((this.increment + 1) >= this.manager.stocks.length) {
					this.increment = -1;
				}
				var oStock = this.manager.stocks[++this.increment];
				if(oStock != null){
					this.change(oStock, stopIfMarketClosed); // Refresh current
	                this.rotateTimeout(stockfox.globals.pSrv.getIntPref("speed"), stopIfMarketClosed);
					return;
				}
			} catch(e){
				stockfox.globals.logIt("error 1: " + e.message);
				//alert("error 1: " + e)
			}
		}
		if(this.paused && (force == null || force == false)){
			try{
				this.change(this.manager.stocks[this.increment]); // Refresh current
                this.rotateTimeout(stockfox.globals.pSrv.getIntPref("speed"), stopIfMarketClosed);
				return;
			} catch(e){
				//alert("error 2" + e)
				stockfox.globals.logIt("error 2: " + e.message);
			}
		}
		
		
		if((this.increment + 1) >= this.manager.stocks.length)
			this.increment = -1;
			
		var oStock = this.manager.stocks[++this.increment];
		
		if(oStock != null){
			this.change(oStock);
			this.rotateTimeout(stockfox.globals.pSrv.getIntPref("speed"), stopIfMarketClosed);
		} else{
			this.errorCount++;
			 if(this.errorCount >= this.manager.stocks.length){
			 	this.errorCount = 0;
			 	this.rotateTimeout(300, stopIfMarketClosed);
			 } else{
			 	this.next();
			 }
		}
	}
	
    // Handle the two different tickers
    this.rotateTimeout = function(speed, observeMarketClosed){
        speed = speed * 1000;
		this.rotate = window.setTimeout(function() {stockfox.ticker.oStatusTicker.next(false, observeMarketClosed) }, speed);
    }

	this.previous = function(force){
		if(this.paused && (force == null || force == false)){
			this.change(this.manager.stocks[this.increment]); // Refresh current
			this.rotateTimeout(stockfox.globals.pSrv.getIntPref("speed"));
			return;
		}
		
		if(this.increment < 1)
			this.increment = this.manager.stocks.length;
			
		var oStock = this.manager.stocks[--this.increment];
		
		if(oStock != null){
			this.change(oStock);
			this.rotateTimeout(stockfox.globals.pSrv.getIntPref("speed"));
		} else{
			this.errorCount++;
			 
			 if(this.errorCount >= this.manager.stocks.length){
			 	this.errorCount = 0;
			 	this.rotateTimeout(300);
			 } else{
			 	this.previous();
			 }
		}
	}
	
	this.change = function(oStock, stopIfMarketClosed){
        var oTicker;
        oTicker	= document.getElementById("sfToolbar");
		if(oTicker != null){
			window.clearTimeout(this.rotate);
			// Get String
			var sValue 	= oStock.displayName +" "+ oStock.price +" ( "+ oStock.change +" / "+ oStock.changePercent +"%)";
			
			// Update Label
            oTicker.setAttribute("label", sValue);
            var sfLabel	= document.getElementById("stockfox_label");
            sfLabel.value = sValue;
			oTicker.setAttribute("symbol", oStock.symbol);
            // Removes tooltiptext in case of network loss/regain, thanks Tom
            oTicker.removeAttribute("tooltiptext");
			oTicker.setAttribute("tooltip", "stockfox-tooltip");
			
			oTicker.removeAttribute("onclick");
			oTicker.setAttribute("onclick", "stockfox.globals.handleClick( event, this.getAttribute('symbol'), this )");
//			
//			oTicker.removeAttribute("ondblclick");
//			oTicker.setAttribute("ondblclick", "stockfox.globals.handleDblClick( event, this.getAttribute('symbol') )");
//			
			
			
			var isMarketClosed = this.manager.isMarketClosedCurrently();
			if ( stopIfMarketClosed && isMarketClosed ) {
				oTicker.setAttribute("label", "Market is closed.");
				sfLabel.value = "Market is closed.";
			}
			// Set Colors
			// if it's Saturday/Sunday, or after 2 am, but before 9:30 - no change
			if ( isMarketClosed ) {
				oTicker.style.color = stockfox.globals.pSrv.getCharPref("color.neutral");
			}	
			else {		
				if(parseFloat(oStock.change) < 0){
					oTicker.style.color = stockfox.globals.pSrv.getCharPref("color.down");
				} else if(parseFloat(oStock.change) > 0){
					oTicker.style.color = stockfox.globals.pSrv.getCharPref("color.up");
				} else{
					oTicker.style.color = stockfox.globals.pSrv.getCharPref("color.neutral");
				}
			}
		}
	}
}