/*SmartAuth.initialize("172.16.120.100:3000", "56f807294ddaf90940bb783f", "56f80b994ddaf90940bb7840", function (check) {
    if (check.error) {
        console.log(check.error.message);
    } else {
        SmartAuth.login(function (user) {
            if (user.error) {
                console.log(user.error.message);
            } else {
                console.log(user.userid)
                console.log(user.username)
                console.log(user.bitsid)
                console.log(user.isverified)
            }
        })
    }
});*/

$('input').keydown(function (e) {
    if (e.which == 27) {
        $(this).blur();
    }
});

//Visualization
var volChange = 0;
var baseColor = 43;
var flyout = false;

var nowPlaying = document.getElementById('now_playing');
var canvas = document.getElementById('canvas');
var palette = document.getElementById('palette');
var audio = document.querySelectorAll('audio')[0];
var ctx = canvas.getContext('2d');
var avg = 0;
var visual = {
    w: nowPlaying.clientWidth
    , h: nowPlaying.clientHeight
};
canvas.width = visual.w;
canvas.height = visual.h;
var playerRad = ((visual.w > visual.h) ? visual.h : visual.w) / 4;
var AimedRad = playerRad;
var CurrentRad = playerRad;


function ResizeCanvas() {
    visual.w = nowPlaying.offsetWidth;
    visual.h = nowPlaying.offsetHeight;
    canvas.width = visual.w;
    canvas.height = visual.h;
    playerRad = ((visual.w > visual.h) ? visual.h : visual.w) / 4;
}
var wafer = 0;
var context = new AudioContext();
var analyser = context.createAnalyser();
var gainNode = context.createGain();
var buffer = context.createMediaElementSource(audio);
spectrum = []
    , currentPoints = [];
deg = Math.PI / 128;
phase = 0;
for (i = 0; i < 256; i++) {
    spectrum.push({
        x: playerRad * Math.cos(deg * i)
        , y: playerRad * Math.sin(deg * i)
    });
    currentPoints.push({
        x: playerRad * Math.cos(deg * i)
        , y: playerRad * Math.sin(deg * i)
    });
}


function playMySong(songTitle) {
    audio.src = "landing.audio/" + songTitle;
    buffer.connect(gainNode);
    gainNode.connect(analyser);
    playIcon.style.display = 'block';
    analyser.connect(context.destination);
    analyser.fftSize = 256;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    var dataArray2 = new Uint8Array(bufferLength);

    function visualize() {
        analyser.getByteTimeDomainData(dataArray);
        analyser.getByteFrequencyData(dataArray2);
        for (i = 0, avg = 0; i < dataArray2.length; i++) {
            avg += dataArray2[i];
        }
        avg /= dataArray2.length;
        avg = Math.pow(avg, 1.5);
        avg /= 30;
        AimedRad = 40 + (playerRad + avg) * gainNode.gain.value;
        window.requestAnimationFrame(visualize);
        if (volChange--) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = "hsla(" + baseColor + "100%,60%)";
            ctx.globalAlpha = Math.min(0.2, 1 - (volChange / 1000));
        }
        CurrentRad += (AimedRad - CurrentRad) / 5;
        ctx.beginPath();
        ctx.arc(visual.w / 2, visual.h / 2, CurrentRad, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
        for (i = 0; i < spectrum.length / 2; i++) {
            spectrum[i].x = (CurrentRad + Math.pow(dataArray[i] / 50, 3)) * Math.cos((deg * i) + phase);
            spectrum[i].y = (CurrentRad + Math.pow(dataArray[i] / 50, 3)) * Math.sin((deg * i) + phase);
        }
        for (i = spectrum.length / 2; i < spectrum.length; i++) {
            spectrum[i].x = (CurrentRad + Math.pow(dataArray[(spectrum.length - 1) - i] / 50, 3)) * Math.cos((deg * i) + phase);
            spectrum[i].y = (CurrentRad + Math.pow(dataArray[(spectrum.length - 1) - i] / 50, 3)) * Math.sin((deg * i) + phase);
        }
    };
    visualize();


}

function draw() {
    window.requestAnimationFrame(draw);
    ResizeCanvas();
    volChange = Math.max(volChange - 1, 0);
    phase += (0.005 + (0.001 * (avg / 50)));
    ctx.clearRect(0, 0, visual.w, visual.h);
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1.5;
    for (i = 0; i < currentPoints.length; i++) {
        currentPoints[i].x += (spectrum[i].x - currentPoints[i].x) / 10;
        currentPoints[i].y += (spectrum[i].y - currentPoints[i].y) / 10;
    }

    ctx.beginPath();
    ctx.moveTo((visual.w / 2) + currentPoints[0].x, (visual.h / 2) + currentPoints[0].y)
    for (i = 1; i < currentPoints.length; i++) {
        ctx.lineTo((visual.w / 2) + currentPoints[i].x, (visual.h / 2) + currentPoints[i].y);
    }
    ctx.lineTo((visual.w / 2) + currentPoints[0].x, (visual.h / 2) + currentPoints[0].y);
    ctx.closePath();
    ctx.strokeStyle = "hsl(" + baseColor + ",50%,20%)";
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1;
    for (i = 0; i < currentPoints.length; i++) {
        j = (i + 10 < currentPoints.length ? i + 10 : i + 10 - currentPoints.length);
        ctx.beginPath();
        //for seeker
        if (i < 256 * (audio.currentTime / audio.duration)) {
            ctx.strokeStyle = "hsl(" + baseColor + ",100%,60%)";
        } else {
            ctx.strokeStyle = "hsl(" + baseColor + ",50%,20%)";
        }
        //for volume
        /*else if (i < gainNode.gain.value * 256 && wafer > 0) {
            var factor = wafer / 40000;
            var returncolor;
            if (i < 256 * (buffer.context.currentTime / 250)) {
                returncolor = seekcolor;
            } else {
                returncolor = basecolor
            }
            ctx.strokeStyle = getrgbcolor(mergecolor(volcolor, returncolor, factor));
            wafer--;
        }
        else if (i > gainNode.gain.value * 256 && wafer > 0) {
            var factor = wafer / 40000;
            var returncolor;
            if (i < 256 * (buffer.context.currentTime / 250)) {
                returncolor = seekcolor;
            } else {
                returncolor = basecolor
            }
            ctx.strokeStyle = getrgbcolor(mergecolor(basecolor, returncolor, factor));
            wafer--;
        }
        else {
            ctx.strokeStyle = getrgbcolor(basecolor);
        }*/
        ctx.moveTo((visual.w / 2) + currentPoints[i].x, (visual.h / 2) + currentPoints[i].y);
        ctx.lineTo((visual.w / 2) + (CurrentRad) * Math.cos(deg * j + phase), (visual.h / 2) + (CurrentRad) * Math.sin(deg * j + phase));
        ctx.closePath();
        ctx.stroke();
    }
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(visual.w / 2, visual.h / 2, AimedRad, 0, 2 * Math.PI);
    ctx.closePath();
    //    ctx.stroke();


}
draw();


//Sidebar Functions
sidebar = document.getElementById("sidebar");
searchInput = document.getElementById("search_item");
suggestionBox = document.getElementById('suggestionWrapper');

$('#search_button').click(function () {
    if (!$('#player').hasClass('active')) {
        searchInput.focus();
        $('#deafNet').toggle();
        $('#search_wrapper').toggleClass('active');
    }
});

$('#playlist_toggle').click(function () {
    if (!$('#player').hasClass('active')) {
        $('#playlist').toggleClass('active');
        $('#playlist').focus();
        $('#deafNet').toggle();
    }
});

$("[tabindex]").blur(function(){
    $('#sideControls>li').removeClass('active');
    $(this).removeClass('active');
    $('#deafNet').hide();
});

$('#color_palette>i').click(function () {
    $('#palette').toggleClass('active');
    $('#palette').focus();
    $('#deafNet').toggle();
});

$(palette).click(function (e) {
    baseColor = e.clientY - $('#color_palette').position().top - 10;
    genPalette();
});

$('#tab').dblclick(function () {
    $('#player').toggleClass('active');
})

$('#playlist>.list>li').dblclick(function () {
    playMySong($(this).attr("name"));
    $('#playlist>.list>li').removeClass('active');
    $(this).addClass('active');
});

shortcut.add("p", function (e) {
    $('#playlist_toggle').click();
}, {
    'type': 'keydown'
    , 'disable_in_input': true
});

shortcut.add("right", function () {
    $('#search_button').click();
    searchInput.focus();
}, {
    'type': 'keydown'
    , 'disable_in_input': true
});

shortcut.add("Shift+right", function () {
    $('#player').addClass('active');
    $('#playlist').removeClass('active');
    $('#search_wrapper').removeClass('active');
    $('#sideControls>li').removeClass('active');
    searchInput.focus();
}, {
    'type': 'keydown'
    , 'disable_in_input': false
});

shortcut.add("Ctrl+down", function () {
    newVol = gainNode.gain.value - 0.05;
    volChange = 200;
    gainNode.gain.value = newVol < 0 ? 0 : Math.min(newVol, 1);
}, {
    'type': 'keydown'
    , 'disable_in_input': false
});

shortcut.add("Ctrl+Up", function () {
    newVol = gainNode.gain.value + 0.05;
    volChange = 200;
    gainNode.gain.value = newVol < 0 ? 0 : Math.min(newVol, 1);
}, {
    'type': 'keydown'
    , 'disable_in_input': false
});

shortcut.add("Shift+left", function () {
    $('#player').removeClass('active');
    searchInput.blur();
}, {
    'type': 'keydown'
    , 'disable_in_input': false
});

shortcut.add("Space", function () {
    playPause();
}, {
    'type': 'keydown'
    , 'disable_in_input': true
});

searchInput.onfocus = function () {

}
searchInput.onblur = function () {
    $('#search_wrapper').removeClass('active');
    $('#search_button').removeClass('active');
}

var playIcon = document.getElementById("playIcon");
var pauseIcon = document.getElementById("pauseIcon");
//play_pause n shit
nowPlaying.getElementsByClassName('overlay')[0].onclick = function () {
     playPause();
}

function playPause() {
    if ($(canvas).hasClass('active')) {
        audio.pause();
        $(canvas).removeClass('active');
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        audio.play();
        $(canvas).addClass('active');
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

audio.onended = function () {
    $elem = $('#playlist>.list>li.active').next();
    $url = $elem.attr("name");
    $('#playlist>.list>li').removeClass('active');
    $elem.addClass('active');
    playMySong($url);
}

nowPlaying.onmousewheel = function (e) {
    newVol = gainNode.gain.value + (e.wheelDelta / 2400);
    volChange = 200;
    /*wafer = 40000;*/
    gainNode.gain.value = newVol < 0 ? 0 : Math.min(newVol, 1);
}

//playlist sorting
$('#playlist>.list').sortable({
    placeholder: "ui-state-highlight"
});
$('#playlist>.list').disableSelection();

function mergecolor(icolor, fcolor, factor1) {
    var color = {};
    color.rval = Math.floor(fcolor.rval - (fcolor.rval - icolor.rval) * factor1);
    color.gval = Math.floor(fcolor.gval - (fcolor.gval - icolor.gval) * factor1);
    color.bval = Math.floor(fcolor.bval - (fcolor.bval - icolor.bval) * factor1);
    return color;
}

function getrgbcolor(color) {
    return "rgb(" + color.rval + "," + color.gval + "," + color.bval + ")";
}

//colorPalette
palette.width = 100;
palette.height = 360;
paletteContext = palette.getContext('2d');

function genPalette() {
    paletteContext.clearRect(0, 0, 100, 360);
    for (i = 0; i < 360; i++) {
        paletteContext.beginPath();
        paletteContext.strokeStyle = "hsla(" + i + ",100%,50%,1)";
        paletteContext.moveTo(0, i);
        paletteContext.lineTo(100, i);
        paletteContext.closePath();
        paletteContext.stroke();
    }
    paletteContext.lineWidth = 2;
    paletteContext.strokeStyle = "rgba(0,0,0,0.5)";
    paletteContext.beginPath();
    paletteContext.moveTo(0, baseColor);
    paletteContext.lineTo(100, baseColor);
    paletteContext.closePath();
    paletteContext.stroke();
}
genPalette();
playMySong("High Hopes.mp3");