exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                       'mongodb://anhhtle:password1@ds127190.mlab.com:27190/friends-alert';
exports.PORT = process.env.PORT || 8080;