(function () {
  const LOGPREFIX = "SteadyTimer: ";

  const isBlobSupported = () => {
    try {
      var blob = new Blob(['test'], { type: 'text/plain' });
      return blob.size === 4 && blob.type === 'text/plain';
    } catch (e) {
      return false;
    }
  }

  if (!isBlobSupported()) {
    console.log(
      LOGPREFIX + "Initialisation failed - Blob is not supported"
    );
    return
  }

  const blob = new Blob([
    "\
const fakeIdToId = {};\
onmessage = function (event) {\
let data = event.data,\
    timerName = data.timerName,\
fakeId = data.fakeId,\
time = data.hasOwnProperty('time') ? data.time : void 0;\
switch (timerName) {\
case 'setInterval':\
  fakeIdToId[fakeId] = setInterval(function () {\
    postMessage({fakeId: fakeId});\
  }, time);\
  break;\
case 'clearInterval':\
  if (fakeIdToId.hasOwnProperty (fakeId)) {\
    clearInterval(fakeIdToId[fakeId]);\
    delete fakeIdToId[fakeId];\
  }\
  break;\
case 'setTimeout':\
  fakeIdToId[fakeId] = setTimeout(function () {\
    postMessage({fakeId: fakeId});\
    if (fakeIdToId.hasOwnProperty (fakeId)) {\
      delete fakeIdToId[fakeId];\
    }\
  }, time);\
  break;\
case 'clearTimeout':\
  if (fakeIdToId.hasOwnProperty (fakeId)) {\
    clearTimeout(fakeIdToId[fakeId]);\
    delete fakeIdToId[fakeId];\
  }\
  break;\
}\
}\
",
  ]);
  const workerUrl = window.URL.createObjectURL(blob);

  const fakeIdToCallback = {};
  let worker,
    FakeIdNow = 0,
    maxFakeId = 0x7fffffff; // 2 ^ 31 - 1

  if (typeof Worker !== "undefined") {
    const getFakeId = () => {
      do {
        if (FakeIdNow == maxFakeId) {
          FakeIdNow = 0;
        } else {
          FakeIdNow++;
        }
      } while (fakeIdToCallback.hasOwnProperty(FakeIdNow));
      return FakeIdNow;
    }

    try {
      worker = new Worker(workerUrl);

      window.setInterval = function (callback, time) {
        var fakeId = getFakeId();
        fakeIdToCallback[fakeId] = {
          callback: callback,
          parameters: Array.prototype.slice.call(arguments, 2),
        };
        worker.postMessage({
          timerName: "setInterval",
          fakeId: fakeId,
          time: time,
        });
        return fakeId;
      };

      window.clearInterval = function (fakeId) {
        if (fakeIdToCallback.hasOwnProperty(fakeId)) {
          delete fakeIdToCallback[fakeId];
          worker.postMessage({
            timerName: "clearInterval",
            fakeId: fakeId,
          });
        }
      };

      window.setTimeout = function (callback, time) {
        var fakeId = getFakeId();
        fakeIdToCallback[fakeId] = {
          callback: callback,
          parameters: Array.prototype.slice.call(arguments, 2),
          isTimeout: true,
        };
        worker.postMessage({
          timerName: "setTimeout",
          fakeId: fakeId,
          time: time,
        });
        return fakeId;
      };

      window.clearTimeout = function (fakeId) {
        if (fakeIdToCallback.hasOwnProperty(fakeId)) {
          delete fakeIdToCallback[fakeId];
          worker.postMessage({
            timerName: "clearTimeout",
            fakeId: fakeId,
          });
        }
      };

      worker.onmessage = function (event) {
        var data = event.data,
          fakeId = data.fakeId,
          request,
          parameters,
          callback;
        if (fakeIdToCallback.hasOwnProperty(fakeId)) {
          request = fakeIdToCallback[fakeId];
          callback = request.callback;
          parameters = request.parameters;
          if (request.hasOwnProperty("isTimeout") && request.isTimeout) {
            delete fakeIdToCallback[fakeId];
          }
        }
        if (typeof callback === "string") {
          try {
            callback = new Function(callback);
          } catch (error) {
            console.log(
              LOGPREFIX + "Error parsing callback code string: ",
              error
            );
          }
        }
        if (typeof callback === "function") {
          callback.apply(window, parameters);
        }
      };

      worker.onerror = function (event) {
        console.log(event);
      };
    } catch (error) {
      console.log(LOGPREFIX + "Initialisation failed");
      console.error(error);
    }
  } else {
    console.log(
      LOGPREFIX + "Initialisation failed - HTML5 Web Worker is not supported"
    );
  }
})()
