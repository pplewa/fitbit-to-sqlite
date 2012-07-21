/* --- config --- */

var USER_ID         = '',
    CONSUMER_KEY    = '',
    CONSUMER_SECRET = '',
    DB_NAME         = './fitbit.db',
    APP_PORT        = 8553;

/* --- modules --- */

var express = require('express'),
    connect = require('connect'),
    sqlite  = require('sqlite3').verbose(),
    date    = require('dateformat'),
    fitbit  = require('fitbit-js')(CONSUMER_KEY, CONSUMER_SECRET, 'http://localhost:' + APP_PORT + '/'),
    app     = express.createServer(connect.bodyParser(), connect.cookieParser('session'), connect.session()),
    db      = new sqlite.Database(DB_NAME);

/* --- * --- */

var token   = {},
    API_MAP = Object.create({}, {
        activities: { value: '/user/{user-id}/activities/date/{date}.json', enumerable: true },
        body:       { value: '/user/-/bp/date/{date}.json', enumerable: true  },
        foods:      { value: '/user/{user-id}/foods/log/date/{date}.json', enumerable: true  },
        glucose:    { value: '/user/-/glucose/date/{date}.json', enumerable: true  },
        heart:      { value: '/user/-/heart/date/{date}.json', enumerable: true  },
        sleep:      { value: '/user/{user-id}/sleep/date/{date}.json', enumerable: true }, 
        profile:    { value: '/user/{user-id}/profile.json', enumerable: false  },
        parseURL:   { value: 
            function(args) {
                return this[args[0]]
                    .replace('{user-id}', USER_ID)
                    .replace('{date}', args[1] || date(new Date(), 'yyyy-mm-dd'));
            }, 
            writable: false
        }
    });

/* --- rest --- */

app.get('/', function (req, res) {
    fitbit.getAccessToken(req, res, function (error, newToken) {
        if(newToken) {
            token = newToken;
            res.writeHead(200, {'Content-Type':'text/html'});
            res.end('<html>Authenticated!</html>');
        }
    });
});

// 1. get joined
// functional programing
// deferred
app.get('/rest/update', function (req, res) {
    var lastUpdated, now = new Date(), i, j, k;

    db.get("SELECT last_updated FROM users WHERE fitbit_id = ?", [ USER_ID ], function(err, row){
        lastUpdated = row.last_updated;

        var year = date(now, 'yyyy'),
            month = date(now, 'm'),
            day = date(now, 'd'),
            years = year - date(lastUpdated, 'yyyy'),
            months = month - date(lastUpdated, 'm'),
            days = day - date(lastUpdated, 'd');

        for (i = 0; i <= years; i+1) {
            for (j = 0; j <= months; j+1) {
                for (k = 0; k <= days; k+1) {
                    for (i in API_MAP) {
                        fitbit.apiCall('GET', API_MAP.parseURL(
                        [i, date(new Date(year - years + i, month - months + j, days - day + k), 'yyyy-mm-dd')]), {
                            token: token
                        }, function(err, resp) {
                            // console.log()
                        }
                    }
                }
            }
        }

    });


        // var i;
        // for (i in API_MAP) {
        //     console.log(API_MAP.parseURL([i]));
        // }
        res.writeHead(200, {'Content-Type':'text/html'});
        res.end('<html>Authenticated!</html>');

    // fitbit.apiCall('GET', API_MAP.parseURL(req.params), { token: token }, function(err, resp) {
    //     res.writeHead(200, 'application/json');
    //     res.end(JSON.stringify(resp));
    // });


    // fitbit.apiCall('GET', '/user/' + USER_ID + '/profile.json', { token: token },
    //     function(err, resp) {
    //         res.writeHead(200, 'application/json');
    //         var map = ['encodedId', 'memberSince', 'displayName', 'fullName', 'dateOfBirth', 'gender', 'city', 'country', 'distanceUnit', 'avatar'],
    //             mapped = [];
    //         map.forEach(function(el){
    //             if (resp.user.hasOwnProperty(el)) {
    //                 mapped.push(resp.user[el]);
    //             }
    //         });

    //         // db.run("INSERT INTO users VALUES (NULL, '" + mapped.join("','") + "')");
    //         db.run("INSERT OR REPLACE INTO users VALUES (NULL, '" + mapped.join("','") + "')");

    //         res.end(JSON.stringify(resp));
    // });
});

// map requests
app.get(/^\/rest\/(\w+)(?:\/)?(\d{4}-\d{2}-\d{2})?/, function (req, res) {
    if(API_MAP.hasOwnProperty(req.params[0])) {
        fitbit.apiCall('GET', API_MAP.parseURL(req.params), { token: token }, function(err, resp) {
            res.writeHead(200, 'application/json');
            res.end(JSON.stringify(resp));
        });
    } else {
        res.writeHead(404, {'Content-Type':'text/html'});
        res.end();
    }
});

// db.close();
app.listen(APP_PORT);
console.log('listening at http://localhost:' + APP_PORT + '/');