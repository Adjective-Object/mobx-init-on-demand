'use strict';
const mobx = require('mobx');
const {
    observableOnDemand,
    OnDemandObservableObject,
    OnDemandObservableMap,
} = require('mobx-init-on-demand');

const deferredObservableShim = x => observableOnDemand(x);
Object.assign(deferredObservableShim, mobx.observable);
deferredObservableShim.object = x => OnDemandObservableObject.wrap(x);
deferredObservableShim.map = mapArgs => {
    return new OnDemandObservableMap(mapArgs);
};

module.exports = {
    ...mobx,
    observable: deferredObservableShim,
};
