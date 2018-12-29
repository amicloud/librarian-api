const express = require('express');
const router = express.Router();
const PlayMusic = require('playmusic');
const json2csv = require('json2csv').parse;
const Base64 = require('js-base64').Base64;

/* GET library */
router.get('/library', function (req, res, next) {
    console.log(req.query);
    let pm = new PlayMusic();
    let username = decodeURIComponent(req.query.username);
    let password = decodeURIComponent(req.query.password);
    pm.login({email: username, password: password}, function (err, info) {
        if (err) {
            console.log(err);
            console.log(`Invalid username or password. (Or maybe "Allow Less Secure Apps" is off?) Please try again.`);
        } else {
            console.log("Logged in successfully!\n" +
                "Initializing client...");
            pm.init({androidId: info.androidId, masterToken: info.masterToken}, function (err) {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log("Client initialized!\n" +
                    "Attempting to fetch almost 50,000 songs...");
                pm.getAllTracks({limit: 49990}, function (err, library) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log("Library retrieved! Found " + library.data.items.length + " songs.");
                    if (library) {
                        res.json({"library": Base64.encode(json2csv(library.data.items))});
                    } else {
                        console.log("No songs found. Huh? ¯\\_(ツ)_/¯");
                        console.log("Are you sure this is the right account?");
                    }
                });
            });
        }
    });
});

module.exports = router;
