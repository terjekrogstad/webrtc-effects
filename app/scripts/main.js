require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery'
    },
    shim: {
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        }
    }
});

require(['app', 'jquery'], function (app, $) {
    'use strict';
    // use app here
    console.log(app);
    console.log('Running jQuery %s', $().jquery);
});




//Peerjs test
(function(){
    

    //Setup peerjs connection
    // No API key required when not using cloud server
    
    console.log( navigator.userAgent );
    //alert( 'Welcome ' + navigator.userAgent );
    
    var target = "Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/37.0.2062.120 Chrome/37.0.2062.120 Safari/537.36",
	video = document.getElementById( 'stream' ),
	canvas = document.getElementById( 'canvas' ),
	canvasv = document.getElementById( 'canvasv' );
	ctx = canvas.getContext( '2d' ),//Invisible canvas
	ctxv = canvasv.getContext( '2d' );

    if( navigator.userAgent !== target ){
	var peer = new Peer('sender', {host: '192.168.0.113', port: 9001, path: '/'});
	console.log( "I'm going to send something" );
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	navigator.getUserMedia({video: true, audio: false}, function(stream) {
		//Set up stream locally
		var localStream = window.URL.createObjectURL(stream);
		video.src = localStream;
		video.play();
		//Stream to receiver
		var conn = peer.call( 'receiver', stream );
	}, function( err ){ console.log( 'Error setting up stream', err ); });
    }else{
	console.log( "I'm going to receive something" );
	var peer = new Peer( 'receiver', {host: '192.168.0.113', port: 9001, path: '/'});
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	peer.on('call', function(call) {
		console.log( 'Receiving call' );
	  navigator.getUserMedia({video: false, audio: true}, function(stream) {
		console.log( 'Media set up. Answering call' );
	    call.answer(stream); // Answer the call with an A/V stream.
	    call.on('stream', function(remoteStream) {
	      // Show stream in some video/canvas element.
		console.log( 'Setting up remote stream', remoteStream );
		var video = document.querySelector( 'video' );
		video.src = window.URL.createObjectURL( remoteStream );
		video.play();
		
		//Stream alter
		jQuery( canvasv ).css( 'display', 'block' );
		//frame();



	    });
	  }, function(err) {
	    console.log('Failed to get local stream' ,err);
	  });
	});
    }



	function frame(){
		console.log( 'Running frame' );
	    if(video.paused || video.ended) return false;
	    // First, draw it into the backing canvas
	    var cw = jQuery( video ).width();
	    var ch = jQuery( video ).height();
	    ctx.drawImage(video,0,0,cw,ch);
	    // Grab the pixel data from the backing canvas
	    var idata = ctx.getImageData(0,0,cw,ch);
	    var data = idata.data;
	    var w = idata.width;
	    var limit = data.length
	    // Loop through the subpixels, convoluting each using an edge-detection matrix.
	    for(var i = 0; i < limit; i++) {
		if( i%4 == 3 ) continue;
		data[i] = 127 + 2*data[i] - data[i + 4] - data[i + w*4];
	    }
	    // Draw the pixels onto the visible canvas
	    ctx.putImageData(idata,0,0);
	    // Start over!
	    setTimeout(frame, 20);
	}

})();
