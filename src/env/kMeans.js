// kMeans.js
/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

function kMeans(iterations, x, min, max, k, means) {
    k = Math.min(x.length, k);
    if (k === 0 || k > x.length) return;

    let seen = {};
    if (!means) {
        means = [];

        //force add min
        means.push({ val: x[0], vals: [] });
        seen[0] = true;

        //force add max
        means.push({ val: x[x.length - 1], vals: [] });
        seen[x.length - 1] = true;

        // Randomly choose k-2 means from the data and make sure that no point is chosen twice. This bit inspired by polymaps but for k-2 instead of k
        while (means.length < k - 2) {
            let idx = Math.floor(Math.random() * (x.length - 1));
            if (!seen[idx]) {
                means.push({ val: x[idx], vals: [] });
                seen[idx] = true;
            }
        }
    }

    for (let i = 0; i < x.length; i++) {
        if (x[i] == Number.NEGATIVE_INFINITY) continue;
        let dists = [];
        for (let j = 0; j < means.length; j++) {
            dists.push(Math.abs(x[i] - means[j].val));
        }
        let closest_index = dists.indexOf(Math.min.apply(null, dists));
        means[closest_index].vals.push(x[i]);
    }

    // Create new centers from the centroids of the values in each group.
    // In the case of one-dimensional data, centroid is the arithmetic average of the values of the points in a cluster.
    // [Vance Faber](http://bit.ly/LHCh2y)
    let v = [];
    for (let i = 0; i < means.length; i++) {
        let centroid = avgOfArray(means[i].vals).toFixed(4);
        v.push({ val: centroid, vals: [] });
    }

    if (iterations-- === 0) return v;
    return kMeans(iterations, x, min, max, k, v);
}

function centeroids(x, means) {
    let centers = new Map();
    for (let xi = 0; xi < x.length; xi++) {
        centers.set(xi, means[0].val);
        means.forEach((m) => {
            let distCurr = Math.abs(x[xi] - m.val);
            let distSave = Math.abs(x[xi] - centers.get(xi));
            if (distCurr < distSave) centers.set(xi, m.val);
        });
    }
    return centers;
}

function frequencyDistribution(centers) {
    let frequency = new Map();
    for (let centeroidIndex = 0; centeroidIndex < centers.size; centeroidIndex++) {
        let c = centers.get(centeroidIndex);
        let f = frequency.get(c) || 0;
        frequency.set(c, ++f);
    }
    return frequency;
}

//usage:
//      let iterations = 18
//      x: array
//      k: 10
//      let means = kMeans(iterations, x, 10);
//      let centers = centeroids(means);
//      let frequency = frequencyDistribution (centers);
