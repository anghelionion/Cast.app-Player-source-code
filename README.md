# Cast Player

## Demos

- [Localhost](http://localhost:5001/play/demo/demo)
  - To run locally, use `npm start`.
  - To run locally against the production CDN/API, use `npm run start:prod`.
  - If you have issues, try `npm install` first.
- [Pydcast](https://demo.pydcast.com)
- [Cast.app](https://demo.cast.app)

## Deployments

We use GitHub Actions for deployments.

- Pydcast
  - Pushes to `main` that change service code will automatically push a new deployment to Pydcast.
  - You can manually trigger a deployment to Pydcast in Actions, either to pydcast.com or to a non-live URL that can be found in GCP.
- Production
  - See [Releases](https://github.com/cast-corp/designer/wiki/Releases)
  - You can also manually trigger a production deployment in Actions, either to cast.app or to a non-live URL that can be found in GCP.
  - Manually triggered production deployments can only be run against release tags.

## Every Chart supports IMAGES and BLUR IMAGES

- imageTextColor = light (default is best for dark images) | dark | auto | color (e.g. #acacac)
  - currently on landing and narrations on options
  - to do others
- bgImg: This file must be on google storage with 1) public access and 2) cache set correctly
- bgImgMode: contain or cover; default is cover, but good idea to specify
- bgBlurImgForContain: This file must be on google storage with 1) public access and 2) cache set correctly
  - OPTIONAL
  - do not specify for cover, for performance
  - IF file is missing in Google Storage, expect a 403
- bgImgPosition:
  - top (default) / center / bottom
  - This identifies the position of image in play area applies to cover and contain
- mode:
  - editorial - image with text - NO segments - (narration is moved up?)
  - panel-editorial = black reusable metric - 1 Segment reused - (narration in middle?) (LEGACY landing_v2)
  - or nothing = this is where the viseme should be blured as text is on the viseme. THIS IS BACKWARDS COMPATIBILITY. AVOID.

## Landing Chart

### Chart level

- title

  - Note this is at higher level directly under chartID
  - e.g.: <Some Title String> / reservedReportName / reservedEmpty
  - title can be reservedEmpty, implying title will not be shown
  - title can be and reservedReportName, implying Report Name will be used

### Chart Type level

- panelOpacity: 0, .1, .2, .4, .5, .6, ..., 1 (default .1)

## notes

- effect: blurred background and see-thru image or logo on top of blurred, editorial
<pre>
      "landland": {
        "landing": {
          "bgBlurImgForContain": "blurred_andy-sieg.jpg",
          "bgImg": "WellsCard.png",
          "bgImgMode": "contain",
          "mode": "editorial",
          "bgImgPosition": "center",
          "segments": [
          ],
</pre>
- effect: blurred background, editorial
<pre>
      "landland": {
        "landing": {
          "bgBlurImgForContain": "blurred_andy-sieg.jpg",
          "XXXbgImg": "WellsCard.png",
          "bgImgMode": "contain",
          "mode": "editorial",
          "bgImgPosition": "center",
          "segments": [
          ],
</pre>
- effect: proper unblurred image don't mind being cutt off (e.g. NY background)
<pre>
      "landland": {
        "landing": {
          "xxxbgBlurImgForContain": "blurred_andy-sieg.jpg",
          "bgImg": "NY-night.jpg",
          "bgImgMode": "cover",
          "mode": "editorial",
          "bgImgPosition": "center",
          "segments": [],
</pre>
- effect contained see thru image (E.G. CARD)
<PRE>
        "landing": {
          "XXbgBlurImgForContain": "blurred_andy-sieg.jpg",
          "bgImg": "WellsCard.png",
          "bgImgMode": "contain",
          "mode": "editorial",
          "bgImgPosition": "center",
          "segments": [],
</PRE>

## Path / Process / StackedBar / Sales pipeline

### ChartType Level

- style: process ( default) / stackedbar / pipeline
- autoHideUnnamedNodesAtOffsetZero: true / false
- colorOverride: true/false
- swapTicks

## Heatmap

### Chart Type level

- showNodeLabel: true/false
- grid: true/false
- gradientTheme: anthony (default), red2green, greens, reds, green2red

## PunchCard

- showNodeLabel: true/false
- grid: true/false
- gradientTheme: anthony (default), red2green, greens, reds, green2red

## Area / Line

- smoothing is supported at segment level. default is 0.03. 0 means no smoothing. value should be between 0 and 0.05
<pre>
      "line-a4yYs9wfhTVHK3286tweGg": {
      "line": {
        "segments": [
          {
            "smoothing": "0"
          }
      }
</pre>
- line and area colors are supported at segment level
  <pre>
        "line-a4yYs9wfhTVHK3286tweGg": {
        "line": {
          "segments": [
            {
              "title": "Trend + Level by Quarter",
              "footer": "subtotle",
              "left": "Sep-19",
              "lineColor": "yellow",
              "lineHighColor": "green",
              "lineLowColor": "red",
              "lineHighData": [...]
            }
        }
  </pre>
  <pre>
       colors: 
       blue, yellow, green, red, pink 
       will be made "better"
  </pre>
- maxYPoint: int
- maxXPoint
- support for yHighlighter
- Support for xHighlighter
- suffix, prefix
<pre>
  {
    "highlight": [
      0, 1
    ],
    "highlightData": {
      "0": {
        "xHighlighter": "20",
        "xHighlighterLabel": "vertical X val highlighter"",
        "yHighlighter": "450",
        "yHighlighterLabel": "horz Y val highlighter"
      },
      "1": {
      "xHighlighter": "20",
      "xHighlighterLabel": "vertical X val highlighter"",
      "yHighlighter": "450",
      "yHighlighterLabel": "horz Y val highlighter"
      }
    },
</pre>

## Compare Bars

- "compareColor": "red" global color for comparabar (background)

## PieBar / Categorizations

- "hidePercentages": true,
<pre>
      "piebar-vwblJzWFSNCC0bPHMfM-lw": {
        "type": "pieBar",
        "title": "Mission District's sales",
        "pieBar": {
          "hidePercentages": true,
          "segments": []
</pre>

## Waterfall

- markerRange - **waterfall.waterfall.steps[].markerRange** can be a value or array of to values.
  - [4000] means **fat marker** from 0 to 4000 (avoid, short form for [0, 4000]
  - 4000 means **skinny marker** at 4000 (USE highlighting a single line, e.g. starting value)
  - [2000, 3000] means **fat marker** from 2000, 3000 (Use for most scenarios)
  - do not specify markerRange to hide the markers
- subtitles

  - you can provide subtitles for first and last to replace "Starting" and "Ending"
  <pre>

  "waterfall": {
  "type": "waterfall",
  "title": "waterfall title",
  "waterfall": {
  "prefix": "$",
  "suffix": "K",
  "segments": [
  {
  "title": "July 1, 2020 - FIRST",
  "value": "4000",
  "subtitle": "Starting"
  },
  ...
  {
  "title": "July 31, 2020 - LAST",
  "value": "auto",
  "subtitle": "Ending"
  }
  ],
  </pre>

## Next Steps (was Poll)

added support for \_imageTextColor
buttonColorMode DEPRECATED
chart Level Str Val "buttonColorMode" = "" use the standard green color - default
chart Level Str Val "buttonColorMode" = "christmasTree" use different colors for each button. Colors may be overridden by the companyColors xxx DEPRECATED
chart Level Str Val "buttonColorMode" = "firstColorIndex" use the first color. may be overridden from designer using companyColors

## Checklist

<pre>
        "type": "checklist",
        "title": "My Checklist",
        "checklist": {
          "checkMarkMode": "number" | default (checkmark),
          ...

          at segment level, "checkMarkOverride" :  "x" will create a proper "X"
</pre>

## GSAP Links

- https://greensock.com/cheatsheet/
- https://greensock.com/blog/learning/mistakes/
- https://greensock.com/docs/v2/Plugins/MorphSVGPlugin
- https://codepen.io/chrisgannon/pen/QjKNeZ?editors=0010
- https://dev.to/imtraptir/in-illustrator-remove-transformations-from-svg-while-exporting-5050
- https://codepen.io/GreenSock/pen/56c8c53321d68056bd8b74d71c6b4335 (interactive line chrt with fancy marker)

## CSS

- https://www.youtube.com/watch?v=831ffK69388 (fancy css arrow with rotate)
- https://codepen.io/electerious/pen/jQOYbp
- https://www.filamentgroup.com/lab/select-css.html SELECT
- https://developer.mozilla.org/en-US/docs/Learn/Forms/Advanced_form_styling SELECT

## Viseme

- https://docs.aws.amazon.com/polly/latest/dg/ph-table-english-us.html
- https://developer.oculus.com/documentation/unity/audio-ovrlipsync-viseme-reference/
- http://www.annosoft.com/docs/Visemes17.html
- https://lesterbanks.com/2017/06/transfer-animated-visemes-ch-effects/
- https://wolfpaulus.com/lipsynchronization/
- https://developer.oculus.com/documentation/unity/audio-ovrlipsync-viseme-reference/?locale=en_US
- http://www.visagetechnologies.com/uploads/2012/08/MPEG-4FBAOverview.pdf

## Expression name

- Joy - The eyebrows are relaxed. The mouth is open and the mouth corners pulled back toward the ears.
- Sadness - The inner eyebrows are bent upward. The eyes are slightly closed. The mouth is relaxed.
- Anger - The inner eyebrows are pulled downward and together. The eyes are wide open. The lips are pressed against each other or opened to expose the teeth.
- Fear - The eyebrows are raised and pulled together. The inner eyebrows are bent upward. The eyes are tense and alert.
- Disgust - The eyebrows and eyelids are relaxed. The upper lip is raised and curled, often asymmetrically.
- surprise - The eyebrows are raised. The upper eyelids are wide open, the lower relaxed. The jaw is opened.

## Polly

- branded voices: https://aws.amazon.com/polly/features/#Brand_Voice (e.g. [Australian Bank](https://d1.awsstatic.com/product-marketing/Polly/voices/NAB_Speech%20Sample.e873739d92ef808f4a7940b4745b5919c9f0a67a.mp3))

## GPT-3

- https://twitter.com/sharifshameem/status/1282676454690451457?s=21
-

## javascript

- How to check for null AND undeclared: https://stackoverflow.com/a/5515349/1705353

## Music

- https://www.sessions.blue/
- https://rachelcorbett.com.au/podschool-podcast-use-music-podcast/ Use in tro only

## References

https://stackoverflow.com/questions/13266746/scroll-jump-to-id-without-jquery
https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView

### POLYFILL

https://stackoverflow.com/questions/42503599/how-to-make-javascript-scrollintoview-smooth
https://github.com/iamdustan/smoothscroll  
https://codepen.io/diyifang/embed/MmQyoQ?height=265&theme-id=0&default-tab=js,result&embed-version=2

### References from the End of `cast.app.js`

https://blog.jeremylikness.com/blog/2019-04-17_convert-modern-javascript-to-legacy-ecmascript-5-in-minutes/
https://medium.com/recraftrelic/es5-vs-es6-with-example-code-9901fa0136fc

## Archived Codes

```javascript
const b1 =
  "linear-gradient(217deg, rgba(128, 0, 128,.9), rgba(128, 0, 128,0.3) 70.71%),  linear-gradient(127deg, rgba(255,165,0,.9), rgba(255,165,0,0.9) 70.71%), linear-gradient(336deg, rgba(0,191,255,.9), rgba(0,191,255,0) 70.71%)";

const b2 =
  "linear-gradient(17deg, rgba(128, 0, 128,.7), rgba(128, 0, 128,0.3) 70.71%), linear-gradient(200deg, rgba(255,165,0, .9), rgba(255,165,0,.2) 70.71%),  linear-gradient(336deg, rgba(0,191,255,.8), rgba(0,191,255,0.1) 70.71%)";
```

## Creating A New Migration

1. Pydcast:
   `GOOGLE_APPLICATION_CREDENTIALS=pydcast-service_account.json ./cloud_sql_proxy -instances="pydcast:us-west2:pydcast-apps"=tcp:3306` OR `GOOGLE_APPLICATION_CREDENTIALS=pydcast-service_account.json ./cloud_sql_proxy-instances="pydcast:us-west2:cast-designer-pydcast"=tcp:3307`

   ```zsh
   source db_manager-staging.sh
   ```

   OR
   Cast:
   `GOOGLE_APPLICATION_CREDENTIALS=service_account.json ./cloud_sql_proxy -instances="cast-corp:us-west2:cast-app"=tcp:3306` OR `GOOGLE_APPLICATION_CREDENTIALS=service_account.json ./cloud_sql_proxy -instances="cast-corp:us-west2:designer"=tcp:3307`

   ```zsh
   source db_manager.sh
   ```

2. ```zsh
   flask db init -d tmp
   flask db migrate -d tmp -m "t sRecurring Cast to Chart one to many"
   flask db upgrade -d tmp
   flask db show -d tmp
   ```

## Fix IAM permissions for cloud queues

```zsh
gcloud tasks queues add-iam-policy-binding events --location=us-west2 --member=allUsers --role='roles/owner'
```

## Update Permissions of a File in GCP

```zsh
gsutil acl ch -u allUsers:READER gs://cast-corp/resources/Holly-BankofAmerica.mp4
```

## CORS Settings for Gcloud Buckets

### To Get CORS Settings

Pydcast

```zsh
gcloud config set project pydcast
gsutil cors get gs://pydcast
```

Cast

```zsh
gcloud config set project cast-corp
gsutil cors get gs://cast-corp
```

### To Set Them

Pydcast

```zsh
gcloud config set project pydcast
gsutil cors set gcloud-bucket-cors.json gs://pydcast
```

Cast

```zsh
gcloud config set project cast-corp
gsutil cors set gcloud-bucket-cors.json gs://cast-corp
```
