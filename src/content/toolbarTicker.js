// Ticker tracker
stockfox.globals.toolbarTicker = function(bStockManager){
    this.increment  = -1; 
	this.manager	= bStockManager;
	this.paused		= false;
    this.start      = false;
    this.timerId    = -1;
    this.removeId   = -1;
    this.opacity    = 10;
    this.last       = 0;
    this.first      = 0;
    this.array      = new Array();
	
	this.pause = function(){
		this.paused = true;
	}
	
	this.play = function(){
		this.paused = false;
	}
	
	this.init = function(){
        // Clear the toolbar (if possible) and begin the animation process
        this.start = true;
        var tBar = document.getElementById("stockfox-toolbar");
        if (tBar){
            this.increment  = -1;
            this.first      = 0;
            var spacer      = document.getElementById("stockfox-toolbar-spacer");
            
            spacer.setAttribute("width", tBar.boxObject.width);
            if (document.getElementById("stockfox-toolbar-label")){
                var tmpLbl = document.getElementById("stockfox-toolbar-label");
                tmpLbl.parentNode.removeChild(tmpLbl);
            }
            
            // Remove current labels
            var hbox = document.getElementById("stockfox-toolbar-hbox");
            while (hbox.firstChild){
                hbox.removeChild(hbox.firstChild);
            }
            
            if (this.timerId != -1)
                clearInterval(this.timerId);
            var observeMarketClose = stockfox.globals.pSrv.getBoolPref("observeMarketClose");    
            this.timerId = setInterval(function(thisObj) {thisObj.resizeFlex(spacer, observeMarketClose); }, stockfox.globals.pSrv.getIntPref("toolbar"), this);
            
            if((this.increment + 1) >= this.manager.stocks.length)
                this.increment = -1;
            
            var oStock = this.manager.stocks[++this.increment];
            var newLabel = this.buildLabel(oStock);
            
            var hbox = document.getElementById("stockfox-toolbar-hbox");
            hbox.appendChild(newLabel);
        }
	}
    
    this.canAddAnother = function(){
        // Handles all the fading and adding of labels
        var lastObj = document.getElementById(this.array[this.last]);
        var firstObj = document.getElementById(this.array[this.first]);
        
        var tBar = document.getElementById("stockfox-toolbar");
        
        // Check to see if the last object in the line of labels has enough room to begin a new label
        if (lastObj){
            if (((lastObj.boxObject.width + lastObj.boxObject.x) < tBar.boxObject.width)){
                if((this.increment + 1) >= this.manager.stocks.length)
                    this.increment = -1;
                
                // Make sure it doesn't already exist
                if (!(document.getElementById(this.array[(this.increment + 1)]))){
                    var oStock = this.manager.stocks[++this.increment];
                    var newLabel = this.buildLabel(oStock);
                    document.getElementById("stockfox-toolbar-hbox").appendChild(newLabel);
                }
            }
        }
        
        // Check to see if the first label needs to begin fading or be deleted
        if (firstObj){
            if (firstObj.boxObject.x <= 36){
                if (this.opacity == 10)
                    this.removeId = setTimeout(function(thisObj) {thisObj.removeFirst(); }, 1000, this);
                
                if (this.opacity > 0)
                    this.opacity--;

                if (firstObj)
                    firstObj.style.opacity = (this.opacity / 10);
            }
        }
    }
    
    this.removeFirst = function(){
        // Remove the first label when it reaches the end of the toolbar
        var spacer = document.getElementById("stockfox-toolbar-spacer");
        var first = document.getElementById(this.array[this.first]);
        
        spacer.setAttribute("width", (first.boxObject.width + spacer.boxObject.width + 10));
        first.parentNode.removeChild(first);
        
        this.opacity = 10;
        this.first++;
        
        if(this.first >= this.manager.stocks.length)
            this.first = 0;
    }
    
    this.resizeFlex = function(spacer, stopIfMarketClosed){
        // Resize the flex bar to give the appearance of moving stock labels
        var tBar = document.getElementById("stockfox-toolbar");
        
        if (!(tBar)){
            clearInterval(this.timerId);
        }      
		
		var isMarketClosed = this.manager.isMarketClosedCurrently();
		if ( stopIfMarketClosed && isMarketClosed ) {  
		//if ( observeMarketClose ) { 
			tBar.setAttribute("hidden", "true");		
			return;   
		}  
		tBar.removeAttribute("hidden");
        
        if (this.paused){
            return;
        }
        var width = spacer.boxObject.width;
        if (width > 6){
            spacer.setAttribute("width", width - 2);
        }
        this.canAddAnother();
        
    }

    this.buildLabel = function(oStock){
        // Build and return a label than can be appended to the stock list
        var label = document.createElement("label");
        var sValue = oStock.displayName +" "+ oStock.price +" ( "+ oStock.change +" / "+ oStock.changePercent +"%)   ";
		label.setAttribute("value", sValue);
        label.setAttribute("symbol", oStock.symbol);
        label.setAttribute("crop", "end");
        label.setAttribute("tooltiptext", "Last Updated: "+ oStock.lastUpdate ); 
        label.setAttribute("ondblclick", "stockfox.ticker.stockfox_viewDetails (\"" + oStock.symbol +"\")");
        label.setAttribute("contextmenu" , "stockfox-context-menu" );
        label.setAttribute("oncontextmenu", "stockfox.ticker.contextPopup(this)");
        
        var date = new Date();
        label.setAttribute("id", "ticker_" + date.valueOf());
        this.array[this.increment] = label.getAttribute("id");
        this.last = this.increment;
        
        // Set Colors
		// if it's Saturday/Sunday, or after 2 am, but before 9:30 - no change
		var currentDate = new Date();
         if ( this.manager.isMarketClosedCurrently() ){
			label.style.color = stockfox.globals.pSrv.getCharPref("color.neutral");
		}
		else {
	        if(parseFloat(oStock.change) < 0){
	            label.style.color = stockfox.globals.pSrv.getCharPref("color.down");
	        } else if(parseFloat(oStock.change) > 0){
	            label.style.color = stockfox.globals.pSrv.getCharPref("color.up");
	        } else{
	            label.style.color = stockfox.globals.pSrv.getCharPref("color.neutral");
	        }
		}
        
        return label;
    }
}