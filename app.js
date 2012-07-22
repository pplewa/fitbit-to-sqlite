/* --- config --- */

var CONSUMER_KEY    = '',
    CONSUMER_SECRET = '',
    PERIOD          = 'max', // 1d, 7d, 30d, 1w, 1m, 3m, 6m, 1y, max
    DB_NAME         = './fitbit.db',
    APP_PORT        = 8553;

/* --- modules --- */

var express = require('express'),
    connect = require('connect'),
    sqlite  = require('sqlite3').verbose(),
    fitbit  = require('fitbit-js')(CONSUMER_KEY, CONSUMER_SECRET, 'http://localhost:' + APP_PORT + '/'),
    app     = express.createServer(connect.bodyParser(), connect.cookieParser('session'), connect.session()),
    db      = new sqlite.Database(DB_NAME);

/* --- * --- */

var token = {};

var API_MAP = Object.create({}, {
    activities: { value: '/user/-/activities/date/{date}.json', enumerable: true },
    body:       { value: '/user/-/bp/date/{date}.json', enumerable: true  },
    foods:      { value: '/user/-/foods/log/date/{date}.json', enumerable: true  },
    glucose:    { value: '/user/-/glucose/date/{date}.json', enumerable: true  },
    heart:      { value: '/user/-/heart/date/{date}.json', enumerable: true  },
    sleep:      { value: '/user/-/sleep/date/{date}.json', enumerable: true }, 
    profile:    { value: '/user/-/profile.json' },
    parseURL:   { value: 
        function(args) {
            return this[args[0]].replace('{date}', args[1] || 'today');
        }
    }
});

var logs = ['foods/log/caloriesIn', 'foods/log/water', 'activities/calories', 'activities/steps', 'activities/distance', 'activities/floors', 'activities/elevation', 'activities/minutesSedentary', 'activities/minutesLightlyActive', 'activities/minutesFairlyActive', 'activities/minutesVeryActive', 'activities/activeScore', 'activities/activityCalories', 'sleep/startTime', 'sleep/timeInBed', 'sleep/minutesAsleep', 'sleep/awakeningsCount', 'sleep/minutesAwake', 'sleep/minutesToFallAsleep', 'sleep/minutesAfterWakeup', 'sleep/efficiency', 'body/weight', 'body/bmi', 'body/fat'];

/* --- rest --- */

app.get('/', function (req, res) {
    fitbit.getAccessToken(req, res, function (error, newToken) {
        if(newToken) {
            token = newToken;
            res.send(200);
        }
    });
});

app.post('/rest/update', function (req, res) {
    var logData = function(err, resp) {
        var log = this.toString().replace(/\//g, '-'), 
            res = resp[log],
            tab = log.substr(0, log.indexOf('-')),
            col = log.substr(log.lastIndexOf('-') + 1);

        res.forEach(function(row){
            db.run("INSERT INTO " + tab + " (logDate) VALUES (?)", [row.dateTime], function(){
                db.run("UPDATE " + tab + " SET " + col + " = ? WHERE logDate = ?", [row.value, row.dateTime]);
            });
        });
    };

    logs.forEach(function(log) {
        fitbit.apiCall('GET', '/user/-/' + log + '/date/today/' + PERIOD + '.json', { token: token }, logData.bind(log));
    });

    res.send(200);
});

// map requests
app.get(/^\/rest\/(\w+)(?:\/)?(\d{4}-\d{2}-\d{2})?/, function (req, res) {
    if(API_MAP.hasOwnProperty(req.params[0])) {
        fitbit.apiCall('GET', API_MAP.parseURL(req.params), { token: token }, function(err, resp) {
            res.json(resp);
        });
    } else {
        res.send(500);
    }
});

// db.close();
app.listen(APP_PORT);
console.log('listening at http://localhost:' + APP_PORT + '/');