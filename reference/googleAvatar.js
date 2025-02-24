const rArc = "M327.26,59.15S280.1,11.6,203,12.54C78.62,14.07,34.87,117.88,34.87,117.88l68.21,33.5S131.74,88.54,203,88.54c0,0,41.06-2.18,74.43,27.42l49.82-57.4";
const yArc = "M34.88,283.68l68.22-33.51s-25.89-44.95,0-98.79l-68.22-33.5S-8.88,193.42,34.88,283.68Z";
const gArc = "M34.88,283.68l68.22-33.51C138.06,316.51,203,313,203,313c58.21,0,87.58-40.87,87.58-40.87l58.57,48.4S300,389,203,389C203,389,91,393.65,34.88,283.68Z";
const bArc = "M392.26,162.79H203V238.7H309.6s-6.8,19.15-19,33.42l58.58,48.4s43.09-47.3,43.09-118.45V162.79Z";

const rGDots = "M203.84,14a36.51,36.51,0,1,1-36.5,36.51A36.52,36.52,0,0,1,203.84,14Z";
const yGDots = "M54.51,163.5A36.5,36.5,0,1,1,18,200,36.51,36.51,0,0,1,54.51,163.5Z";
const gGDots = "M203.84,315.72a36.51,36.51,0,1,1-36.5,36.5A36.51,36.51,0,0,1,203.84,315.72Z";
const bGDots = "M355,164.28a36.51,36.51,0,1,1-36.51,36.51A36.51,36.51,0,0,1,355,164.28Z";

const rLowDots = "M250.21,288.72a36.51,36.51,0,1,1-36.51,36.5A36.5,36.5,0,0,1,250.21,288.72Z";
const yLowDots = "M54.51,288.72A36.51,36.51,0,1,1,18,325.22,36.51,36.51,0,0,1,54.51,288.72Z";
const gLowDots = "M152.36,288.72a36.51,36.51,0,1,1-36.5,36.5A36.5,36.5,0,0,1,152.36,288.72Z";
const bLowDots = "M348.05,288.72a36.51,36.51,0,1,1-36.5,36.5A36.51,36.51,0,0,1,348.05,288.72Z";

//dots
const rHiDots = "M250.21,280.00a36.5,36.5,0,1,1-36.51,36.5A36.5,36.5,0,0,1,250.21,280.00Z";
const yHiDots = "M54.51,280.00A36.5,36.5,0,1,1,18,308.58,36.51,36.51,0,0,1,54.51,280.00Z";
const gHiDots = "M152.36,280.00a36.5,36.5,0,1,1-36.5,36.5A36.5,36.5,0,0,1,152.36,280.00Z";
const bHiDots = "M348.05,280.00a36.5,36.5,0,1,1-36.5,36.5A36.51,36.51,0,0,1,348.05,280.00Z";

const googleSVG = `<svg id="GX" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" class="visemeClass">
        <path id="redG" d="${rArc}" style="fill:#ea4335"/>
        <path id="yellowG" d="${yArc}" style="fill:#fbbc05"/>
        <path id="greenG" d="${gArc}" style="fill:#34a853"/>
        <path id="blueG" d="${bArc}" style="fill:#4285f4"/>
  </svg>`;

function indexFromVismeID(vismeID) {
    let index = 15;
    switch (vismeID) {
        case "VXAt":
            index = 0;
            break;
        case "VXE_e":
            index = 1;
            break;
        case "VXO_o":
            index = 2;
            break;
        case "VXS":
            index = 3;
            break;
        case "VXT":
            index = 4;
            break;
        case "VX_a":
            index = 5;
            break;
        case "VXE_e":
            index = 6;
            break;
        case "VX_f":
            index = 7;
            break;
        case "VX_i":
            index = 8;
            break;
        case "VX_k":
            index = 9;
            break;
        case "VXO_o":
            index = 10;
            break;
        case "VX_p":
            index = 11;
            break;
        case "VX_r":
            index = 12;
            break;
        case "VX_s":
            index = 13;
            break;
        case "VX_t":
            index = 14;
            break;
        case "VX_u":
            index = 15;
            break;
        default:
        case "VXSilence":
            index = 15;
            break;
    }
    return index;
}

const googleAnimate = (tl, idVGender, vismeID, s, duration) => {
    if (idVGender !== "#GX") return;

    let index = indexFromVismeID(vismeID);

    let binStr = Math.abs(index).toString(2).padStart(4, "0");

    let r = binStr[0] === "0" ? rLowDots : rHiDots;
    let y = binStr[1] === "0" ? yLowDots : yHiDots;
    let g = binStr[2] === "0" ? gLowDots : gHiDots;
    let b = binStr[3] === "0" ? bLowDots : bHiDots;

    if (vismeID === "VXPauseGoogle") {
        r = rGDots;
        y = yGDots;
        g = gGDots;
        b = bGDots;
    } else if (vismeID === "VXPauseGoogle2") {
        r = rArc;
        y = yArc;
        g = gArc;
        b = bArc;
    }

    tl.to("#redG", { morphSVG: r, duration: duration, ease: "back.inOut(1.2)" }, s)
        .to("#yellowG", { morphSVG: y, duration: duration, ease: "back.inOut(1.2)" }, s)
        .to("#greenG", { morphSVG: g, duration: duration, ease: "back.inOut(1.2)" }, s)
        .to("#blueG", { morphSVG: b, duration: duration, ease: "back.inOut(1.2)" }, s);
};
