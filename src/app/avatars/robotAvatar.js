const robotColors = {
    neck: "fill:#a9a5a1",
    shadows: "fill:#c9c5c1",
    glasses: "fill:#c9c5c1",
    eye: "fill:#595551",
    headphones: "fill:" + castColor(0),
    body: "fill:#e9e5e1",
};

{
    /* big ears <path d="M61 74.3884C61 52.439 78.7935 34.6455 100.743 34.6455H149.257C171.206 34.6455 189 52.439 189 74.3884C189 96.3378 171.206 114.131 149.257 114.131H100.743C78.7935 114.131 61 96.3378 61 74.3884Z" fill="#4D00BD"/> */
}

const robotSVG = `<svg id="robotX" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250" class="visemeClass" >


    <g class="shown" data-g="base" >
      <path d="M69.9902 73.4734C69.9902 45.9026 92.3408 23.552 119.912 23.552H129.069C156.64 23.552 178.99 45.9026 178.99 73.4734C178.99 101.044 156.64 123.395 129.069 123.395H119.912C92.3408 123.395 69.9902 101.044 69.9902 73.4734Z" style="${robotColors.headphones}"/>
      <path d="M158 115.5H93V229.5H158V115.5Z" style="${robotColors.neck}"/>
      <path d="M53.199 185.5C53.199 162.304 72.003 143.5 95.199 143.5H153.782C176.977 143.5 195.782 162.304 195.782 185.5V249.5H53.199V185.5Z" style="${robotColors.shadows}"/>
      <path d="M60.9805 196.5C60.9805 167.229 84.7094 143.5 113.98 143.5H136C165.271 143.5 189 167.229 189 196.5V249.5H60.9805V196.5Z" style="${robotColors.body}"/>
      <path d="M170.5 66.5H79.5C69.2827 66.5 61 74.7827 61 85C61 95.2173 69.2827 103.5 79.5 103.5H170.5C180.717 103.5 189 95.2173 189 85C189 74.7827 180.717 66.5 170.5 66.5Z" style="${robotColors.headphones}"/>
      <path d="M124.5 138C154.6 138 179 113.6 179 83.5C179 53.4005 154.6 29 124.5 29C94.4005 29 70 53.4005 70 83.5C70 113.6 94.4005 138 124.5 138Z" style="${robotColors.body}"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M162 122.698C152.46 128.959 141.076 132.597 128.85 132.597C100.659 132.597 76.9414 113.257 70 87C71.4944 115.75 95.054 138.597 123.898 138.597C138.77 138.597 152.238 132.523 162 122.698Z" style="${robotColors.shadows}" />
      <path fill-rule="evenodd" clip-rule="evenodd" d="M81.1774 85C81.1478 85.2129 81.1328 85.4269 81.1328 85.6421C81.1328 93.4526 100.832 99.7843 125.133 99.7843C149.433 99.7843 169.133 93.4526 169.133 85.6421C169.133 85.4269 169.118 85.2129 169.088 85H169.133V67H169.119C169.128 66.8811 169.133 66.7618 169.133 66.6421C169.133 58.8316 149.433 52.5 125.133 52.5C100.832 52.5 81.1328 58.8316 81.1328 66.6421C81.1328 66.7618 81.1374 66.8811 81.1466 67H81.1328V85H81.1774Z" style="${robotColors.glasses}"/>
    </g>

    <g>
      <g id="VXSilence" class="shown" data-g="VXs">
        <path id="idVrobotLips" fill-rule="evenodd" clip-rule="evenodd" d="M108 112C113.956 114.667 136.011 114.667 142 112C132.305 112.94 117.926 112.752 108 112Z" fill="#484851" stroke="#484851" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>

      <g id="VXAt">
        <path id="idVrobotLips" fill-rule="evenodd" clip-rule="evenodd" d="M107.99 111.5C113.997 118.59 136.237 118.59 142.276 111.5C130.293 111.5 123.793 111.5 107.99 111.5Z" fill="#484851" stroke="#484851" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>

      <g id="VX_a">
        <path id="idVrobotLips" fill-rule="evenodd" clip-rule="evenodd" d="M108 112C113.956 126.667 136.011 126.667 142 112C130.117 112 123.671 112 108 112Z" fill="#484851" stroke="#484851" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>

      <g id="VXE_e">
        <path id="idVrobotLips" fill-rule="evenodd" clip-rule="evenodd" d="M108 112C113.956 121.333 136.011 121.333 142 112C132.305 115.291 117.926 114.633 108 112Z" fill="#484851" stroke="#484851" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>

      <g id="VX_f">
        <path id="idVrobotLips" fill-rule="evenodd" clip-rule="evenodd" d="M107.99 111.5C113.997 118.59 136.237 118.59 142.276 111.5C131.5 116.318 118 110 107.99 111.5Z" fill="#484851" stroke="#484851" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>

      <g id="VX_k">
        <path id="idVrobotLips" fill-rule="evenodd" clip-rule="evenodd" d="M108 110C113.956 124.667 136.011 124.667 142 110C129.5 113.5 123.5 113 108 110Z" fill="#484851" stroke="#484851" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>


      <g id="VXO_o">
        <path id="idVrobotLips" fill-rule="evenodd" clip-rule="evenodd" d="M108 112C113.956 126.667 136.011 126.667 142 112C129 108.5 121 115 108 112Z" fill="#484851" stroke="#484851" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>


      <g id="VX_p">
        <path id="idVrobotLips" fill-rule="evenodd" clip-rule="evenodd" d="M108 111C113.956 115 136.011 115 142 111C132.305 112.411 117.926 112.128 108 111Z" fill="#484851" stroke="#484851" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>


      <g id="VXS">
        <path id="idVrobotLips" fill-rule="evenodd" clip-rule="evenodd" d="M108 110C110 125 142 124 142 110C129.5 113.5 123.5 113 108 110Z" fill="#484851" stroke="#484851" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>

      <g id="VX_r">
        <path id="idVrobotLips" fill-rule="evenodd" clip-rule="evenodd" d="M107.99 111.5C113.997 118.59 136.237 118.59 142.276 111.5C132 109.5 114.5 109.5 107.99 111.5Z" fill="#484851" stroke="#484851" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>


      <g id="VX_i">
        <path id="idVrobotLips" fill-rule="evenodd" clip-rule="evenodd" d="M108 112C114.5 126 136 126 142 112C129.5 114 122.5 114 108 112Z" fill="#484851" stroke="#484851" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>


      <g id="VXT">
        <path id="idVrobotLips" fill-rule="evenodd" clip-rule="evenodd" d="M108 110C113.956 126 131.5 122 142 110C129.5 113.818 122.5 113.5 108 110Z" fill="#484851" stroke="#484851" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>


      <g id="VX_u">
        <path id="idVrobotLips" fill-rule="evenodd" clip-rule="evenodd" d="M111 112C115.905 121.333 134.068 121.333 139 112C131.016 115.291 119.175 114.633 111 112Z" fill="#484851" stroke="#484851" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>


      <g id="VX_t">
        <path id="idVrobotLips" fill-rule="evenodd" clip-rule="evenodd" d="M111 112C115.905 121.333 134.068 121.333 139 112C131.016 115.291 119.175 114.633 111 112Z" fill="#484851" stroke="#484851" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>  
      </g>


      <g id="VX_s">
        <path id="idVrobotLips" fill-rule="evenodd" clip-rule="evenodd" d="M108 110C110 125 142 124 142 110C129.5 113.5 123.5 113 108 110Z" fill="#484851" stroke="#484851" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>

    </g>


    <g class="shown" id=EOX data-g="EOX">
        <path id="idVLXeyepurple" d="M105.49 88.3161C112.213 88.3161 117.664 82.8656 117.664 76.1422C117.664 69.4187 112.213 63.9683 105.49 63.9683C98.7664 63.9683 93.3159 69.4187 93.3159 76.1422C93.3159 82.8656 98.7664 88.3161 105.49 88.3161Z" style="${robotColors.eye}"/>
        <path id="idVRXeyepurple" d="M144.633 88.3161C151.356 88.3161 156.807 82.8656 156.807 76.1422C156.807 69.4187 151.356 63.9683 144.633 63.9683C137.909 63.9683 132.459 69.4187 132.459 76.1422C132.459 82.8656 137.909 88.3161 144.633 88.3161Z" style="${robotColors.eye}"/>
        <path id="idVLXeyesparkle" d="M109.459 71.8159C110.564 71.8159 111.459 70.9205 111.459 69.8159C111.459 68.7113 110.564 67.8159 109.459 67.8159C108.354 67.8159 107.459 68.7113 107.459 69.8159C107.459 70.9205 108.354 71.8159 109.459 71.8159Z" fill="white"/>
        <path id="idVRXeyesparkle" d="M149.217 71.8159C150.321 71.8159 151.217 70.9205 151.217 69.8159C151.217 68.7113 150.321 67.8159 149.217 67.8159C148.112 67.8159 147.217 68.7113 147.217 69.8159C147.217 70.9205 148.112 71.8159 149.217 71.8159Z" fill="white"/>
    </g>

    <g id=ECX data-g="ECX">
        <path id="idVLXeyepurple" d="M105.49 81C108.173 81 110.348 78.8251 110.348 76.1422C110.348 73.4592 108.173 71.2843 105.49 71.2843C102.807 71.2843 100.632 73.4592 100.632 76.1422C100.632 78.8251 102.807 81 105.49 81Z" style="${robotColors.eye}"/>
        <path id="idVRXeyepurple" d="M144.633 81C147.316 81 149.491 78.825 149.491 76.1421C149.491 73.4592 147.316 71.2843 144.633 71.2843C141.95 71.2843 139.775 73.4592 139.775 76.1421C139.775 78.825 141.95 81 144.633 81Z" style="${robotColors.eye}"/>
        <path id="idVLXeyesparkle" d="M110 76C110.552 76 111 75.5523 111 75C111 74.4477 110.552 74 110 74C109.448 74 109 74.4477 109 75C109 75.5523 109.448 76 110 76Z" fill="white"/>
        <path id="idVRXeyesparkle" d="M149 76C149.552 76 150 75.5523 150 75C150 74.4477 149.552 74 149 74C148.448 74 148 74.4477 148 75C148 75.5523 148.448 76 149 76Z" fill="white"/>
    </g>

  </svg>`;
