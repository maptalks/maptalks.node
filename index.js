var maptalks = require('maptalks'),
    svg2img = require('svg2img');

maptalks.Util.loadImage.svg = function (url, w, h, onComplete) {
    //use svg2img to convert svg to png.
    //https://github.com/fuzhenn/node-svg2img
    svg2img(url, {'width':w, 'height':h}, onComplete);
};
