// load all the things we need
var BasicStrategy = require('passport-http').BasicStrategy;
var bcrypt        = require('bcryptjs');
var fs            = require('fs');

module.exports = function(passport) {

    // =========================================================================
    // LOGIN ===================================================================
    // =========================================================================
    passport.use(new BasicStrategy(auth));
};

var auth = function(username, password, done) {
    fs.readFile(__dirname + '/.htpasswd', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        var lines = data.split("\n");
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].split(':');
            // console.log(line);
            if (username.valueOf() === line[0] &&
                bcrypt.compareSync(password.valueOf(), line[1])) {
                return done(null, true);
            }
        }
        return done(null, false);
    });
}
