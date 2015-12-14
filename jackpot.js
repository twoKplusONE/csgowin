var Jackpot = function( user ) {
    var options = {
        jackpot_socket: 'http://jackpot.servecounterstrike.com:3001',
        jackpot_history_limit: 10,
        jackpot_has_not_init: 1 };  

    var JackpotSocket = new io( options.jackpot_socket );
    var JackpotSkins = [];
    var JackpotAvatars = [];
    
    //var JackpotCircle = new Circle();
    var JackpotCount = new CountUp( 'circle-deposit', 0, 0, 0, 1.1, { useEasing: false, useGrouping: true, separator: ',', decimal: '.' } );
    var JackpotValue = new CountUp( 'circle-value', 0, 0, 2, 1.1, { useEasing: false, useGrouping: true, separator: ',', decimal: '.', prefix: '$' } );
    
    JackpotSocket.on( 'connect', function() {
        if( options.jackpot_has_not_init ) {
            options.jackpot_has_not_init = 0;
            JackpotSocket.emit( 'init' );
        }
    })
    
    // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
    // INIT  // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
    // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
    
    JackpotSocket.on( 'init', function( jackpot, bets, history ) {
        
        // Init
        for( var i = 0, l = bets.length; i < l; i++ ) {
            JackpotAvatars.push( bets[i].user.avatar );
            for( var j = 0, m = bets[i].skins.length; j < m; j++ ) {
                JackpotSkins.push( bets[i].skins[j] ); } }
        
        // Circle  
        $( '#circle-progress' ).circleProgress({ 
            value: jackpot.count / 50,
            size: $( '#circle-center' ).width(),
            startAngle: -Math.PI / 2,
            thickness: 50,
            fill: { gradient: ['#3aeabb', '#55aecb'] },
            emptyFill: 'rgba( 0, 0, 0, 0.03 )',
            animation: { duration: 1200, easing: 'circleProgressEasing' } 
        })
        
        JackpotCount.update( jackpot.count );   
        JackpotValue.update( jackpot.value );
        
        // State
        if( user != null ) {
            $( '#state-logged-in' ).css( { display: 'block' } ); }
        else { $( '#state-logged-out' ).css( { display: 'block' } ); }
        
        // Round Skins
        $( 'li', '#list-skins' ).add( $( roundSkins( JackpotSkins ) ) ).sort( byValue ).appendTo( '#list-skins' ); 
        
        if( bets.length > 0 ) {
            $( '#circle' ).css( 'opacity', 1 ); }
        
        // Round Bets
        $( roundJackpot( jackpot ) ).prependTo( '#list-entry' );
        $( roundBets( bets ) ).prependTo( '#list-entry .round-' + jackpot.round );

        // Round History
        for( var i = history.length - 1; i >= 0; i-- ) {
            $( roundJackpot( history[i].round ) ).appendTo( '#list-entry' );
            $( roundBets( history[i].bets ) ).prependTo( '#list-entry .round-' + history[i].round.round );
            $( roundWinner( history[i].winner ) ).prependTo( '#list-entry .round-' + history[i].round.round );
            $( roundSecret( history[i].secret ) ).prependTo( '#list-entry .round-' + history[i].round.round ); 
        }
        
        setTimeout( function() {
            $( '.loading' ).fadeOut( 'fast' );
        }, 3500 )
    })
    
    // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
    // BET   // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
    // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
    
    JackpotSocket.on( 'bet', function( jackpot, bet ) {
    
        $( '#circle-progress' ).circleProgress({ 
            value: jackpot.count / 50,
            animation: { duration: 1200, easing: 'circleProgressEasing' },
            animationStartValue: $('#circle-progress').circleProgress( 'value' )
        });
        JackpotCount.update( jackpot.count );
        JackpotValue.update( jackpot.value );
        JackpotAvatars.push( bet.user.avatar );

        for( var i = 0, l = bet.skins.length; i < l; i++ ) {
            $( 'li', '#list-skins' ).add( $( roundSkin( bet.skins[i] ) ) ).sort( byValue ).appendTo( '#list-skins' ); }

        $( roundBet( bet ) ).prependTo( '#list-entry .round-' + jackpot.round ).hide().slideDown();
    })
    
    // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
    // WINNER   // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
    // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
    

    JackpotSocket.on( 'winner', function( jackpotNew, jackpot, secret, winner ) {
    
        setTimeout( function() {
            $( '#circle-progress' ).circleProgress({ 
                value: 0,
                animation: { duration: 1200, easing: 'circleProgressEasing' },
                animationStartValue: $('#circle-progress').circleProgress( 'value' )
            });
            JackpotCount.update( 0 );
            JackpotValue.update( 0 );
            
            $( '#list-skins' ).fadeOut( 1000, function() { 
                $( this ).empty().show() 
            })
            
            animateWinner( winner, function() {
                $( '#circle-animate #circle-header' ).text( 'Winner!' )
                $( '#circle-animate #circle-header' ).animate({ opacity: 1 }, { duration: 200, queue: false });
                $( '#circle-animate #circle-username' ).text( winner.username );
                $( '#circle-animate #circle-username' ).animate({ opacity: 1 }, { duration: 200, queue: false });
                
                $( roundWinner( winner ) ).prependTo( '#list-entry .round-' + jackpot.round ).hide().slideDown();
                $( roundSecret( secret ) ).prependTo( '#list-entry .round-' + jackpot.round );
                $( roundJackpot( jackpotNew ) ).prependTo( '#list-entry' );
                
                if( user != null ) {
                    if( user.steamid == winner.steamid ) {
                        $( '#alert .modal-title' ).html( 'You have won the current round!' );
                        $( '#alert .modal-body' ).html( '<p>Please check your <a href="http://steamcommunity.com/id/me/tradeoffers/" target="_blank">Steam Trade Offers</a> and accept your winnings.You may receive multiple trades from our tradebots.</br>Thanks for playing!</p>' );
                        $( '#alert' ).modal( 'toggle' );
                    }
                }
                
                setTimeout( function() {
                    $( '#circle-animate #circle-winner' ).animate({ opacity: 0, transform: 'scale(1.5)' }, 600, 'linear', function() { 
                        $( '#circle-animate' ).animate({ 'opacity': 0 }, 300, 'linear', function() {
                            $( '#circle-animate #circle-header' ).empty();
                            $( '#circle-animate #circle-username' ).empty();
                            $( '#circle-animate #circle-winner' ).removeAttr( 'src' );
                            $( '#circle-animate #circle-spin' ).removeAttr( 'src' );
                            $( '#circle-animate #circle-spin' ).css({ opacity: '1', transform: 'scale(1)' }) });
                        $( '#circle-amounts' ).animate({ 'opacity': 1 }, 600, 'linear' );
                    });
                }, 2000 )
            })
            
            
        }, 2000 )
    })
    
    function animateWinner( winner, callback ) {
        var RoundAvatars = [];
        var RoundAvatarsUnique = jQuery.unique( JackpotAvatars );
        
        while( true ) {
            RoundAvatars.extend( RoundAvatarsUnique );
            if( RoundAvatars.length >= 39 ) {
                break; } }
        
        JackpotAvatars.length = 0;
        RoundAvatars.length = 39;
        RoundAvatars.push( winner.avatar );
        
        $( '#circle-amounts' ).fadeTo( 300, 0, function() { 
            animatedOne( RoundAvatars, winner.username, function() { 
                callback( null ) }) });
        $( '#circle-animate' ).fadeTo( 600, 1 );
    }
    
    function animatedOne( avatars, username, callback ) {
        var delay = 0
        var delays = [ 60, 60, 60, 60, 60, 60, 60, 60, 70, 70, 70, 70, 70, 70, 70, 70, 80, 80, 80, 80, 
                       80, 80, 80, 80, 90, 90, 90, 90, 90, 90,  90, 90, 100, 100, 100, 100, 100, 100, 100, 100 ];
                       
        jQuery.each( avatars, function( i, avatar ) {
            setTimeout( function() {
                $( '#circle-animate #circle-spin' ).attr( 'src', 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/' + avatar );
                
                if( i == 32 ) {
                    $( '#circle-animate #circle-spin' ).animate({ opacity: 0, transform: 'scale(1.3)' }, { duration: 900, queue: false }); }
                else if( i == 39 ) {
                    $( '#circle-animate #circle-winner' ).attr( 'src', 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/' + avatar );
                    $( '#circle-animate #circle-winner' ).animate({ opacity: 1, transform: 'scale(1)' }, 600, 'linear', function() { callback( null ) }); 
                }
            }, delay );
            delay += delays[i] + 30;
        })
    }
    
    // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
    // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
    // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
    
    function itemColor( a ) {
        switch( a ) {
            case 'CF6A32':
                return 'item-bronze';
                break;
            case '8650AC':
                return 'item-purple';
                break;
            case 'FFD700':
                return 'item-yellow';
                break;
            default:
                return 'item-grey';
                break;
        }
    }
    
    function byValue( a, b ){ 
        return $( a ).find( 'span:first' ).text() > $( b ).find( 'span:first' ).text() ? -1 : 1;
    }

    function roundJackpot( jackpot ) {
        return  '<li class="std-container round-' + jackpot.round + ' round">' +
                    '<div class="round-hash">' +
                        'Round <span class="number">#' + jackpot.round + '</span> with hash <span class="hash">' + jackpot.hash + '</span>  ' + 
                    '</div>' +
                '</li>'
    }
    
    function roundBets( bets ) {
        var html = '';
        for( var i = 0, l = bets.length; i < l; i++ )
            html = roundBet( bets[i] ) + html
        return html
    }
    
    function roundBet( bet ) {
        return  '<div class="round-entry">' +
                    '<img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/' + bet.user.avatar + '"/>' +
                    '<a href="https://steamcommunity.com/profiles/' + bet.user.steamid + '">' + bet.user.username + '</a> deposited ' +
                    '<span>' + ( bet.user.skins || bet.skins.length ) + '</span> skin(s) with a <strong class="strong-bold">$' + bet.offer.value + '</strong> value' + 
                '</div>'
    }
    
    function roundSkins( items ) {
        var html = '';
        for( var i = 0, l = items.length; i < l; i++ )
            html = roundSkin( items[i] ) + html
        return html
    }
    
    function roundSkin( item ) {
        return  '<li class="' + itemColor( item.color ) + '">' + 
                    '<img src="https://steamcommunity-a.akamaihd.net/economy/image/class/730/' + item.classid + '/120fx60f"/>' + 
                    '<span class="value">$' + item.value + '</span><span class="name">' + item.name + '</span>' +
                '</li>'
    }
    
    function roundWinner( winner ) {
        return  '<div class="round-winner">' +
                    '<a href="https://steamcommunity.com/profiles/' + winner.steamid + '">' + 
                        '<img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/' + winner.avatar + '"/>' + winner.username + 
                    '</a>  won the jackpot valued at ' +
                    '<span class="round-value">$' + winner.value + '</span> with a <span class="winner-chance">' + winner.chance + '%</span> chance' +
                '</div>'
    }
    
    function roundSecret( jackpot ) {
        return  '<div class="round-secret">' +
                    'The winning ticket was at <span class="percent">' + jackpot.percent + '%</span> with the secret ' + 
                    '<span class="secret">' + jackpot.secret + '</span> - <a href="fair">(Check)</a>' +
                '</div>'
    }
    
    Array.prototype.extend = function( other_array ) {
        other_array.forEach( function( v ) { this.push( v )}, this );
    }
}

$( function () {
    $( '#circle-center' ).resize( function( e ) {
        $( '#circle-progress' ).circleProgress({ animation: false, size: $( '#circle-center' ).width() });
    })
})
