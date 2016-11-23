var builder = require('botbuilder');
var restify = require('restify');
var luis = require('./luis');
var service = require('./service');

//=========================================================
// Bot Setup
//=========================================================
var name = '';
var businessModel;
var pickupAddress;
var dropoffAddress;
var completeAddress = false;

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
//    console.log('%s listening to %s', server.name, server.url);
    console.log("Bienvenido a Bot...")
});
  
// Create chat bot
var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);

// var connector = new builder.ChatConnector({
//     appId: process.env.MICROSOFT_APP_ID || '7933764d-b0c4-426e-8b3b-afaee3c18733',
//     appPassword: process.env.MICROSOFT_APP_PASSWORD || 'SPbvq3xH8Fhbj67arNpAOm1'
// });
// var bot = new builder.UniversalBot(connector);
// server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

var intents = new builder.IntentDialog();
bot.dialog('/', intents);

intents.matches(/^OrderTaxi/i, [
    function (session) {
        session.beginDialog('/OrderTaxi');
    },
    function (session, results) {
        session.send('Ok %s, donde te gustaría que te retire el taxi?', session.userData.name);
        //...
    }
]);

intents.onDefault([
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/name');
        } else {
            next();
        }
    },
    function (session, results) {
        session.beginDialog('/help');
    }
]);

bot.dialog('/name', [
    function (session) {
        builder.Prompts.text(session, 'Hola! ¿cuál es tu nombre?');
    },
    function (session, results) {
        name = results.response;
        session.endDialog();
    }
]);

bot.dialog('/help', [
    function (session) {
        var text =  'Que tal ' + name + ', ¿en qué puedo ayudarte?';
        builder.Prompts.text(session, text);
    },
    function (session, results) {
        luis.get(results.response, session);
    }
]);

bot.dialog('/OrderTaxi', [
    function (session) {
        businessModel = session.userData.name;
        pickupAddress = session.userData.profile;

        if (!pickupAddress) {
            completeAddress = false;
            var text =  'Sí no hay problema ' + name + ', ¿me pasás la dirección donde te gustaría que te retire el ' + businessModel + '?';
            if (businessModel == 'limosina') {
                text = 'Sí no hay problema ' + name + ', ¿me pasás la dirección donde te gustaría que te retire la ' + businessModel + '?';
            }

            builder.Prompts.text(session, text);
        } else {
            completeAddress = true;
            session.endDialog();
            session.beginDialog('/PickupAddress');
        }
    },
    function (session, results) {
        luis.get(results.response, session);
    }
]);

bot.dialog('/PickupAddress', [
    function (session) {
        if (pickupAddress) {
            dropoffAddress = session.userData.profile;
        } else {
            pickupAddress = session.userData.profile;
        }

        if (completeAddress) {
            dropoffAddress = null;
        }

        if (!dropoffAddress) {
            completeAddress = false;
            builder.Prompts.text(session, 'Perfecto dale, y ¿hasta dónde vas?');
        } else {
            var text = 'Buenísimo ' + name + ', en 10 min llegará tu ' + businessModel + '. Te puedo ayudar en algo más?';
            builder.Prompts.text(session, text);
        }
    },
    function (session, results) {
        if (pickupAddress) {
            dropoffAddress = session.userData.profile;
        }

        if (pickupAddress && dropoffAddress) {
            service.get(results.response, session, pickupAddress, dropoffAddress);
        } else {
            luis.get(results.response, session);
        }
    }
]);

bot.dialog('/Finish', [
    function (session) {
        var text = 'Gracias a vos ' + name + '. Buen día!';
        builder.Prompts.text(session, text);
        session.endDialog();
    }
]);

// server.get('/', function(req, res, next) {
//     res.send(200, 'Hola! ¿cuál es tu nombre?')
// })
// server.get('/:query', luis.get)