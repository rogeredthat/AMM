/*jshint esversion: 6 */

$('input').keydown(function (e) {
  if (e.which == 27) {
    $(this).blur();
  }
});

window.onfocus = function () {
  _drawing = true;
  window.requestAnimationFrame(draw);
};
window.onblur = function () {
  _drawing = false;
};

function updatePopulation() {
  let xhttp = new XMLHttpRequest();
  xhttp.onload = () => {
    if (xhttp.readyState == XMLHttpRequest.DONE && xhttp.status == 200) {
      console.log('Done');
      setTimeout(loadPopulation, 2000);
    }
  };
  xhttp.open('GET', 'http://localhost:5000/update');
  xhttp.send();
}
updatePopulation();
let FilePopulation;
//File List
function loadPopulation() {
  let xhttp = new XMLHttpRequest();
  xhttp.onload = () => {
    if (xhttp.readyState == XMLHttpRequest.DONE && xhttp.status == 200) {
      if (JSON.stringify(FilePopulation) !== xhttp.responseText) {
        FilePopulation = JSON.parse(xhttp.responseText);
        reflectFilePopulation();
      }
    }
  };
  xhttp.open('GET', "http://localhost:5000/index");
  xhttp.send();
}
// setInterval(loadPopulation, 10000);

var LibraryObject = (file) => {
  let listItem = document.createElement('li');
  let artist = document.createElement('span');
  let album = document.createElement('span');
  let title = document.createElement('span');
  artist.classList.add('artist');
  artist.innerHTML = file.artist || 'Unknown';
  album.classList.add('album');
  album.innerHTML = file.album || 'Unknown';
  title.classList.add('title');
  title.innerHTML = file.title || file.url.split('/').pop();
  listItem.appendChild(title);
  listItem.appendChild(artist);
  listItem.appendChild(album);
  listItem.addEventListener('dblclick', function () {
    $('#playlist .list').append(PlaylistObject(file));
  });
  return listItem;
};

var reflectFilePopulation = () => {
  $('#library .list').empty();
  FilePopulation.forEach((file) => {
    $('#library .list').append($(LibraryObject(file)));
  });
};

var PlaylistObject = (file) => {

  let $listItem = $('<li/>');
  $listItem.append($('<span>' + (file.title || file.url.split('/').pop()) + '</span>'));
  $listItem.attr('name', file.url);
  if (audio.paused) {
    audio.src = file.url;
    audio.currentTime = 0;
    $('#playlist .list>li').removeClass('active');
    $listItem.addClass('active');
  }
  $listItem.dblclick(function () {
    playMySong($(this).attr("name"));
    $('#playlist>.list>li').removeClass('active');
    $(this).addClass('active');
  });
  return $listItem;
};

//Visualization
var _drawing = true;
var volChange = 0;
var baseColor = 243;
var flyout = false;

var jsmediatags = window.jsmediatags; //JS media tags library object
var nowPlaying = document.getElementById('now_playing');
var volumeFace = document.getElementById('volumeFace');
var canvas = document.getElementById('canvas');
var palette = document.getElementById('palette');
var audio = document.querySelectorAll('audio')[0];
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

var spectrum = [];
var currentPoints = [];
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
  // songTitle = songTitle;
  audio.src = songTitle;
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
    window.requestAnimationFrame(visualize);
    if (_drawing) {
      analyser.getByteTimeDomainData(dataArray);
      analyser.getByteFrequencyData(dataArray2);
      for (i = 0, avg = 0; i < dataArray2.length; i++) {
        avg += dataArray2[i];
      }
      avg /= dataArray2.length;
      avg = Math.pow(avg, 1.5);
      avg /= 30;
      AimedRad = 40 + (playerRad + avg) * gainNode.gain.value;
      ctx.lineWidth = 1.5;
      CurrentRad += (AimedRad - CurrentRad) / 10;
      //Circle code was initially Here
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
    }
  }
  visualize();


}

function draw() {
  if (_drawing)
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
  let len = Math.round(256 * (audio.currentTime / audio.duration));
  ctx.beginPath();
  for (i = 0; i < len; i++) {
    j = i + 10;
    //for seeker
    ctx.strokeStyle = "hsl(" + baseColor + ",100%,60%)";
    ctx.globalAlpha = 0.3;
    ctx.moveTo((visual.w / 2) + currentPoints[i].x, (visual.h / 2) + currentPoints[i].y);
    ctx.lineTo((visual.w / 2) + (CurrentRad) * Math.cos(deg * j + phase), (visual.h / 2) + (CurrentRad) * Math.sin(deg * j + phase));
  }
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  for (i = len; i < currentPoints.length; i++) {
    j = i + 10;
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = "hsl(" + baseColor + ",50%,20%)";
    ctx.moveTo((visual.w / 2) + currentPoints[i].x, (visual.h / 2) + currentPoints[i].y);
    ctx.lineTo((visual.w / 2) + (CurrentRad) * Math.cos(deg * j + phase), (visual.h / 2) + (CurrentRad) * Math.sin(deg * j + phase));
  }
  ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 1.5;
  if (volChange--) {
    ctx.lineWidth = 1.5 + (1.5 * (volChange / 200));
  }
  ctx.strokeStyle = "hsl(" + baseColor + ",100%,60%)";
  ctx.beginPath();
  ctx.arc(visual.w / 2, visual.h / 2, CurrentRad, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.globalAlpha = 1;
  ctx.fill();
  ctx.stroke();
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
  if ($('#player').hasClass('active'))
    _drawing = false;
  else {
    _drawing = true;
    window.requestAnimationFrame(draw);
  }
});

shortcut.add("p", function (e) {
  $('#playlist_toggle').click();
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
    _drawing = false;
    $('#playlist').removeClass('active');
    $('#search_wrapper').removeClass('active');
    $('#sideControls>li').removeClass('active');
    searchInput.focus();
  } else {
    _drawing = true;
    window.requestAnimationFrame(draw);
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

};
searchInput.onblur = function () {
  $('#search_wrapper').removeClass('active');
  $('#search_button').removeClass('active');
};

var playIcon = document.getElementById("playIcon");
var pauseIcon = document.getElementById("pauseIcon");
//play_pause n shit
nowPlaying.getElementsByClassName('overlay')[0].onclick = function () {
  playPause();
};

function playPause() {
  if (!audio.paused) {
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
  $('.playpause').html("play_arrow");
};
audio.onplay = function () {
  playIcon.style.display = 'block';
  $('.playpause').html("pause");
  pauseIcon.style.display = 'none';
};
audio.onvolumechange = function() {
}
audio.onended = nextSong;

function nextSong() {
  var $elem = $('#playlist>.list>li.active').next();
  var $url = $elem.attr("name");
  if ($elem && $url !== undefined) {
    $elem.addClass('active').siblings().removeClass('active');
    playMySong($url);
    refreshInfo();
    fuckitup();
  }
}

function prevSong() {
  var $elem = $('#playlist>.list>li.active').prev();
  var $url = $elem.attr("name");
  if ($elem && $url !== undefined) {
    $elem.addClass('active').siblings().removeClass('active');
    curtags.tags.title = $elem.html();
    playMySong($url);
    refreshInfo();
    fuckitup();
  }
}
let timer;
function volumescroll(e) {
  clearTimeout(timer);
  var scrolldelta = e.wheelDelta;
    if (scrolldelta === undefined) {
      scrolldelta = -e.detail * 40;
    }
  newVol = gainNode.gain.value + (scrolldelta / 2400);
  volChange = 200;
  gainNode.gain.value = newVol < 0 ? 0 : Math.min(newVol, 1);
  $('#volumeFace').addClass('active');
  $('#volumeFace + label').html(Math.round(gainNode.gain.value*100)+'%');
  setTimeout(function(){
    $('#volumeFace').removeClass('active'); 
  },1000);
}

//workaound for volume change by mouse wheel code for firefox
var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel"; //FF doesn't recognize mousewheel as of FF3.x
if (nowPlaying.attachEvent) { //if IE (and Opera depending on user setting)
  nowPlaying.attachEvent("on" + mousewheelevt, volumescroll);
  volumescroll.attachEvent("on" + mousewheelevt, volumescroll);
} else if (nowPlaying.addEventListener) { //WC3 browsers
  nowPlaying.addEventListener(mousewheelevt, volumescroll, false);
  volumeFace.addEventListener(mousewheelevt, volumescroll, false);
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

function playFromDrop() {
  var file = document.getElementById('takeNew').files[0];
  var URL = window.URL;
  var fileURL = URL.createObjectURL(file);
  // From remote host
  loadTags(file, fileURL);
}

function loadTags(file, fileURL) {
  jsmediatags.read(file, {
    onSuccess: function (tag) {
      console.log(tag);
      curtags = tag;
      let temp = {};
      temp.title = tag.tags.title;
      temp.album = tag.tags.album;
      temp.artist = tag.tags.artist;
      temp.url = fileURL;
      $('#playlist .list').append(PlaylistObject(temp));
      var title = document.getElementById('title');
      var artist = document.getElementById('artist');
      var album = document.getElementById('album');
      var maincoverart = document.getElementById('maincoverart');
      var dataUrl = "img/default.png";
      title.innerHTML = tag.tags.title;
      artist.innerHTML = tag.tags.artist;
      album.innerHTML = tag.tags.album;
      if (tag.tags.picture !== undefined) {
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
};

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
    $('#canvas').removeClass('next');
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
  var pos = ((audio.currentTime / audio.duration) * $('#meta .seekbar .track').width());
  $('#meta .seekbar .handle').css({
    left: pos
  });
  $('#meta .seekbar .progress').css({
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
    var pos = $('#meta .seekbar .handle').position().left;
    var time = pos / $('#meta .seekbar .track').width() * audio.duration;
    $('#meta .seekbar .progress').css({
      width: pos
    });
    audio.currentTime = time;
  },
  stop: function () {
    audio.addEventListener('timeupdate', pushSeek, false);
  }
});

$('#meta .seekbar').click(function (e) {
  var pos = e.pageX - $(this).offset().left;
  $('#meta .seekbar .progress').css({
    width: pos
  });
  audio.currentTime = (pos / $('#meta .seekbar .track').width()) * audio.duration;
});
