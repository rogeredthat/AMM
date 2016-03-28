var canvas = document.getElementById('canvas');
var $ = canvas.getContext('2d');
var visual = {
    w: document.getElementById('now_playing').clientWidth
    , h: document.getElementById('now_playing').clientHeight
};
canvas.width = visual.w;
canvas.height = visual.h;
var context = new(window.AudioContext || window.webkitAudioContext)();
var buffer;
buffer = context.createBufferSource();
analyser = context.createAnalyser();
spectrum = []
    , currentPoints = [];
deg = Math.PI / 50;
playerRad = visual.w / 10;
for (i = 0; i < 100; i++) {
    spectrum.push({
        x: playerRad * Math.cos(deg * i)
        , y: playerRad * Math.sin(deg * i)
    });
    currentPoints.push({
        x: playerRad * Math.cos(deg * i)
        , y: playerRad * Math.sin(deg * i)
    });
}
playMySong("colors.mp3");

function playMySong(songTitle) {
    var request = new XMLHttpRequest();
    request.open('GET', 'landing.audio/' + songTitle, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
        var audioData = request.response;
        context.decodeAudioData(audioData, function (arr) {
            buffer.buffer = arr;
            buffer.connect(analyser);
            buffer.start(0);
            analyser.connect(context.destination);
            analyser.fftSize = 256;
            var bufferLength = analyser.frequencyBinCount;
            var dataArray = new Uint8Array(bufferLength);
            analyser.getByteTimeDomainData(dataArray);

            function visualize() {
                analyser.getByteTimeDomainData(dataArray);
                window.requestAnimationFrame(visualize);
                for (i = 0; i < spectrum.length; i++) {
                    spectrum[i].x = (playerRad + Math.pow(dataArray[i] / 50, 3)) * Math.cos(deg * i);
                    spectrum[i].y = (playerRad + Math.pow(dataArray[i] / 50, 3)) * Math.sin(deg * i);
                }
                avg = (spectrum[spectrum.length - 1].x + spectrum[0].x) / 2;
                spectrum[0].x = spectrum[spectrum.length - 1].x = avg;
            };
            visualize();
        }, function (e) {
            "Error with decoding audio data" + e.err;
        });
    }
    request.send();
}

function draw() {
    window.requestAnimationFrame(draw);
    $.clearRect(0, 0, visual.w, visual.h);
    $.strokeStyle = "rgba(255,255,255,1)";
    $.lineWidth = 2;
    for(i=0;i<100;i++)
        {
            currentPoints[i].x+=(spectrum[i].x-currentPoints[i].x)/5;
            currentPoints[i].y+=(spectrum[i].y-currentPoints[i].y)/5;
        }
    $.beginPath();
    $.moveTo((visual.w / 2) + currentPoints[0].x, (visual.h / 2) + currentPoints[0].y)
    for (i = 1; i < 100; i++) {
        $.lineTo((visual.w / 2) + currentPoints[i].x, (visual.h / 2) + currentPoints[i].y);
    }
    $.lineTo((visual.w / 2) + currentPoints[0].x, (visual.h / 2) + currentPoints[0].y);
    $.closePath();
    $.stroke();
}
draw();