document.addEventListener('DOMContentLoaded', function() {
  ////////////////////SOCKET CONNECTION//////////////////////////
  let socket = io.connect('http://localhost:3000');

  ('use strict');

  var serverIP = 'http://localhost:3000';
  // var serverIP = 'http://45.59.229.42/';

  ////////////////////STUN & TURN SERVER//////////////////////////
  var pcConfig = {
    iceServers: [
      { urls: 'stun:stun.services.mozilla.com' },
      { urls: 'stun:stun.l.google.com:19302' },
      {
        urls: 'turn:numb.viagenie.ca',
        credential: 'codesmith',
        username: 'USER_1'
      }
    ]
  };

  var localPeerConnection, signallingServer;
  var btnSend = document.getElementById('btn-send');
  var btnVideoStop = document.getElementById('btn-video-stop');
  var btnVideoStart = document.getElementById('btn-video-start');
  var btnVideoJoin = document.getElementById('btn-video-join');
  var localVideo = document.getElementById('local-video');
  var remoteVideo = document.getElementById('remote-video');
  var inputRoomName = document.getElementById('room-name');
  var localStream, localIsCaller;

  ////////////////////BUTTON STOP EVENT-HANDLER//////////////////////////
  btnVideoStop.onclick = function(e) {
    e.preventDefault();

    ///////////kill all connections/////////////
    if (localPeerConnection != null) {
      localPeerConnection.removeStream(localStream);
      localPeerConnection.close();
      signallingServer.close();
      localVideo.src = '';
      remoteVideo.src = '';
    }

    btnVideoStart.disabled = false;
    btnVideoJoin.disabled = false;
    btnVideoStop.disabled = true;
  };

  ////////////////////BUTTON START EVENT-HANDLER//////////////////////////
  btnVideoStart.onclick = function(e) {
    e.preventDefault();
    /////////////is starting the call////////////
    localIsCaller = true;
    initConnection();
  };

  ////////////////////BUTTON JOIN EVENT-HANDLER//////////////////////////
  btnVideoJoin.onclick = function(e) {
    e.preventDefault();
    /////////////just joining a call, not offering/////////////
    localIsCaller = false;
    initConnection();
  };

  ////////////////////ROOM NAME INITIALIZE CONNECTION//////////////////////////
  function initConnection() {
    var room = inputRoomName.value;

    if (room == undefined || room.length <= 0) {
      alert('Please enter room name');
      return;
    }

    ///////////////START CONNECTION/////////////
    connect(room);

    btnVideoStart.disabled = true;
    btnVideoJoin.disabled = true;
    btnVideoStop.disabled = false;
  }

  ////////////////////SDP//////////////////////////
  var sdpConstraints = {
    optional: [],
    mandatory: {
      OfferToReceiveVideo: true
    }
  };

  ////////////////////CREATE PEER CONNECTION//////////////////////////
  function connect(room) {
    localPeerConnection = new RTCPeerConnection(pcConfig);
    if (localPeerConnection) {
      console.log('============****=======');
    } else {
      console.log('fail');
    }

    ////////////////////CREATE LOCAL DATA CHANNEL THEN SEND IT TO REMOTE//////////////////////////
    navigator.getUserMedia(
      {
        video: true,
        audio: true
      },
      function(stream) {
        ///////get and save local stream////////
        trace('Got stream, saving it now and starting RTC connect');
        ///////must add before calling setRemoteDescription() because then it triggers 'addstream' event///////
        localPeerConnection.addStream(stream);
        localStream = stream;
        console.log('localStream ', localStream);

        ///////show local video////////
        localVideo.srcObject = stream;

        ///////can start once have gotten local video//////
        establishRTCConnection(room);
      },
      errorHandler
    );
  }

  ////////////////////ESTABLISH RTC CONNECTION AND CREATE SDP//////////////////////////
  function establishRTCConnection(room) {
    /////////create signalling server/////////
    signallingServer = new SignallingServer(room, serverIP);

    console.log('room ', room);
    console.log('serverIP ', serverIP);
    console.log('signallingServer ', signallingServer);
    console.log('signallingServer.connect() ', signallingServer.connect());

    signallingServer.connect();

    ///////////a remote peer has joined room, initiate sdp exchange/////////
    signallingServer.onGuestJoined = function() {
      trace('guest joined!');
      ///////////set local description and send to remote///////////
      localPeerConnection.createOffer(function(sessionDescription) {
        trace('set local session description with offer');

        localPeerConnection.setLocalDescription(sessionDescription);

        ///////////send local sdp to remote///////////
        trace('sent local sdp to remote');
        signallingServer.sendSDP(sessionDescription);
      });
    };

    //////////got sdp from remote/////////
    signallingServer.onReceiveSdp = function(sdp) {
      /////////get stream again///////////
      localPeerConnection.addStream(localStream);
      trace(localStream);

      ///////////////if local was the caller (true), set remote description//////////////
      if (localIsCaller) {
        trace('local is caller');
        trace('set remote session description with answer');
        localPeerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      } else {
        ////////////if local is joining a call (false), set remote sdp and create answer////////////
        trace('set remote session description with offer');
        localPeerConnection.setRemoteDescription(
          new RTCSessionDescription(sdp),
          function() {
            trace('create answer');
            localPeerConnection.createAnswer(function(sessionDescription) {
              //////////////set local description////////////
              trace('set local session desc with answer');
              localPeerConnection.setLocalDescription(sessionDescription);

              ///////////send local sdp to remote too//////////
              signallingServer.sendSDP(sessionDescription);
            });
          }
        );
      }
    };

    ////////////////////WHEN RECEIVING ICE CANDIDATE//////////////////////////
    signallingServer.onReceiveICECandidate = function(candidate) {
      trace('Set remote ice candidate');
      localPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    };

    ////////////////////ALERT USER WHEN ROOM IS FULL//////////////////////////
    signallingServer.onRoomFull = function(room) {
      window.alert('Room "' + room + '"" is full! Please join or create another room');
    };

    ////////////////////GET ICE CANDIDATES AND SEND THEM OVER//////////////////////////
    //////////wont get called unless SDP has been exchanged////////////
    localPeerConnection.onicecandidate = function(event) {
      if (event.candidate) {
        /////////////!!! send ice candidate over via signalling channel !!!///////////
        trace('Sending candidate');
        signallingServer.sendICECandidate(event.candidate);
      }
    };

    ///////////////when stream is added to connection, put it in video src////////////////
    localPeerConnection.onaddstream = function(data) {
      remoteVideo.srcObject = data.stream;
    };
  }

  function errorHandler(error) {
    console.error('Something went wrong!');
    console.error(error);
  }

  function trace(text) {
    console.info(text);
  }
});
