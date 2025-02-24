// sparkJoy.js
/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

const gSvgNS = "http://www.w3.org/2000/svg";

function gdefs(lgId, topStopColor = "rgba(0,150,0, 1)", bottomStopColor = "rgba(0,120,0, 0.0)") {
    let defs = document.createElementNS(gSvgNS, "defs");
    let lg = document.createElementNS(gSvgNS, "linearGradient");
    lg.setAttribute("id", lgId);
    lg.setAttribute("x1", "0");
    lg.setAttribute("y1", "0");
    lg.setAttribute("x2", "0");
    lg.setAttribute("y2", "1");

    let stopColorTop = document.createElementNS(gSvgNS, "stop");
    stopColorTop.setAttribute("offset", "0%");
    stopColorTop.setAttribute("stop-color", topStopColor);

    let stopColorBottom = document.createElementNS(gSvgNS, "stop");
    stopColorBottom.setAttribute("offset", "100%");
    stopColorBottom.setAttribute("stop-color", bottomStopColor);

    lg.appendChild(stopColorTop);
    lg.appendChild(stopColorBottom);
    defs.appendChild(lg);
    return defs;
}

function fixEdgeMarkers(points) {
    if (points && points[0] && points[0][2]) {
        points[0][2] = 2; //edge needs thicker strokes
    }
    if (points && points[points.length - 1] && points[points.length - 1][2]) {
        points[points.length - 1][2] = 2;
    }
}

function scalePoints(points, maxY, width, maxX, height) {
    for (let i = points.length - 1; i >= 0; i--) {
        points[i][1] = maxY - points[i][1];
        if (points[i][2]) points[i][2] = 1; //reset stroke multiplier
        //scale the x and y
        points[i][0] = (points[i][0] * width) / maxX;
        points[i][1] = (points[i][1] * height) / maxY;
        //fix fatMarker
        if (points[i][3]) {
            if (Array.isArray(points[i][3])) points[i][3] = points[i][3].sort((a, b) => b - a); //sort descending
            if (!Array.isArray(points[i][3])) {
                let a = new Array();
                a.push(points[i][3]);
                points[i][3] = a;
            }
        }
    }
}

const line = (pointA, pointB) => {
    const lengthX = pointB[0] - pointA[0];
    const lengthY = pointB[1] - pointA[1];
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX),
    };
};

const controlPoint = (current, previous, next, reverse, smoothing) => {
    const o = line(previous || current, next || current);
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
};

const bezierCommand = (point, i, a, smoothing) => {
    // const smoothing = 0.04;
    const cps = controlPoint(a[i - 1], a[i - 2], point, false, smoothing);
    const cpe = controlPoint(point, a[i - 1], a[i + 1], true, smoothing);
    return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
    return `L ${point[0]},${point[1]}`;
};

const getD = (points, command, smoothing) => {
    return points.reduce((acc, point, i, a) => (i === 0 ? `M ${point[0]},${point[1]}` : `${acc} ${command(point, i, a, smoothing)}`), "");
};

function fixAreaLine(aPoints, a2Points, lineLowPoints, linePoints, lineHighPoints, width, height, maxXPoint, maxYPoint) {
    let { minX, minY, maxX, maxY } = minMaxAreaLine(aPoints, a2Points, lineLowPoints, linePoints, lineHighPoints, maxXPoint, maxYPoint);

    if (aPoints.length > 0) {
        aPoints.unshift([aPoints[0][0], 0, 0]);
        aPoints.push([aPoints[aPoints.length - 1][0], 0, 0]);
    }

    if (a2Points.length > 0) {
        a2Points.unshift([a2Points[0][0], 0, 0]);
        a2Points.push([a2Points[a2Points.length - 1][0], 0, 0]);
    }

    //subtract minY across
    [aPoints, a2Points, lineLowPoints, linePoints, lineHighPoints].forEach((points) => {
        for (let i = points.length - 1; i >= 0; i--) points[i][1] -= minY;
    });

    //modify minY, maxY
    let zeroAxisAt = height - (-minY * height) / (maxY - minY);
    maxY -= minY;
    minY -= minY;

    //fix scale & reset stroke multipler, fatMarker
    [aPoints, a2Points, lineLowPoints, linePoints, lineHighPoints].forEach((points) => {
        scalePoints(points, maxY, width, maxX, height);
        fixEdgeMarkers(points);
    });

    let afm = width / maxX;
    let lfm = width / maxX;
    return {
        ap: aPoints,
        a2p: a2Points,
        llp: lineLowPoints,
        lp: linePoints,
        lhp: lineHighPoints,
        z: zeroAxisAt,
        afm: afm,
        lfm: lfm,
    };
}

const getSvgAreaLine = (
    areaPoints,
    area2Points,
    lineLowPoints,
    linePoints,
    lineHighPoints,
    smoothing,
    width,
    height,
    segmentHeight,
    topStopColor,
    bottomStopColor,
    idSvg,
    maxXPoint,
    maxYPoint,
    strokeWidthPercent,
    markerColor,
    lineLowColor,
    lineColor,
    lineHighColor,
    areaDataColor,
    area2DataColor
) => {
    if (areaPoints.length === 0 && area2Points.length === 0 && lineLowPoints.length === 0 && linePoints.length === 0 && lineHighPoints.length === 0) return "";

    const { ap, a2p, llp, lp, lhp, z, afm, lfm } = fixAreaLine(areaPoints, area2Points, lineLowPoints, linePoints, lineHighPoints, width, height, maxXPoint, maxYPoint);

    areaPoints = ap;
    area2Points = a2p;
    lineLowPoints = llp;
    linePoints = lp;
    lineHighPoints = lhp;
    let zeroAxis = z;

    const svg = document.createElementNS(gSvgNS, "svg");
    setSvg(svg, width, height, idSvg);

    let axisHeight = height / segmentHeight / 2;
    //top
    addHorzLine(svg, 0, 1000, 2 * axisHeight, 0, bottomStopColor);

    //bottom
    addHorzLine(svg, 0, 1000, 2 * axisHeight, height, bottomStopColor);

    //xAxis
    addHorzLine(svg, 0, 1000, zeroAxis == 0 ? 2 * axisHeight : axisHeight, zeroAxis, bottomStopColor, false);

    //Mid
    addHorzLine(svg, 0, 1000, axisHeight, height / 2, bottomStopColor);

    // //1/4 * 3/4
    if (segmentHeight > 100) {
        addHorzLine(svg, 0, 1000, axisHeight, height / 4, bottomStopColor);
        addHorzLine(svg, 0, 1000, axisHeight, (height * 3) / 4, bottomStopColor);
    }

    addSparkArea(svg, idSvg, areaPoints, smoothing, areaDataColor, areaDataColor, "1");
    addSparkArea(svg, idSvg, area2Points, smoothing, area2DataColor, area2DataColor, "2");

    addSparkLine(svg, idSvg, lineLowPoints, smoothing, lineLowColor, strokeWidthPercent);
    addSparkLine(svg, idSvg, linePoints, smoothing, lineColor, strokeWidthPercent);
    addSparkLine(svg, idSvg, lineHighPoints, smoothing, lineHighColor, strokeWidthPercent);

    //Add highlights highlightedPoints[]
    areaPoints.forEach((point) => {
        if (point[2]) {
            addMarker(svg, idSvg, point[0], point[1], point[2], height, markerColor);
        }
        if (point[3]) {
            point[3].forEach((fatmarker) => {
                addMarker(svg, idSvg, point[0], point[1], 1, height, markerColor, 2 * fatmarker * afm, 0.4);
            });
        }
    });
    area2Points.forEach((point) => {
        if (point[2]) {
            addMarker(svg, idSvg, point[0], point[1], point[2], height, markerColor);
        }
        if (point[3]) {
            point[3].forEach((fatmarker) => {
                addMarker(svg, idSvg, point[0], point[1], 1, height, markerColor, 2 * fatmarker * afm, 0.4);
            });
        }
    });

    [lineLowPoints, linePoints, lineHighPoints].forEach((points) => {
        if (points) {
            points.forEach((point) => {
                if (point[2]) {
                    addMarker(svg, idSvg, point[0], point[1], point[2], height, markerColor);
                }
                if (point[3]) {
                    point[3].forEach((fatmarker) => {
                        addMarker(svg, idSvg, point[0], point[1], 1, height, markerColor, 2 * fatmarker * lfm, 0.4);
                    });
                }
            });
        }
    });
    return svg;
};

function minMaxAreaLine(aPoints, a2Points, lineLowPoints, linePoints, lineHighPoints, maxXPoint, maxYPoint) {
    let minX,
        minY = 0,
        maxY,
        maxX;

    let uninitialized = true;
    [aPoints, a2Points, lineLowPoints, linePoints, lineHighPoints].forEach((points) => {
        if (points && uninitialized && points.length > 0) {
            minX = points[0][0];
            maxX = maxXPoint == "" ? points[0][0] : maxXPoint;
            maxY = maxYPoint == "" ? points[0][1] : maxYPoint;
            uninitialized = false;
        }
    });
    if (uninitialized) return;

    [aPoints, a2Points, lineLowPoints, linePoints, lineHighPoints].forEach((points) => {
        if (points) {
            for (let i = points.length - 1; i >= 0; i--) {
                minX = Math.min(minX, points[i][0]);
                maxX = Math.max(maxX, points[i][0]);
                minY = Math.min(minY, points[i][1]);
                maxY = Math.max(maxY, points[i][1]);
            }
        }
    });

    minY -= 0.1 * Math.abs(minY);
    maxY += 0.1 * Math.abs(maxY);
    return { minX, minY, maxX, maxY };
}

function setSvg(svg, width, height, idSvg) {
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("id", idSvg);
}

function addSparkLine(svg, idSvg, points, smoothing, lineColor, strokeWidthPercent = 1) {
    if (!points) return;
    if (points.length < 0) return;
    const path = document.createElementNS(gSvgNS, "path");
    path.setAttribute("d", getD(points, bezierCommand, smoothing));
    path.setAttribute("id", idSvg + "-line");
    path.setAttribute("fill", "transparent");
    path.setAttribute("stroke", lineColor);
    path.setAttribute("stroke-width", strokeWidthPercent + "%");
    path.setAttribute("stroke-linecap", "round");
    if (false) {
        //to make it dashed
        path.setAttribute("stroke-dasharray", `0, ${2 * strokeWidthPercent}%`);
    }
    svg.appendChild(path);
}

function addSparkArea(svg, idSvg, points, smoothing, topStopColor, bottomStopColor, uniqueAreaID) {
    if (points.length < 0) return;
    const path = document.createElementNS(gSvgNS, "path");
    path.setAttribute("d", getD(points, bezierCommand, smoothing));
    path.setAttribute("id", idSvg + "-area");
    path.setAttribute("fill", "url(#lg" + uniqueAreaID + idSvg + ")");
    svg.appendChild(path);
    svg.appendChild(gdefs("lg" + uniqueAreaID + idSvg, topStopColor, bottomStopColor));
}

function addMarker(svg, idSvg, x, y, widthmultipler, height, strokeColor, strokeWidth = 3.5, strokeOpacity = 0.55) {
    let marker = document.createElementNS(gSvgNS, "line");
    marker.setAttribute("id", idSvg + markerSuffix(x, y));
    marker.setAttribute("x1", x);
    marker.setAttribute("y1", 0);
    marker.setAttribute("x2", x);
    marker.setAttribute("y2", height);
    // marker.setAttribute('stroke-dasharray', `${strokeWidth * 2} ${strokeWidth * 2}`)
    marker.setAttributeNS(null, "style", `stroke: ${strokeColor}; stroke-linecap: round; stroke-opacity: ${strokeOpacity}; stroke-width:${strokeWidth * widthmultipler}px;`);
    svg.appendChild(marker);

    // let circle = document.createElementNS(gSvgNS, 'circle');
    // circle.setAttributeNS(null, 'cx', x);
    // circle.setAttributeNS(null, 'cy', y);
    // circle.setAttributeNS(null, 'r', 25);
    // circle.setAttributeNS(null, 'style', `fill: ${strokeColor}`);

    // svg.appendChild(circle);
}

function addHorzLine(svg, xMin, xMax, widthmultipler, height, strokeColor, dashed = true, strokeWidth = 3.5, strokeOpacity = 0.65) {
    let xLine = document.createElementNS(gSvgNS, "line");
    xLine.setAttribute("x1", xMin);
    xLine.setAttribute("y1", height);
    xLine.setAttribute("x2", xMax);
    xLine.setAttribute("y2", height);
    if (dashed) xLine.setAttribute("stroke-dasharray", `${strokeWidth} ${strokeWidth * 3}`);
    xLine.setAttributeNS(null, "style", `stroke: ${strokeColor}; stroke-opacity: ${strokeOpacity}; stroke-width:${strokeWidth * widthmultipler}px;`);
    svg.appendChild(xLine);
}

function markerSuffix(x, y) {
    return `-marker-x${x.toFixed(3)}-y${y.toFixed(3)}`;
}

function removeMarker(idSvg, x, y) {
    //highlightedPoints[0][0], highlightedPoints[0][1]
    let id2Remove = idSvg + markerSuffix(x, y);
    // console.log("highlightedPoint id2Remove" + id2Remove);
    let element = document.getElementById(id2Remove);
    if (element) {
        let parent = element.parentNode;
        if (parent) parent.removeChild(element);
    }
}

/*
Usage:
const xyPoints = [
  [0, 80],
  [10, 40],
  [20, 60],
  [30, 80],
  [40, 30],
  [50, 45],
  [70, 80],
  [80, 20],
  [90, 20],
  [100, 55],
  [170, 10],
  [200, 20],
  [220, 4],
  [300, 80]
];

//points, resolution
document.getElementById("svgID").appendChild(svg(xyPoints, 1000, 1000));


*/
