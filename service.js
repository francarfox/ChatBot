var request = require("request");

function serviceController() {
    const token = 'abcd1234==';

    var getEntitiesFrom = function(session, json) {
        session.endDialog();
        session.beginDialog('/PickupAddress');
    };

    this.get = function(query, session, pickup, dropoff) {
        var url = 'https://www.example.com/api/createTrip?from='+pickup+'&to='+dropoff+'&token='+token;
        
        request.get(url, function (err, res, body) {
            if (!err) {
                var resultsObj = JSON.parse(body);
                getEntitiesFrom(session, resultsObj);
            }
        });
    }
    
};

module.exports = new serviceController();