Update: 
1.3.2
<b>Fixes</b>
- Did some resizing of edit window; did not look good in Windows 7 default theme.  Also made window resizable.
- added additional error handling
- Fixed: "error 2TypeError: oStock is undefined error" that was sometimes seen when clicking on stocks

 

1.3.1: 
<b>Fixes</b>
Updated menus for Firefox 4 compatibility
Official Update From Yahoo! regarding the Dow Jones Industrial symbol ^DJI: 9/10/2010:  "The limitation you are encountering is due to restrictions by the Dow
Jones Index. Yahoo! is no longer able to provide Dow Jones Index data in this manner."
I have worked around this the best I could - the ^DJI symbol will now fetch the Dow Jones 1/100 (^DJX) data instead and multiply the value by 100.  It is just
as accurate except you lose the 'cents' accuracy (example: 10402.00 instead of 10402.17)

 


1.3
<b>Improvements</b>
• You can now set price alerts for stocks.  When a stock exceeds or goes below that price point, an alert window will be displayed.
• New preference to hide or stop the tickers when the market is closed (after midnight, on weekends, and holidays)

<b>Fixes</b>
• Fixed: When displaying the web page details of a stock, would sometimes see an innocuous error.



1.2.2:
<b>Fixes</b>
• Fixed Daylight Savings Time bug - last updated date was off by an hour
• Fixed: fixed issue where some stocks (such as index funds) would cause the last updated date to always be the current date
• Fixed: when updating a stock ticker display name, wasn't updating the stock ticker immediately 

1.2.1:
<b>Fixes</b>
• Fixed issue where Edit button was not working

1.2
<b>Improvements</b>
• Added a new preference in Stock Details tab to Allow Editing of Stock Display Symbol.  If you change the details site, some providers use different stock symbols.  Enabling the option allows you to set a different symbol for using when displaying the stock.  For example, in Yahoo the symbol for Dow Jones is ^DJI, but if you change the  Display Site to use google.finance, the Dow Jones symbol is .DJI.
• Cleaned up context menus a bit
• Improved: clicking the Symbol Lookup will now use whatever value is entered in the stock symbol field
• Middle-clicking on a stock in the status bar will advance to the next stock.
    If you don't want your stocks to rotate through the list, you could pause the 
	rotation and just manually click through your list when you want.
• In the List/Portfolio view, you can hover over each stock to get a tooltip with showing the last trade date for that stock

<b>Fixes</b>
• Now properly handle other timezones when determining when market is closed
• Fixed: was showing the wrong day of the week in the tooltip 
• Fixed: was showing the wrong last updated date sometimes
• Fixed: context menu would lose the Next/Previous menus after clicking on the scrolling stock ticker
• Added a preference to use a different yahoo.finance site for obtaining stock quotes; type about:config in the url bar and change the preference: extensions.stockfox.quotes.site  from "finance.yahoo.com"  to any valid yahoo site "uk.finance.yahoo.com"  or "de.finance.yahoo.com"
• Rewrote code to protect against extension conflict and security vulnerabilities


1.1
Improvements
Added a new option for setting a Display Name for each stock. This is nice for when showing "S&P500" instead of the symbol ^GSPC.

You can edit stocks from anywhere the stocks are viewable.

You can now reorder your stocks by moving them up or down in the list.

Unified views - the sidebar (activated via F9) and 'View All' windows now use the same UI.

The stocks show in neutral colors on weekends and before the market opens.

The "Last updated" date is taken from the last reported trade date of your stocks.

Fixes
Stocks that were persisted as bookmarks were no longer working in Firefox 3.6. Changed to storing stocks internally. 