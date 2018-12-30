const express = require('express');
const router = express.Router();
const PlayMusic = require('playmusic');
const json2csv = require('json2csv').parse;
const Base64 = require('js-base64').Base64;

/* GET library */
router.get('/library', function (req, res, next) {
    let pm = new PlayMusic();
    let username = decodeURIComponent(req.query.username);
    let password = decodeURIComponent(req.query.password);
    console.log("Attempting to log in");
    pm.login({email: username, password: password}, function (err, info) {
        if (err) {
            console.log(err);
            res.json(403, {"error": "Authentication failed."});
            console.log(`Invalid username or password. (Or maybe "Allow Less Secure Apps" is off)`);
        } else {
            console.log("Logged in successfully!\n" +
                "Initializing client...");
            pm.init({androidId: info.androidId, masterToken: info.masterToken}, function (err) {
                if (err) {
                    console.error(err);
                    res.json(500, {"error": "Failed to create client."});
                    return;
                }
                console.log("Client initialized!\n" +
                    "Attempting to fetch almost 50,000 songs...");
                pm.getAllTracks({limit: 49990}, function (err, library) {
                    if (err) {
                        console.error(err);
                        res.json(500, {"error": "Failed to fetch tracks."});
                        return;
                    }
                    console.log("Library retrieved! Found " + library.data.items.length + " songs.");
                    if (library) {
                        res.json(200, {"library": Base64.encode(library)});
                    } else {
                        res.json(404, {"error": "No songs found."});
                        console.log("No songs found.");
                    }
                });
            });
        }
    });
});

module.exports = router;
