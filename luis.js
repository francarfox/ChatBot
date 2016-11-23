var request = require("request");

function luisController() {
    var url = 'https://api.projectoxford.ai/luis/v1/application?id=c0e72f38-585d-4c65-bf85-1b72c1f04e94&subscription-key=fb52d5544daa4502980880d147dee510&q=';

    var getEntitiesFrom = function(session, json) {
        var intent = json.intents[0].intent;
        var businessModel;
        var pickupAddress;

        json.entities.forEach(function(object) {
            if (object.type == 'BusinessModel') {
                businessModel = object.entity
            } else 
            if (object.type == 'Address::Street') {
                pickupAddress = object.entity
            } else
            if (object.type == 'Address::Number') {
                pickupAddress += ' ' + object.entity
            }
        });

        if (businessModel) {
            session.userData.name = businessModel;
        }
        session.userData.profile = pickupAddress;

        session.endDialog();
        session.beginDialog('/' + intent);
    };

    this.get = function(query, session) {
        request.get(url + query, function (err, res, body) {
            if (!err) {
                var resultsObj = JSON.parse(body);
                getEntitiesFrom(session, resultsObj);
            }
        });
    }

};

module.exports = new luisController();