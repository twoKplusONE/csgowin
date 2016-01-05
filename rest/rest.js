
var async       = require( 'async' )
var cors        = require( 'cors' )
var mysql       = require( 'mysql' )

var corsOptions = { origin: 'http://localhost' }

function REST( router, connection ) {
    var self = this
    self.handleRoutes( router, connection )
}

REST.prototype.handleRoutes = function( router, connection ) {
    var self = this
    
    router.get( '/', function( req, res ) {
        res.json({ 'status': '1', 'message': 'Hello World!' })
    })
    
    router.get( '/history/:page', function( req, res ) {
        async.waterfall([
            function( callback ) {
                var limit = 20
                var offset = limit * ( req.params.page - 1 )
                var query = 'SELECT J.jackpot_id AS round, J.percent as percentage, J.secret, J.hash, J.ended, J.value, U.personaname AS username, U.steamid, U.avatar ' + 
                'FROM jackpots J LEFT JOIN users U ON J.user_id = U.user_id WHERE J.user_id IS NOT NULL ORDER BY J.jackpot_id DESC LIMIT ?, ?'
                
                connection.query( query, [offset, limit], function( err, jackpots ) {
                    if( err || jackpots.length == 0 ) {
                        callback( 'error' )
                    } else {
                        callback( null, jackpots )
                    }
                })
            }, 
            function( jackpots, callback ) {
                var start = jackpots[jackpots.length-1].round
                var end = jackpots[0].round
                var query = 'SELECT J.jackpot_id AS round, S.name, S.classid, S.color FROM jackpots J LEFT JOIN jackpots_bets JB ON J.jackpot_id = JB.jackpot_id LEFT ' + 
                'JOIN bets_skins BS ON JB.bet_id = BS.bet_id LEFT JOIN skins S ON BS.skin_id = S.skin_id WHERE J.jackpot_id BETWEEN ? AND ? ORDER BY J.jackpot_id DESC, ' + 
                'S.value DESC'
                
                connection.query( query, [start, end], function( err, skins ) {
                    if( err ) {
                        callback( 'error' )
                    } else {
                        callback( null, jackpots, skins )
                    }
                })
            }, 
            function( jackpots, skins, callback ) {
                for( var i = 0, len = jackpots.length; i < len; i++ ) {
                    jackpots[i].skins = []
                }
                
                for( var i = 0, j = 0, len = skins.length; i < len; i++ ) {
                    if( jackpots[j].round == skins[i].round ) {
                        jackpots[j].skins.push({ 'name': skins[i].name, 'classid': skins[i].classid, 'color': skins[i].color })
                    } else {
                        j += 1
                    }
                }
                
                callback( null, jackpots )
            }],
        function( err, jackpots ) {
            if( err ) {
                res.json({ 'status': '0', 'message': 'error executing query' })
            } else {
                res.json({ 'status': '1', 'jackpots': jackpots })
            }
        })
    })
    
}

module.exports = REST
