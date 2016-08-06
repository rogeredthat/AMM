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
var baseColor = 243;
var flyout = false;

var jsmediatags = window.jsmediatags; //JS media tags library object
var nowPlaying = document.getElementById('now_playing');
var canvas = document.getElementById('canvas');
var palette = document.getElementById('palette');
var audio = document.querySelectorAll('audio')[0];
var infoflow = document.getElementById('infoflow');
var ctx = canvas.getContext('2d');
var avg = 0;
var visual = {
  w: nowPlaying.clientWidth,
  h: nowPlaying.clientHeight
};
canvas.width = visual.w;
canvas.height = visual.h;
var playerRad = ((visual.w > visual.h) ? visual.h : visual.w) / 4;
var AimedRad = playerRad;
var CurrentRad = playerRad;
var hairoffset = 10;
var curtags = null; //To store tags of currently playing song.

//global information variables


function ResizeCanvas() {
  visual.w = nowPlaying.offsetWidth;
  visual.h = nowPlaying.offsetHeight;
  if (canvas.width != visual.w);
  canvas.width = visual.w;
  if (canvas.height != visual.h)
    canvas.height = visual.h;
  playerRad = ((visual.w > visual.h) ? visual.h : visual.w) / 4;
}
var wafer = 0;
var framecount = 0;
var context = new AudioContext();
var analyser = context.createAnalyser();
var gainNode = context.createGain();
var buffer = context.createMediaElementSource(audio);

spectrum = [], currentPoints = [];
deg = Math.PI / 128;
phase = 0;
for (i = 0; i < 256; i++) {
  spectrum.push({
    x: playerRad * Math.cos(deg * i),
    y: playerRad * Math.sin(deg * i)
  });
  currentPoints.push({
    x: playerRad * Math.cos(deg * i),
    y: playerRad * Math.sin(deg * i)
  });
}

function playMySong(songTitle) {
  audio.src = "landing.audio/" + songTitle;
}

function Splash() {

}

function Init(songTitle) {
  ctx.lineWidth = 1;
  audio.src = "landing.audio/" + songTitle;
  buffer.connect(gainNode);
  gainNode.connect(analyser);
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
    ctx.lineWidth = 1.5;
    if (volChange--) {
      ctx.lineWidth = 1.5 + (1.5 * (volChange / 200));
    }
    ctx.strokeStyle = "hsl(" + baseColor + ",100%,60%)"
    CurrentRad += (AimedRad - CurrentRad) / 10;
    ctx.beginPath();
    ctx.arc(visual.w / 2, visual.h / 2, CurrentRad, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.stroke();
    for (i = 0; i < spectrum.length / 2; i++) {
      spectrum[i].x = (CurrentRad * 1.0 + Math.pow(dataArray[i] / 50, 3)) * Math.cos((deg * i) + phase);
      spectrum[i].y = (CurrentRad * 1.0 + Math.pow(dataArray[i] / 50, 3)) * Math.sin((deg * i) + phase);
      //spectrum[i].y = Math.min(spectrum[i].y,30);
    }
    for (i = spectrum.length / 2; i < spectrum.length; i++) {
      spectrum[i].x = (CurrentRad * 1.0 + Math.pow(dataArray[(spectrum.length - 1) - i] / 50, 3)) * Math.cos((deg * i) + phase);
      spectrum[i].y = (CurrentRad * 1.0 + Math.pow(dataArray[(spectrum.length - 1) - i] / 50, 3)) * Math.sin((deg * i) + phase);
      //spectrum[i].y = Math.min(spectrum[i].y,30);
    }
  };
  visualize();


}

function draw() {
  window.requestAnimationFrame(draw);
  //hairoffset = Math.cos(avg / 100) * 10;
  ResizeCanvas();
  volChange = Math.max(volChange - 1, 0);
  phase += (0.005 + (0.001 * (avg / 50)));
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.globalAlpha = 0.75;
  ctx.fillRect(0, 0, visual.w, visual.h);
  ctx.strokeStyle = "rgb(0,0,0)";
  ctx.globalAlpha = 1;
  //ctx.lineWidth = 1.5;
  ctx.lineWidth = 2;
  for (i = 0; i < currentPoints.length; i++) {
    currentPoints[i].x += (spectrum[i].x - currentPoints[i].x) / 10;
    currentPoints[i].y += (spectrum[i].y - currentPoints[i].y) / 10;
  }

  ctx.beginPath();
  ctx.moveTo((visual.w / 2) + currentPoints[0].x, (visual.h / 2) + currentPoints[0].y);
  for (i = 0; i < 256 * (audio.currentTime / audio.duration); i++) {
    ctx.lineTo((visual.w / 2) + currentPoints[i].x, (visual.h / 2) + currentPoints[i].y);
  }
  ctx.strokeStyle = "hsl(" + baseColor + ",100%,60%)";
  ctx.globalAlpha = 0.4;
  ctx.stroke();
  ctx.lineTo((visual.w / 2) + (CurrentRad + 1) * Math.cos(deg * (i + 10) + phase), (visual.h / 2) + (CurrentRad + 1) * Math.sin(deg * (i + 10) + phase));
  ctx.arc(visual.w / 2, visual.h / 2, CurrentRad, deg * 10 + phase, deg * (i + 10) + phase);
  ctx.lineTo((visual.w / 2) + (CurrentRad + 1) * Math.cos(deg * 10 + phase), (visual.h / 2) + (CurrentRad + 1) * Math.sin(deg * 10 + phase));
  ctx.closePath();
  ctx.globalAlpha = 0.2;
  ctx.stroke();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = "hsl(" + baseColor + ",100%,60%)";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.globalAlpha = 0.5;
  ctx.moveTo((visual.w / 2) + currentPoints[i].x, (visual.h / 2) + currentPoints[i].y);
  for (i = Math.floor(256 * (audio.currentTime / audio.duration)); i < currentPoints.length; i++) {
    ctx.lineTo((visual.w / 2) + currentPoints[i].x, (visual.h / 2) + currentPoints[i].y);
  }
  ctx.lineTo((visual.w / 2) + currentPoints[0].x, (visual.h / 2) + currentPoints[0].y);
  ctx.strokeStyle = "hsl(" + baseColor + ",40%,20%)";
  ctx.stroke();

  //Curl's hair
  ctx.globalAlpha = 0.2;
  ctx.lineWidth = 1;
  for (i = 0; i < currentPoints.length; i++) {
    if (i % 1 == 0) {
      j = i + 10;
      ctx.beginPath();
      //for seeker
      if (i < (len = 256 * (audio.currentTime / audio.duration))) {
        ctx.strokeStyle = "hsl(" + baseColor + ",100%,60%)";
        ctx.globalAlpha = 0.3;
      } else {
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = "hsl(" + baseColor + ",50%,20%)";
      }
      ctx.moveTo((visual.w / 2) + currentPoints[i].x, (visual.h / 2) + currentPoints[i].y);
      ctx.lineTo((visual.w / 2) + (CurrentRad) * Math.cos(deg * j + phase), (visual.h / 2) + (CurrentRad) * Math.sin(deg * j + phase));
      ctx.closePath();
      ctx.stroke();

    }
  }


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

$("[tabindex]").blur(function () {
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
  curtags.tags.title = $(this).html();
});

shortcut.add("p", function (e) {
  $('#playlist_toggle').click();
}, {
  'type': 'keydown',
  'disable_in_input': true
});

shortcut.add("right", function () {
  $('#search_button').click();
  searchInput.focus();
}, {
  'type': 'keydown',
  'disable_in_input': true
});

shortcut.add("Shift+right", function () {
  audio.currentTime += 3;
}, {
  'type': 'keydown',
  'disable_in_input': false
});

shortcut.add("Shift+left", function () {
  audio.currentTime -= 3;
}, {
  'type': 'keydown',
  'disable_in_input': false
});

shortcut.add("Ctrl+down", function () {
  newVol = gainNode.gain.value - 0.05;
  volChange = 200;
  gainNode.gain.value = newVol < 0 ? 0 : Math.min(newVol, 1);
}, {
  'type': 'keydown',
  'disable_in_input': false
});

shortcut.add("Ctrl+Up", function () {
  newVol = gainNode.gain.value + 0.05;
  volChange = 200;
  gainNode.gain.value = newVol < 0 ? 0 : Math.min(newVol, 1);
}, {
  'type': 'keydown',
  'disable_in_input': false
});

shortcut.add("Esc", function () {
  $('#player').toggleClass('active');
  if ($('#player').hasClass('active')) {
    $('#playlist').removeClass('active');
    $('#search_wrapper').removeClass('active');
    $('#sideControls>li').removeClass('active');
    searchInput.focus();
  } else {
    searchInput.blur();
  }
}, {
  'type': 'keydown',
  'disable_in_input': true
});

shortcut.add("Ctrl+Shift+Right", function () {
  nextSong();
}, {
  'type': 'keydown',
  'disable_in_input': false
});

shortcut.add("Ctrl+Shift+left", function () {
  prevSong();
}, {
  'type': 'keydown',
  'disable_in_input': false
});

shortcut.add("Space", function () {
  playPause();
}, {
  'type': 'keydown',
  'disable_in_input': true
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
  } else {
    audio.play();
    $(canvas).addClass('active');
  }
}

audio.onpause = function () {
  playIcon.style.display = 'none';
  pauseIcon.style.display = 'block';
}
audio.onplay = function () {
  playIcon.style.display = 'block';
  pauseIcon.style.display = 'none';
}
audio.onended = nextSong;

function nextSong() {
  var $elem = $('#playlist>.list>li.active').next();
  var $url = $elem.attr("name");
  if ($elem && $url != undefined) {
    $('#playlist>.list>li').removeClass('active');
    $elem.addClass('active');
    curtags.tags.title = $elem.html();
    playMySong($url);
    refreshInfo();
    fuckitup()
  }
}

function prevSong() {
  var $elem = $('#playlist>.list>li.active').prev();
  var $url = $elem.attr("name");
  if ($elem && $url != undefined) {
    $('#playlist>.list>li').removeClass('active');
    $elem.addClass('active');
    curtags.tags.title = $elem.html();
    playMySong($url);
    refreshInfo();
    fuckitup()
  }
}

function volumescroll(e) {
  newVol = gainNode.gain.value + (e.wheelDelta / 2400);
  volChange = 200;
  //hairoffset=hairoffset+Math.sign(e.wheelDelta)
  /*wafer = 40000;*/
  gainNode.gain.value = newVol < 0 ? 0 : Math.min(newVol, 1);
}

//workaound for volume change by mouse wheel code for firefox
var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
if (document.attachEvent) { //if IE (and Opera depending on user setting)
  document.attachEvent("on" + mousewheelevt, function (e) {
    newVol = gainNode.gain.value + (e.wheelDelta / 2400);
    volChange = 200;
    console.log(e);
    //hairoffset=hairoffset+Math.sign(e.wheelDelta)
    /*wafer = 40000;*/
    gainNode.gain.value = newVol < 0 ? 0 : Math.min(newVol, 1);
  })
} else if (document.addEventListener) { //WC3 browsers
  document.addEventListener(mousewheelevt, function (e) {
    var scrolldelta = e.wheelDelta;
    if (scrolldelta == undefined) {
      scrolldelta = -e.detail * 40;
    }
    newVol = gainNode.gain.value + (scrolldelta / 2400);
    console.log(e.detail);
    console.log(e);
    volChange = 200;
    //hairoffset=hairoffset+Math.sign(e.wheelDelta)
    /*wafer = 40000;*/
    gainNode.gain.value = newVol < 0 ? 0 : Math.min(newVol, 1);
  }, false);
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
Init("Colors.mp3");

function addToPlay() {
  var file = document.getElementById('takeNew').files[0];
  var URL = window.URL;
  var fileURL = URL.createObjectURL(file);
  console.log(fileURL);
  audio.src = fileURL;
  // From remote host
  jsmediatags.read(file, {
    onSuccess: function (tag) {
      console.log(tag);
      curtags = tag;
      var title = document.getElementById('title');
      var artist = document.getElementById('artist');
      var album = document.getElementById('album');
      var maincoverart = document.getElementById('maincoverart');
      var dataUrl = "landing.img/default.png";
      title.innerHTML = tag.tags.title;
      artist.innerHTML = tag.tags.artist;
      album.innerHTML = tag.tags.album;
      if (tag.tags.picture != undefined) {
        var base64String = "";
        for (var i = 0; i < tag.tags.picture.data.length; i++) {
          base64String += String.fromCharCode(tag.tags.picture.data[i]);
        }
        dataUrl = "data:" + tag.tags.picture.format + ";base64," + window.btoa(base64String);
      }
      maincoverart.setAttribute('src', dataUrl);
    },
    onError: function (error) {
      console.log(error);
    }
  });
  audio.currentTime = 0;
}

$('#meta').click(function () {
  $(this).toggleClass('active');
  refreshInfo();
});

function refreshInfo() {
  document.getElementById('title').innerHTML = curtags.tags.title;
}

audio.onloadeddata = function () {
  $('#meta').addClass('active');
  window.setTimeout(function () {
    $('#meta').removeClass('active');
  }, 5000);
}

document.body.ondragover = function () {
  $('#tray').addClass('active');
};

document.body.ondrop = function () {
  $('#tray').removeClass('active');
  fuckitup();
};

function fuckitup() {
  $('#canvas').addClass('next');
  setTimeout(function () {
    $('#canvas').removeClass('next')
  }, 500);
}

$('#seekHandle').draggable({
  start: function (e) {
    $('#seekHandle').parent().addClass('dragged');
  },
  drag: function () {
    w = $('#seekHandle').width();
    pos = $('#seekHandle').position().left - w / 2;
    console.log(pos);
    if (pos) {
      $('#seekChange').css({
        left: w / 2,
        right: w / 2 - pos
      });
    } else {
      $('#seekChange').css({
        left: w / 2 - pos,
        right: w / 2
      });
    }
  },
  stop: function () {
    $('#seekHandle').parent().removeClass('dragged');
    $('#seekHandle').css({
      'left': '50%'
    });
  },
  axis: 'x',
  containment: $("#seekBar").parent()
});

audio.addEventListener('timeupdate', pushSeek, false);

function pushSeek() {
  var pos = ((audio.currentTime / audio.duration) * $('#infoflow .track').width());
  $('#infoflow .handle').css({
    left: pos
  });
  $('#infoflow .progress').css({
    width: pos
  });
}

$('.handle').draggable({
  axis: 'x',
  containment: 'parent',
  start: function () {
    audio.removeEventListener('timeupdate', pushSeek, false);
  },
  drag: function () {
    var pos = $('#infoflow .handle').position().left;
    var time = pos / $('#infoflow .track').width() * audio.duration;
    $('#infoflow .progress').css({
      width: pos
    });
    audio.currentTime = time;
  },
  stop: function () {
    audio.addEventListener('timeupdate', pushSeek, false);
  }
});

$('#infoflow .track').click(function (e) {
  var pos = e.pageX - $(this).offset().left;
  $('#infoflow .progress').css({
    width: pos
  });
  audio.currentTime = (pos / $('#infoflow .track').width()) * audio.duration;
});
