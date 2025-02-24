


DO NOT COMPLILE
for reference only

"use stri ct";

const rectBorderRadius = 6;
const borderTopLeftRadius = rectBorderRadius;
const borderBottomLeftRadius = rectBorderRadius;
const borderTopRightRadius = rectBorderRadius;
const borderBottomRightRadius = rectBorderRadius;

function removeHashPrefix(id) {
  if (id.charAt(0) === "#")
    id = id.substring(1, str.length);
  return id;
}

function addHashPrefix(id) {
  if (id.charAt(0) !== "#")
    return "#" + id
  return id;
}

function createDiv(id, innerHTMLText = "") {
  var playBoxElement = document.createElement("div");
  playBoxElement.id = id;
  playBoxElement.innerHTML = innerHTMLText;
  document.getElementsByTagName("body")[0].appendChild(playBoxElement);
  return playBoxElement;
}

var uuidv4 = function () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}


function createBasicShape(id, backgroundColor, style) {
  id = removeHashPrefix(id);

  createDomStyleObject(id,
    "border-radius: " + rectBorderRadius + "px; position:absolute; background-color:" + backgroundColor + ";",
    style);

  return createDiv(id);
}


function fnProgressText(text) {
  if (text === "undefined")
    text = "";
  return "<span id=prefix>" + text + "</span><span id=value></span><span id=suffix></span>";
}

function createProgressText(id, foreColor, pxFontSize, style) {
  id = removeHashPrefix(id);

  createDomStyleObject(id,

    "position: absolute; color: " + foreColor + "; font-family:'Arial'; font-size:" + pxFontSize + "px;",
    style);

  return createDiv(id, fnProgressText());
}

function tweenProgress(id, prefix, suffix, from, to, seconds) {
  id = addHashPrefix(id);

  var stepsPerSecond = 20,
    steps = stepsPerSecond * seconds,
    incr = (Math.abs(to - from)) / steps,
    duration = seconds / steps;

  var timeline = new TimelineMax({});

  timeline.add([
    TweenMax.set(id + " #prefix", { text: String(prefix) }),
    TweenMax.set(id + " #suffix", { text: String(suffix) }),
    TweenMax.set(id + " #value", { text: String(from) })
  ]);

  for (var i = from; (from < to) ? i <= to : i >= to; (from < to) ? i += incr : i -= incr) {
    timeline.add(TweenMax.to(id + " #value", duration, {
      text: String(Math.round(i)),
      ease: Power2.easeInOut
    }));
  }
  return timeline;
}

function commonCallbackFunction(functionType, obj) {
  console.log(functionType);
}

function funnelAnimation() { // FUNNEL 
  var xOffset = 100,
    yOffset = 100;
  var funnelWidth = 400;
  var funnelSegmentHeight = 10;
  var funnelSegmentSeparator = 40;
  var segment = [110, 90, 80, 70, 40, 20, 14, 5];
  var applyRestriction = true;
  var restrictionApplied = false;
  var indexToExpand = 4;

  var funnelTimeline = new TimelineMax({});


  funnelTimeline.add("syncPoint-funnel-start");

  //Fix bad data
  if (applyRestriction) {
    for (var index = 0; index < segment.length; index++) {
      if (index == 0) {
        continue;
      }
      if (segment[index] > segment[index - 1]) {
        segment[index] = segment[index - 1];
        restrictionApplied = true;
      }
    }
  }

  var style = domStyle();


  for (var index = 0; index < segment.length; index++) {
    createBasicShape("funnelSegment" + index, colorIndex(theme, index), style);
    var tmInitFunnel = TweenMax.set("#funnelSegment" + index, {
      x: xOffset + (funnelWidth - funnelWidth * segment[index] / segment[0]) / 2,
      y: yOffset,
      autoAlpha: 0,
      ease: Power2.easeInOut,
      width: funnelWidth * segment[index] / segment[0],
      height: funnelSegmentHeight,
      zIndex: index
    });
  }
  funnelTimeline.add([tmInitFunnel, "set-Funnel"]);

  var tlFunnelAppear = new TimelineMax({});
  for (var index = 0; index < segment.length; index++) {
    tlFunnelAppear.add(
      TweenMax.to("#funnelSegment" + index, animDur(), {
        autoAlpha: 1,
        ease: Power2.easeInOut,
        width: funnelWidth * segment[index] / segment[0],
        height: funnelSegmentHeight
      }),
      0);
  }
  funnelTimeline.add(tlFunnelAppear);

  var tlFunnelOpen = new TimelineMax({});
  for (var index = 0; index < segment.length; index++) {
    tlFunnelOpen.add(
      TweenMax.to("#funnelSegment" + index, animDur(), {
        x: xOffset + (funnelWidth - funnelWidth * segment[index] / segment[0]) / 2,
        y: yOffset + index * funnelSegmentSeparator,
        ease: Power2.easeInOut,
        width: funnelWidth * segment[index] / segment[0],
        height: funnelSegmentHeight
      }),
      0);
  }
  funnelTimeline.add(tlFunnelOpen, "+=1");


  var tlFunnelExpand = new TimelineMax({});
  for (var index = indexToExpand; index < segment.length; index++) {
    tlFunnelExpand.add(
      TweenMax.to("#funnelSegment" + index, 2, {
        x: xOffset + (funnelWidth - funnelWidth * segment[index] / segment[0]) / 2,
        y: 50 + yOffset + index * funnelSegmentSeparator,
        ease: Power2.easeInOut,
        width: funnelWidth * segment[index] / segment[0],
        height: funnelSegmentHeight
      }),
      0);
  }
  funnelTimeline.add(tlFunnelExpand, "+=1");


  var tlFunnelContract = new TimelineMax({});
  for (var index = indexToExpand; index < segment.length; index++) {
    tlFunnelContract.add(
      TweenMax.to("#funnelSegment" + index, animDur(), {
        x: xOffset + (funnelWidth - funnelWidth * segment[index] / segment[0]) / 2,
        y: yOffset + index * funnelSegmentSeparator,
        ease: Power2.easeInOut,
        width: funnelWidth * segment[index] / segment[0],
        height: funnelSegmentHeight
      }),
      0);
  }
  funnelTimeline.add(tlFunnelContract, "+=1");

  var tlFunnelClose = new TimelineMax({});
  for (var index = 0; index < segment.length; index++) {
    tlFunnelClose.add(
      TweenMax.to("#funnelSegment" + index, animDur(), {
        x: xOffset + (funnelWidth - funnelWidth * segment[index] / segment[0]) / 2,
        y: yOffset,
        ease: Power2.easeInOut,
        width: funnelWidth * segment[index] / segment[0],
        height: funnelSegmentHeight
      }),
      0); ///???
  }
  funnelTimeline.add(tlFunnelClose, "+=1");

  var tlFunnelSunset = new TimelineMax({});
  for (var index = 0; index < segment.length; index++) {
    tlFunnelSunset.add(
      TweenMax.to("#funnelSegment" + index, animDur(), {
        x: xOffset + (funnelWidth - funnelWidth * segment[index] / segment[0]) / 2,
        y: 0 - funnelSegmentHeight,
        autoAlpha: 0,
        ease: Power2.easeInOut,
        width: funnelWidth * segment[index] / segment[0],
        height: funnelSegmentHeight
      }),
      0); ///???
  }
  funnelTimeline.add(tlFunnelSunset, "+=1");

  funnelTimeline.add("syncPoint-funnel-end");

  return funnelTimeline;
}


function progressBarAnimation() { //PROGRESSBAR
  var xOffset = 100;
  var yOffset = 100;
  var width = 400;
  var pauseAtPercent = [10, 80, 100, 60];
  var height = 24;
  var barMargin = 2;
  var barHeight = height - barMargin - barMargin;
  var barWidth = width - barMargin - barMargin;
  var fontSize = 16;
  var labelMargin = 6;

  var progressBarTimeline = new TimelineMax({});

  progressBarTimeline.add("syncPoint-progressBar-start");

  var progressBackground = createBasicShape("progressBackground1", colorIndex(theme, "controlBackground"));
  var progressText = createProgressText("progressText1", colorIndex(theme, "textColor"), fontSize);
  var progressBar = createBasicShape("progressBar1", colorIndex(theme, 0));


  var tmbackground = TweenMax.set(
    progressBackground, {
    x: xOffset, y: yOffset, ease: Power2.easeInOut, zIndex: "1", height: height, width: width
  });

  var tmText = TweenMax.set(
    progressText, {
    text: fnProgressText("start"),
    // x: xOffset + width + labelMargin, y: yOffset + height/2 - fontSize/2, //right
    x: xOffset, y: yOffset + height + labelMargin, textAlign: "center",
    ease: Power2.easeInOut, zIndex: "1", height: height, width: width
  });

  var tmBar = TweenMax.set(
    progressBar, {
    x: xOffset + barMargin, y: yOffset + barMargin, ease: Power2.easeInOut, zIndex: "2",
    height: barHeight, width: 0
  });

  progressBarTimeline.add([tmBar, tmText, tmbackground, "syncPoint-story-start"]);

  //progressText.innerHTML = "WBR2";

  //TweenLite.to(progressText, 2, {text:"This is the new text", ease:Linear.easeNone});

  var tlProgress = new TimelineMax({});
  for (var index = 0; index < pauseAtPercent.length; index++) {

    var tweenText = tweenProgress("#progressText1", "Weekly Burn Rate: ", "%", (index == 0) ? 0 : pauseAtPercent[index - 1], pauseAtPercent[index], 1);
    var tweenBar = TweenMax.to(progressBar, animDur(), {
      ease: Power2.easeInOut, zIndex: "3",
      height: barHeight, width: pauseAtPercent[index] * barWidth / 100
    });
    tlProgress.add([tweenBar, tweenText], "+=2");
  }
  progressBarTimeline.add(tlProgress);

  //sunset
  var sunsetProgress = new TweenMax.to([progressBackground, progressBar, progressText],
    animDur(), { y: -1 * (yOffset + height), autoAlpha: 0 });

  progressBarTimeline.add(sunsetProgress, "+=2");

  return progressBarTimeline;
}
//auto alpha > opacity //sunset









  // GSDevTools.create({paused:true, id:"Story"});


      // onUpdate:commonCallbackFunction, onUpdateParams:["onUpdate", self],
      // onStart:commonCallbackFunction, onStartParams:["onStart", self],
      // onComplete:commonCallbackFunction, onCompleteParams:["onComplete", self],
      // onReverseComplete:commonCallbackFunction, onReverseCompleteParams:["onReverseComplete", self]








      // https://medium.com/codingthesmartway-com-blog/create-a-rest-api-with-json-server-36da8680136d
