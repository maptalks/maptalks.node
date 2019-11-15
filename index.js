var maptalks = require('maptalks'),
    svg2img = require('svg2img'),
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    urlParser = require('url');

var httpAgent = http.globalAgent;

maptalks.setupHttpAgent = function(options) {
    httpAgent = new http.Agent(options);
}

var loadRemoteImage = function (img, url, onComplete) {
    // http
    var request;
    if (url.indexOf('https://') === 0) {
        request = https.request;
    } else {
        request = http.request;
    }
    var urlObj = urlParser.parse(url);
    //mimic the browser to prevent server blocking.
    urlObj.headers = {
        'Accept': 'image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache',
        // This is header used in http/1.0, nodejs use http/1.1 by default
        // 'Connection': 'keep-alive',
        'Host': urlObj.host,
        'Pragma': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36'
    };
    urlObj.agent = httpAgent;
    request(urlObj, function (res) {
        var data = [];
        res.on('data', function (chunk) {
            data.push(chunk);
        });
        res.on('end', function () {
            onComplete(null, Buffer.concat(data));
        });
    }).on('error', onComplete).end();
};

var loadLocalImage = function (img, url, onComplete) {
    // local file
    fs.readFile(url, onComplete);
};


maptalks.Util.loadImage.node = function (img, imgDesc) {
    function onError(err) {
        if (err) {
            console.error(err);
            console.error(err.stack);
        }
        var onerrorFn = img.onerror;
        if (onerrorFn) {
            onerrorFn.call(img);
        }
    }

    function onLoadComplete(err, data) {
        if (err) {
            onError(err);
            return;
        }
        var onloadFn = img.onload;
        if (onloadFn) {
            img.onload = function () {
                onloadFn.call(img);
            };
        }
        img.src = data;
    }
    var url = imgDesc[0],
        w = imgDesc[1],
        h = imgDesc[2];
    try {
        if (maptalks.Util.isSVG(url)) {
            //use svg2img to convert svg to png.
            //https://github.com/fuzhenn/node-svg2img
            svg2img(url, {'width':w, 'height':h}, onLoadComplete);
        } else if (maptalks.Util.isURL(url)) {
            // canvas-node的Image对象
            loadRemoteImage(img, url, onLoadComplete);
        } else {
            loadLocalImage(img, url, onLoadComplete);
        }
    } catch (error) {
        onError(error);
    }
}

function wrapCallback (cb) {
    return function (res) {
        var data = [],
            isBuffer = false;
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk instanceof Buffer) {
                isBuffer = true;
            }
            data.push(chunk);
        });
        res.on('end', function () {
            cb(null, isBuffer ? Buffer.concat(data).toString('utf8') : data.join(''));
        });
    };
};

function getClient(protocol) {
    return (protocol && protocol === 'https:') ? https : http;
};


maptalks.Ajax.get.node = function (url, cb) {
    var reqOpts = urlParser.parse(url);
    reqOpts.method = 'GET';
    reqOpts.agent = httpAgent;
    getClient(reqOpts.protocol)
        .get(reqOpts, wrapCallback(cb))
        .on('error', cb);
    return maptalks.Ajax;
};

maptalks.Ajax.post.node = function (options, postData, cb) {
    var reqOpts = urlParser.parse(options.url);
    reqOpts.method = 'POST';
    reqOpts.agent = httpAgent;
    if (!options.headers) {
        options.headers = {};
    }
    if (!options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    reqOpts.headers = options.headers;

    var req = getClient(reqOpts.protocol).request(reqOpts, wrapCallback(cb));

    req.on('error', cb);

    if (!isString(postData)) {
        postData = JSON.stringify(postData);
    }

    req.write(postData);
    req.end();
    return maptalks.Ajax;
};

module.exports = maptalks; 
