/************************************************************************
Canvas Record 
*************************************************************************/

function syncVideoScreenRecording(data , datatype , dataname ){
    rtcMultiConnection.send({type:datatype, message:data  , name : dataname});
}

function autorecordScreenVideo(){

}

function assignScreenRecordButton(){

    var elementToShare = document.getElementById("mainDiv");

    var canvas2d = document.createElement('canvas');
    canvas2d.setAttribute("style","z-index:-1");
    //canvas2d.hidden=true;
    var context = canvas2d.getContext('2d');

    canvas2d.width = elementToShare.clientWidth;
    canvas2d.height = elementToShare.clientHeight;

    canvas2d.style.top = 0;
    canvas2d.style.left = 0;

    (document.body || document.documentElement).appendChild(canvas2d);

    var isRecordingStarted = false;
    var isStoppedRecording = false;

    (function looper() {
        if(!isRecordingStarted) {
            return setTimeout(looper, 500);
        }

        html2canvas(elementToShare, {
            grabMouse: true,
            onrendered: function(canvas) {
                context.clearRect(0, 0, canvas2d.width, canvas2d.height);
                context.drawImage(canvas, 0, 0, canvas2d.width, canvas2d.height);

                if(isStoppedRecording) {
                    return;
                }

                setTimeout(looper, 1);
            }
        });
    })();

    recorder = RecordRTC(canvas2d, {
        type: 'canvas'
    });

    var recordButton = document.getElementById(screenrecordobj.button.id);
    console.log(" -------recordButton---------" , recordButton);
    recordButton.onclick = function() {
        if(recordButton.className==screenrecordobj.button.class_off){
            recordButton.className= screenrecordobj.button.class_on ;
            recordButton.innerHTML= screenrecordobj.button.html_on;
            
            recorder.startRecording();
        
            isStoppedRecording = false;
            isRecordingStarted = true;

        }else if(recordButton.className==screenrecordobj.button.class_on){
            recordButton.className= screenrecordobj.button.class_off ;
            recordButton.innerHTML= screenrecordobj.button.html_off;
            
            isStoppedRecoridng = true;

            recorder.stopRecording(function() {
                var blob = recorder.getBlob();
                var videoURL=URL.createObjectURL(blob);
                var uuid= guid();
                var recordVideoname= "screenrecorded"+ Math.floor(new Date() / 1000);
                var peerinfo=findPeerInfo( selfuserid);
                displayList(uuid , peerinfo , videoURL, recordVideoname , "videoScreenRecording");
                displayFile(uuid , peerinfo , videoURL, recordVideoname , "videoScreenRecording");
            });
  
        }
    };
}

function createScreenRecordButton(){

	var element = document.body;
    /*    
    recorder = RecordRTC(element, {
        type: 'canvas',
        showMousePointer: true
    });*/

    var canvas2d = document.createElement('canvas');
    canvas2d.setAttribute("style","z-index:-1");
    //canvas2d.hidden=true;
    var context = canvas2d.getContext('2d');

    /*   
    canvas2d.width = elementToShare.clientWidth;
    canvas2d.height = elementToShare.clientHeight;*/

    canvas2d.style.top = 0;
    canvas2d.style.left = 0;

    (document.body || document.documentElement).appendChild(canvas2d);

    var isRecordingStarted = false;
    var isStoppedRecording = false;

    (function looper() {
        if(!isRecordingStarted) {
            return setTimeout(looper, 500);
        }

        html2canvas(elementToShare, {
            grabMouse: true,
            onrendered: function(canvas) {
                context.clearRect(0, 0, canvas2d.width, canvas2d.height);
                context.drawImage(canvas, 0, 0, canvas2d.width, canvas2d.height);

                if(isStoppedRecording) {
                    return;
                }

                setTimeout(looper, 1);
            }
        });
    })();

    recorder = RecordRTC(canvas2d, {
        type: 'canvas'
    });

    var recordButton= document.createElement("span");
    recordButton.className= screenrecordobj.button.class_off ;
    recordButton.innerHTML= screenrecordobj.button.html_off;
    recordButton.onclick = function() {
        if(recordButton.className==screenrecordobj.button.class_off){
            recordButton.className= screenrecordobj.button.class_on ;
            recordButton.innerHTML= screenrecordobj.button.html_on;
            recorder.startRecording();
        
            isStoppedRecording = false;
            isRecordingStarted = true;

            setTimeout(function() {
                recordButton.disabled = false;
            }, 500);

        }else if(recordButton.className==screenrecordobj.button.class_on){
            recordButton.className= screenrecordobj.button.class_off ;
            recordButton.innerHTML= screenrecordobj.button.html_off;
            
            isStoppedRecoridng = true;

            recorder.stopRecording(function() {

                var blob = recorder.getBlob();
                var video = document.createElement('video');
                video.src = URL.createObjectURL(blob);
                video.setAttribute('style', 'height: 100%; position: absolute; top:0;');
                document.body.appendChild(video);
                video.controls = true;
                video.play();
            });
  
        }
    };

    //webrtcUtils.enableLogs = false;

    var li =document.createElement("li");
    li.appendChild(recordButton);
    document.getElementById("topIconHolder_ul").appendChild(li);       
}

//call with getSourceIdScreenrecord(function(){} , true)
function getSourceIdScreenrecord(callback, audioPlusTab) {
    if (!callback)
        throw '"callback" parameter is mandatory.';

    window.postMessage("webrtcdev-extension-getsourceId-audio-plus-tab", "*");
};

function onScreenrecordExtensionCallback(event){
    console.log("onScreenrecordExtensionCallback" , event);

    if (event.data.chromeExtensionStatus) {
       console.log(event.data.chromeExtensionStatus);
    }

    if (event.data.sourceId) {
        if (event.data.sourceId === 'PermissionDeniedError') {
            console.log('permission-denied');
        } else{
            webrtcdevScreenConstraints(event.data.sourceId);
        }
    }
}

function webrtcdevScreenRecordConstraints(chromeMediaSourceId){
   
    navigator.getUserMedia(
        {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: chromeMediaSourceId,
                    maxWidth: window.screen.width > 1920 ? window.screen.width : 1920,
                    maxHeight: window.screen.height > 1080 ? window.screen.height : 1080
                },
                optional: []
            }
        },
        function stream(event) {
            console.log("screen stream "  , event , screenshareobj.screenshareContainer);
            //scrConn.onstream(event);
            var container = document.getElementById(screenshareobj.screenshareContainer);
            screenStreamId = event.streamid;
            var videosContainer=document.createElement("video");
            videosContainer.src = window.URL.createObjectURL(event);
            container.appendChild(videosContainer);
            videosContainer.appendChild(event.mediaElement);
        },
        function error(err) {
            if (isChrome && location.protocol === 'http:') {
                alert('Please test this WebRTC experiment on HTTPS.');
            } else if(isChrome) {
                alert('Screen capturing is either denied or not supported. Please install chrome extension for screen capturing or run chrome with command-line flag: --enable-usermedia-screen-capturing');
            } else if(!!navigator.mozGetUserMedia) {
                alert(Firefox_Screen_Capturing_Warning);
            }
        }
    );
}