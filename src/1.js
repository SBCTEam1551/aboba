var ytdl = require('ytdl-core');


    var url = "https://www.youtube.com/watch?v=hgvuvdyzYFc";

    ytdl(url, {format: 'mp4'}).pipe('mp4.mp4');
