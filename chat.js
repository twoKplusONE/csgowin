
var Chat = function( user ) {
    var options = {
        chat_socket: 'http://jackpot.servecounterstrike.com:3000',
        chat_history_limit: 50,
        chat_has_not_init: 1 };

    var ChatSocket = new io( options.chat_socket );
    var ChatClient = $( '#chat-client' );
    var ChatInput = ChatClient.find( '#chat-input' );
    var ChatButton = ChatClient.find( '#chat-button' );
    
    ChatSocket.on( 'connect', function() {
        if( options.chat_has_not_init ) {
            options.chat_has_not_init = 0;
            
            if( user != null ) { 
                ChatSocket.emit( 'login', user ); }
            ChatSocket.emit( 'init' );
        }
    })
    
    ChatSocket.on( 'init', function( m ) {
        $( chatMessages( m ) ).appendTo( '#chat-messages' );
        setTimeout( function() { $( '#chat-scrollbar' ).mCustomScrollbar( 'scrollTo', 'bottom', { scrollInertia: 600 }) }, 300 );
    })
    
    ChatSocket.on( 'message', function( m ) {
        $( chatMessage( m ) ).appendTo( '#chat-messages' );
        $( '#chat-messages li:gt(' + options.chat_history_limit + '):first-child' ).remove();
        setTimeout( function() { $( '#chat-scrollbar' ).mCustomScrollbar( 'scrollTo', 'bottom', { scrollInertia: 600 }) }, 300 );
    })
    
    ChatSocket.on( 'alert', function( m ) {
        $( '#alert .modal-title' ).html( m.title );
        $( '#alert .modal-body' ).html( m.message );
        $( '#alert' ).modal( 'toggle' );
    })

    ChatInput.on( 'keyup', function( chat ) {
        var message = ChatInput.val().trim();

        if( chat.keyCode == 13 ) {
            ChatButton.trigger( 'click' );
            return false; 
        }
    })
    
    ChatButton.on( 'click', function() {
        var message = ChatInput.val().trim();
        if( !message ) { 
            return false; }
        ChatInput.val( '' ).focus();
    
        if( user != null ) { 
            ChatSocket.emit( 'message', user, message ); 
        }
    })
    
    function chatMessages( m ) {
        var h = '';
        for( var i = 0, l = m.length; i < l; i++ ) {
            h += chatMessage( m[i] ); }
        return h;
    }
    
    function chatMessage( m ) {
        var message = m.message;
        message = message.replace( /:emote-lol:/g, '<img class="emoji" src="./assets/img/emoji/lol.png">' );
        message = message.replace( /:emote-gg:/g, '<img class="emoji" src="./assets/img/emoji/gg.png">' );
        message = message.replace( /:emote-snipe:/g, '<img class="emoji" src="./assets/img/emoji/snipe.png">' );
        message = message.replace( /:emote-angry:/g, '<img class="emoji" src="./assets/img/emoji/angry.png">' );
                
        return  '<li class="chat-message">' +
                    '<img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/' + m.avatar + '"/>' +
                    '<span class="' + m.role + '"><a href="https://steamcommunity.com/profiles/' + m.steamid + '">' + m.username + '</a>: ' + message + '</span>' +
                '</li>';
    }
}
