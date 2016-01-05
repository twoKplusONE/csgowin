
var bodyParser  = require( 'body-parser' )
var cors        = require( 'cors' )
var express     = require( 'express' )
var mysql       = require( 'mysql' )
var rateLimit   = require( 'express-rate-limit' )
var rest        = require( './rest.js' )
var app         = express()

function SERVER() {
    var self = this
    self.connectMySQL()
}

SERVER.prototype.connectMySQL = function() {
    var self = this
    var pool = mysql.createPool({
        connectionLimit: 100, 
        host: 'localhost', 
        user: 'root', 
        password: 'root', 
        database: 'csgowin', 
        debug: false
    })
    
    pool.getConnection( function( err, connection ) {
        if( err ) {
            self.stop( err ) 
        } else {
            self.configureExpress( connection )
        }
    })
}

SERVER.prototype.configureExpress = function( connection ) {
    var self = this
    var router = express.Router()
    var restRouter = new rest( router, connection )
    var limiter = rateLimit()
    
    app.use( bodyParser.urlencoded({ extended: true }) )
    app.use( bodyParser.json() )
    app.use( cors() )
    //app.use( '/api', limiter )
    app.use( '/api', router )
    app.listen( 3000, function() {
        console.log( 'Listening to port 3000...' )
    })
}

SERVER.prototype.stop = function( err ) {
    logger.warn( 'Issue with MySQL: ' + err )
    process.exit( 1 )
}

new SERVER()
