/***************************************************
 video handling
 *********************************************************/

function appendVideo(e, style) {
    createVideoContainer(e, style, function (div) {
        var video = document.createElement('video');
        video.className = style;
        video.setAttribute('style', 'height:auto;opacity:1;');
        video.controls = false;
        video.id = e.userid;
        video.src = URL.createObjectURL(e.stream);
        viden.hidden = false;
        var remote = document.getElementById('remote');
        div.appendChild(video);
        video.play();
    });
}

function createVideoContainer(e, style, callback) {
    var div = document.createElement('div');
    div.setAttribute('style', style || 'float:left;opacity: 1;width: 32%;');
    remote.insertBefore(div, remote.firstChild);
    if (callback) callback(div);
}

/****************************************************
 control Buttons attachment to Video Element
 *********************************************************/

/**
 * function to attach control bar to video for minmax , record etc
 * @method
 * @name attachControlButtons
 * @param {dom} vid
 * @param {json} peerinfo
 */
function attachControlButtons(vid, peerinfo) {

    var stream = peerinfo.stream;
    var streamid = peerinfo.streamid;
    var controlBarName = peerinfo.controlBarName;
    var snapshotViewer = peerinfo.fileSharingContainer;

    //Preventing multiple control bars
    var c = vid.parentNode.childNodes;
    for (i = 0; i < c.length; i++) {
        //webrtcdev.log("ChildNode of video Parent " , c[i]);
        if (c[i].nodeName == "DIV" && c[i].id != undefined) {
            if (c[i].id.indexOf("control") > -1) {
                webrtcdev.log("control bar exists already  , delete the previous one before adding new one");
                vid.parentNode.removeChild(c[i]);
            }
        }
    }

    // Control bar holds media control elements like , mute unmute , fillscreen ,. recird , snapshot
    let controlBar = document.createElement("div");
    controlBar.id = controlBarName;

    if (peerinfo.type == "local")
        controlBar.className = "localVideoControlBarClass";
    else
        controlBar.className = "remoteVideoControlBarClass";

    if (debug) {
        let nameBox = document.createElement("div");
        nameBox.innerHTML = vid.id;
        controlBar.appendChild(nameBox);
    }

    if (muteobj.active) {
        if (muteobj.audio.active) {
            controlBar.appendChild(createAudioMuteButton(controlBarName, peerinfo));
        }
        if (muteobj.video.active) {
            controlBar.appendChild(createVideoMuteButton(controlBarName, peerinfo));
        }
    }

    if (snapshotobj.active) {
        controlBar.appendChild(createSnapshotButton(controlBarName, peerinfo));
    }

    if (videoRecordobj.active) {
        controlBar.appendChild(createRecordButton(controlBarName, peerinfo, streamid, stream));
    }

    if (cursorobj.active) {
        //assignButtonCursor(cursorobj.button.id);
        controlBar.appendChild(createCursorButton(controlBarName, peerinfo));
    }

    if (minmaxobj.active) {
        controlBar.appendChild(createFullScreenButton(controlBarName, peerinfo, streamid, stream));
        // controlBar.appendChild(createMinimizeVideoButton(controlBarName, peerinfo, streamid, stream));

        // attach minimize button to header instead of widgets in footer
        nameBoxid = "#videoheaders" + peerinfo.userid;
        let nameBox = document.querySelectorAll(nameBoxid);
        for (n in nameBox) {
            // webrtcdev.log("[_media_dommodifier ] attachControlButtons - nameBox " , nameBox[n]);
            if (nameBox[n].appendChild)
                nameBox[n].appendChild(createMinimizeVideoButton(controlBarName, peerinfo, streamid, stream));
        }
    }

    vid.parentNode.appendChild(controlBar);
    return;
}

/**
 * function to createFullScreenButton
 * @method
 * @name createFullScreenButton
 * @param {string} controlBarName
 * @param {json} peerinfo
 * @return {dom} button
 */
function createFullScreenButton(controlBarName, peerinfo, streamid, stream) {
    let button = document.createElement("span");
    button.id = controlBarName + "fullscreeButton";
    button.setAttribute("title", "Full Screen");
    button.className = minmaxobj.max.button.class_off;
    button.innerHTML = minmaxobj.max.button.html_off;

    // button.setAttribute("data-placement", "bottom");
    // button.setAttribute("data-toggle", "tooltip");
    // button.setAttribute("data-container", "body");

    button.onclick = function () {
        if (button.className == minmaxobj.max.button.class_off) {
            var vid = document.getElementById(peerinfo.videoContainer);
            vid.webkitRequestFullScreen();
            button.className = minmaxobj.max.button.class_on;
            button.innerHTML = minmaxobj.max.button.html_on;
        } else {
            button.className = minmaxobj.max.button.class_off;
            button.innerHTML = minmaxobj.max.button.html_off;
        }
        //syncButton(audioButton.id);
    };
    return button;
}

/**
 * function to createMinimizeVideoButton
 * @method
 * @name createMinimizeVideoButton
 * @param {string} controlBarName
 * @param {json} peerinfo
 * @return {dom} button
 */
function createMinimizeVideoButton(controlBarName, peerinfo, streamid, stream) {
    let button = document.createElement("span");
    button.id = controlBarName + "minmizevideoButton";
    button.setAttribute("title", "Minimize Video");
    button.className = minmaxobj.min.button.class_off;
    button.innerHTML = minmaxobj.min.button.html_off;
    var vid = document.getElementById(peerinfo.videoContainer);
    button.onclick = function () {
        if (button.className == minmaxobj.min.button.class_off) {
            // vid.hidden = true;
            hideelem(vid);
            button.className = minmaxobj.min.button.class_on;
            button.innerHTML = minmaxobj.min.button.html_on;
        } else {
            // vid.hidden = false;
            showelem(vid);
            button.className = minmaxobj.min.button.class_off;
            button.innerHTML = minmaxobj.min.button.html_off;
        }
        //syncButton(audioButton.id);
    };
    webrtcdev.log("[_media_dommodifier ] createMinimizeVideoButton - button", button, " vid ", vid);
    return button;
}

/**
 * function to createAudioMuteButton
 * @method
 * @name attachUserDetails
 * @param {string} controlBarName
 * @param {json} peerinfo
 * @return {dom} button
 */
function createAudioMuteButton(controlBarName, peerinfo) {
    let audioButton = document.createElement("span");
    audioButton.id = controlBarName + "audioButton";
    audioButton.setAttribute("data-val", "mute");
    audioButton.setAttribute("title", "Toggle Audio");
    // audioButton.setAttribute("data-placement", "bottom");
    // audioButton.setAttribute("data-toggle", "tooltip");
    // audioButton.setAttribute("data-container", "body");
    audioButton.className = muteobj.audio.button.class_on;
    audioButton.innerHTML = muteobj.audio.button.html_on;
    audioButton.onclick = function () {
        if (audioButton.className == muteobj.audio.button.class_on) {
            peerinfo.stream.mute({
                audio: !0
            });
            audioButton.className = muteobj.audio.button.class_off;
            audioButton.innerHTML = muteobj.audio.button.html_off;
        } else {
            peerinfo.stream.unmute({
                audio: !0
            });
            audioButton.className = muteobj.audio.button.class_on;
            audioButton.innerHTML = muteobj.audio.button.html_on;
        }
        syncButton(audioButton.id);
    };
    return audioButton;
}

/**
 * function to createVideoMuteButton
 * @method
 * @name createVideoMuteButton
 * @param {string} controlBarName
 * @param {json} peerinfo
 * @return {dom} button
 */
function createVideoMuteButton(controlBarName, peerinfo) {
    let videoButton = document.createElement("span");
    videoButton.id = controlBarName + "videoButton";
    videoButton.setAttribute("title", "Toggle Video");
    videoButton.setAttribute("data-container", "body");
    videoButton.className = muteobj.video.button.class_on;
    videoButton.innerHTML = muteobj.video.button.html_on;
    videoButton.onclick = function (event) {
        if (videoButton.className == muteobj.video.button.class_on) {
            peerinfo.stream.mute({
                video: !0
            });
            videoButton.innerHTML = muteobj.video.button.html_off;
            videoButton.className = muteobj.video.button.class_off;
        } else {
            peerinfo.stream.unmute({
                video: !0
            });
            videoButton.innerHTML = muteobj.video.button.html_on;
            videoButton.className = muteobj.video.button.class_on;
        }
        syncButton(videoButton.id);
    };
    return videoButton;
}


/**********************************************
 User Detail attachment to Video Element
 *******************************************/

/**
 * function to attach user details header on top of video
 * @method
 * @name attachUserDetails
 * @param {dom} vid
 * @param {json} peerinfo
 */
function attachUserDetails(vid, peerinfo) {
    webrtcdev.log("[media_dommanager] attachUserDetails - ", peerinfo.userid, ":", peerinfo.type);
    if ((vid.parentNode.querySelectorAll('.videoHeaderClass')).length > 0) {
        webrtcdev.warn("[media_dommanager] video header already present ", vid.parentNode.querySelectorAll('.videoHeaderClass'));
        if ((vid.parentNode.querySelectorAll("videoheaders" + peerinfo.userid)).length > 0) {
            webrtcdev.warn("[media_dommanager] user's video header already present ", "videoheaders" + peerinfo.userid);
            return;
        } else {
            webrtcdev.warn("[media_dommanager] video header already present for diff user , overwrite with ", "videoheaders" + peerinfo.userid);
            let vidheader = vid.parentNode.querySelectorAll('.videoHeaderClass')[0];
            vidheader.remove();
        }
    }
    let nameBox = document.createElement("div");
    // nameBox.setAttribute("style", "background-color:" + peerinfo.color),
    nameBox.className = "videoHeaderClass",
        nameBox.innerHTML = peerinfo.name ,
        nameBox.id = "videoheaders" + peerinfo.userid;

    // vid.parentNode.appendChild(nameBox);
    vid.parentNode.insertBefore(nameBox, vid.parentNode.firstChild);
}

/**
 * function to attach user's meta details header on top of video
 * @method
 * @name attachMetaUserDetails
 * @param {dom} vid
 * @param {json} peerinfo
 */
function attachMetaUserDetails(vid, peerinfo) {
    webrtcdev.log("[media_dommanager] attachMetaUserDetails - ", peerinfo.userid, ":", peerinfo.type);
    let detailsbox = document.createElement("span");
    detailsbox.setAttribute("style", "background-color:" + peerinfo.color);
    detailsbox.innerHTML = peerinfo.userid + ":" + peerinfo.type + "<br/>";
    vid.parentNode.insertBefore(detailsbox, vid.parentNode.firstChild);
}

