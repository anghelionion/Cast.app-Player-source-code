function storyWidth() {
    return window.innerWidth && document.documentElement.clientWidth
        ? Math.min(window.innerWidth, document.documentElement.clientWidth)
        : window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}

function storyHeight() {
    return window.innerHeight && document.documentElement.clientHeight
        ? Math.min(window.innerHeight, document.documentElement.clientHeight)
        : window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

function updatePage() {
    let w = Math.round(storyWidth());
    let h = Math.round(storyHeight());
    let isPortrait = w < h;
    let hbyw = Math.round((100 * h) / w);

    const safePortraitMaxWidthPossiblyPhoneSize = 425;
    const safeLandscapeMaxWidthPossiblyPhoneSize = 760;

    const iPhone = navigator.userAgent.indexOf("iPhone") != -1;
    const iPod = navigator.userAgent.indexOf("iPod") != -1;

    // a.iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
    // a.iOS9 = /(iphone|ipod|ipad).* os 9_/.test(navigator.userAgent.toLowerCase());
    // a.iOS10 = /(iphone|ipod|ipad).* os 10_/.test(navigator.userAgent.toLowerCase());
    // a.iOS11 = /(iphone|ipod|ipad).* os 11_/.test(navigator.userAgent.toLowerCase());
    // a.iOS9plus = /(iphone|ipod|ipad).* os 10_/.test(navigator.userAgent.toLowerCase()) || /(iphone|ipod|ipad).* os 10_/.test(navigator.userAgent.toLowerCase());
    // a.iOS12_0 = /(iphone|ipod|ipad).* os 12_0/.test(navigator.userAgent.toLowerCase());
    // a.iOS12 = /(iphone|ipod|ipad).* os 12_/.test(navigator.userAgent.toLowerCase());
    // a.iOS13_0 = /(iphone|ipod|ipad).* os 13_0/.test(navigator.userAgent.toLowerCase());
    // a.iOS13 = /(iphone|ipod|ipad).* os 13/.test(navigator.userAgent.toLowerCase());
    // a.is_chrome = -1 < navigator.userAgent.indexOf("Chrome");
    // a.is_safari = -1 < navigator.userAgent.indexOf("Safari");
    // a.is_chrome && a.is_safari && (a.is_safari = !1);
    // a.is_opera = !!window.opera || 0 <= navigator.userAgent.indexOf(" OPR/");
    // a.is_android = -1 < navigator.userAgent.toLowerCase().indexOf("android");

    let boxH, boxW, numberOfcharts;
    if (hbyw > 100) {
        boxH = h / 2;
        boxW = w;
        numberOfcharts = iPhone || iPod || w < safePortraitMaxWidthPossiblyPhoneSize ? 1 : 2;
    } else {
        boxH = h;
        boxW = w / 2;
        numberOfcharts = iPhone || iPod || w < safeLandscapeMaxWidthPossiblyPhoneSize ? 1 : 2;
    }

    let sLog = `Boxes ${boxW} x ${boxH} Charts:${numberOfcharts} ${isPortrait ? "portrait" : "landscape"}`;
    sLog += "\n" + "width: " + w + ", height: " + h + " " + (isPortrait ? "portrait" : "landscape") + " h/w: " + hbyw + "%";

    if (document.getElementById("test:-S_JWqoSTUOxJ7OngBxh0Q")) {
        document.getElementById("test:-S_JWqoSTUOxJ7OngBxh0Q").innerHTML = sLog.replace("\n", "<br>");
    } else {
        console.log(sLog);
    }
}

//Moved to calling sources
// window.onresize = updatePage;
// updatePage();
