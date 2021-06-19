/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./node_modules/_babel-loader@8.2.2@babel-loader/lib/index.js?!./src/js2/transcode.worker.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/_babel-loader@8.2.2@babel-loader/lib/index.js?!./src/js2/transcode.worker.js":
/*!***************************************************************************************************!*\
  !*** ./node_modules/_babel-loader@8.2.2@babel-loader/lib??ref--5-0!./src/js2/transcode.worker.js ***!
  \***************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/*
 * @Autor: lycheng
 * @Date: 2020-01-13 16:12:22
 */
(function () {
  var minSampleRate = 22050;

  self.onmessage = function (e) {
    transcode.transToAudioData(e.data);
  };

  var transcode = {
    transToAudioData: function transToAudioData(audioDataStr) {
      var fromRate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16000;
      var toRate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 22505;
      var outputS16 = transcode.base64ToS16(audioDataStr);
      var output = transcode.transS16ToF32(outputS16);
      output = transcode.transSamplingRate(output, fromRate, toRate);
      output = Array.from(output);
      self.postMessage({
        data: output,
        rawAudioData: Array.from(outputS16)
      });
    },
    transSamplingRate: function transSamplingRate(data) {
      var fromRate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 44100;
      var toRate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 16000;
      var fitCount = Math.round(data.length * (toRate / fromRate));
      var newData = new Float32Array(fitCount);
      var springFactor = (data.length - 1) / (fitCount - 1);
      newData[0] = data[0];

      for (var i = 1; i < fitCount - 1; i++) {
        var tmp = i * springFactor;
        var before = Math.floor(tmp).toFixed();
        var after = Math.ceil(tmp).toFixed();
        var atPoint = tmp - before;
        newData[i] = data[before] + (data[after] - data[before]) * atPoint;
      }

      newData[fitCount - 1] = data[data.length - 1];
      return newData;
    },
    transS16ToF32: function transS16ToF32(input) {
      var tmpData = [];

      for (var i = 0; i < input.length; i++) {
        var d = input[i] < 0 ? input[i] / 0x8000 : input[i] / 0x7fff;
        tmpData.push(d);
      }

      return new Float32Array(tmpData);
    },
    base64ToS16: function base64ToS16(base64AudioData) {
      base64AudioData = atob(base64AudioData);
      var outputArray = new Uint8Array(base64AudioData.length);

      for (var i = 0; i < base64AudioData.length; ++i) {
        outputArray[i] = base64AudioData.charCodeAt(i);
      }

      return new Int16Array(new DataView(outputArray.buffer).buffer);
    }
  };
})();

/***/ })

/******/ });