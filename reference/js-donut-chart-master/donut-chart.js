"use strict";

function polarToXYCord(a, r) {
    return {
        x: Math.cos(a * 2 * Math.PI) * r,
        y: -Math.sin(a * 2 * Math.PI) * r,
    };
}

function arcPath(cx, cy, r, start, offset) {
    let end = polarToXYCord(start + offset, r);
    start = polarToXYCord(start, r);
    return ["M", cx + start.x, cy + start.y, "A", r, r, 0, +(offset > 0.5), 0, cx + end.x, cy + end.y].join(" ");
}

function doughnutSegment(out, c, r, prev, cur, i, stroke) {
    out.push([
        "path",
        {
            d: arcPath(c, c, r, prev, cur),
            class: "chart-item-" + i,
            fill: "transparent",
            "stroke-width": stroke,
        },
    ]);
}

function doughnut(chart) {
    let prev = 0,
        out = [];
    // FIXME get radius and stroke-width from CSS
    let c = chart.r,
        r = chart.r - chart.stroke / 2;

    for (let i in chart.items) {
        doughnutSegment(out, c, r, prev, chart.items[i], i, chart.stroke);
        prev += chart.items[i];
    }
    if (prev < 1) doughnutSegment(out, c, r, prev, 1 - prev, "bg", chart.backgroundStroke);

    return out;
}

function svgTree(elem) {
    let root = document.createElementNS("http://www.w3.org/2000/svg", elem[0]);
    let attr = elem[1];
    // Set attributes
    for (let i in attr) {
        let a = document.createAttribute(i);
        a.value = attr[i];
        root.setAttributeNode(a);
    }
    // Create children nodes
    if (elem.length > 2) {
        let children = elem[2];
        for (let i in children) {
            let c = svgTree(children[i]);
            root.appendChild(c);
        }
    }
    return root;
}

function getDoughnut(doughnutData) {
    /* Transformation matrix (rotate and mirror) to correct orientation:
     * \[
     *   \left[
     *   \begin{array}{ccc}
     *      0 & -1 & 0 \\
     *     -1 &  0 & 0 \\
     *      0 &  0 & 1
     *   \end{array}
     *   \right]
     * \]
     */
    return svgTree([
        "svg",
        {
            transform: "matrix(0 -1 -1 0 0 0)",
            class: "chart-donut",
            width: doughnutData.r * 2,
            height: doughnutData.r * 2,
            // "stroke-linecap": "round",
            // "stroke-linejoin": "arcs"
        },
        doughnut(doughnutData),
    ]);
}

let code = getDoughnut({
    r: 100,
    stroke: 10,
    backgroundStroke: 2,
    items: [0.2, 0.1, 0.2, 0.3],
});

document.getElementById("mychart1").appendChild(code);
