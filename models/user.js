/*jslint node: true */
'use strict';

var insecurity = require('../lib/insecurity'),
    utils = require('../lib/utils'),
    challenges = require('../lib/datacache').challenges;

module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define('User', {
            email: DataTypes.STRING,
            password: DataTypes.STRING
        },
        {
            hooks: {
                beforeCreate: function (user, fn) {
                    hashPasswordHook(user);
                    xssChallengeUserHook(user);
                    fn(null, user);
                },
                beforeUpdate: function (user, fn) { // Pitfall: Will hash the hashed password again if password was not updated!
                    hashPasswordHook(user);
                    fn(null, user);
                }
            }}
    );
    return User;
};

function hashPasswordHook(user) {
    user.password = insecurity.hash(user.password);
}

function xssChallengeUserHook(user) {
    if (utils.notSolved(challenges.persistedXssChallengeUser) && utils.contains(user.email, '<script>alert("XSS2")</script>')) {
        utils.solve(challenges.persistedXssChallengeUser);
    }
}