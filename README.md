fitbit-to-sqlite
================

1. Creates NodeJS proxy for the Fitbit API
2. Fetches selected data into the SQLite DB

#### Configuration:

Insert your Fitbit user & dev information into the config section in the `app.js` file

	/* --- config --- */
	var USER_ID         = '',
    	CONSUMER_KEY    = '',
	    CONSUMER_SECRET = '',
	    DB_NAME         = './fitbit.db',
    	APP_PORT        = 8553;


#### API:

1. GET requests:  

	`/rest/activities/{yyyy-mm-dd}`  
	`/rest/body/{yyyy-mm-dd}`  
	`/rest/foods/{yyyy-mm-dd}`  
	`/rest/glucose/{yyyy-mm-dd}`  
	`/rest/heart/{yyyy-mm-dd}`  
	`/rest/sleep/{yyyy-mm-dd}`  
	`/rest/profile`

* POST/PUT requests: 
 
	`/rest/update` - update new data  
	`/rest/xupdate` - force update all existing data

#### Dependencies:  

* connect
* sqlite3
* dateformat
* fitbit-js

 
