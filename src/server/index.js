module.exports = function () {
  var dir = require('../../config.json');
  var fs = require('fs');
  var jsmediatags = require("jsmediatags");
  var listing = [];
  var updateIndex = function () {
    fs.readdir(dir.path, (err, list) => {
      if (err) {
        return console.log(err);
      }
      listing = [];
      list.forEach((song) => {
        if (song.substring(song.length - 4) == ".mp3") {
          song = dir.path + "/" + song;
          jsmediatags.read(song, {
            onSuccess: (dat) => {
              var obj = {};
              obj.url = song;
              obj.title = dat.tags.title;
              obj.artist = dat.tags.artist;
              obj.album = dat.tags.album;
              obj.picture = dat.tags.picture;
              obj.year = dat.tags.year;
              listing.push(obj);
            },
            onError: (dat) => {
              console.log(dat);
            }
          })
        }
      })
    })
  }

  var returnIndex = function () {
    return listing;
  }

  return {
    updateIndex: updateIndex,
    returnIndex: returnIndex,
  }

}();
