var diagnosticList = [
  {
    image: "js.png",
    title: "Javascript",
    check: function(frames, symbols) {
      return stepContains('mach_msg', frames, symbols);
    },
  },
];

function stepContains(substring, frames, symbols) {
  for (var i = 0; i < frames.length; i++) {
    var frameSym = symbols[frames[i]].functionName || symbols[frames[i]].symbolName;
    if (frameSym.indexOf(substring) != -1) {
      return true;
    }
  }
  return false;
}

function DiagnosticBar() {
  this._container = document.createElement("div");
  this._container.className = "diagnostic";
  this._colorCode = 0;
}

DiagnosticBar.prototype = {
  getContainer: function DiagnosticBar_getContainer() {
    return this._container;
  },
  _addDiagnosticItem: function(x, width, imageFile, title) {
    x = x * 100;
    width = width * 100;
    if (width < 1) return;
    var diagnostic = document.createElement("a");

    var backgroundImageStr = "url('images/diagnostic/"+imageFile+"')";

    if (this._colorCode % 2 == 0) {
      backgroundImageStr += ", -moz-linear-gradient(#900, #E00)";
    } else {
      backgroundImageStr += ", -moz-linear-gradient(#300, #500)";
    }

    diagnostic.style.position = "absolute";
    diagnostic.style.backgroundImage = backgroundImageStr;
    diagnostic.style.width = width + "%";
    diagnostic.style.height = "100%";
    diagnostic.style.backgroundRepeat = "no-repeat";
    diagnostic.style.backgroundPosition = "center";

    diagnostic.title = title;
    diagnostic.style.left = x + "%";
    this._container.appendChild(diagnostic);

    this._colorCode++;
  },
  display: function DiagnosticBar_display(data, filterByName, histogramData, symbols) {
    this._container.innerHTML = "";
    if (!histogramData || histogramData.length < 1) return;

    var lastStep = data[data.length-1];
    var widthSum = data.length;
    var self = this;
    var count = 0;
    var pendingDiagnosticX = null;
    var pendingDiagnosticW = null;
    var pendingDiagnostic = null;

    var x = 0;
    data.forEach(function plotStep(step) {
      var frames = step.frames;
      var needFlush = true;
      for (var i = 0; i < diagnosticList.length; i++) {
        var currDiagnostic = diagnosticList[i];
        if (currDiagnostic.check(frames, symbols)) {
          if (pendingDiagnostic && pendingDiagnostic != currDiagnostic) {
            var imgFile = pendingDiagnostic.image;
            var title = pendingDiagnostic.title;
            self._addDiagnosticItem(pendingDiagnosticX/widthSum, pendingDiagnosticW/widthSum, imgFile, title);
            count++;
            pendingDiagnostic = null;
          }
          if (!pendingDiagnostic) {
            pendingDiagnostic = currDiagnostic;
            pendingDiagnosticX = x;
            pendingDiagnosticW = 1;
          } else if (pendingDiagnostic && pendingDiagnostic == currDiagnostic) {
            pendingDiagnosticW++;
          }
          needFlush = false;
          break;
        }
      }
      if (needFlush && pendingDiagnostic) {
        var imgFile = pendingDiagnostic.image;
        var title = pendingDiagnostic.title;
        self._addDiagnosticItem(pendingDiagnosticX/widthSum, pendingDiagnosticW/widthSum, imgFile, title);
        count++;
        pendingDiagnostic = null;
      }
      x++;
    });
    if (pendingDiagnostic) {
      var imgFile = pendingDiagnostic.image;
      var title = pendingDiagnostic.title;
      self._addDiagnosticItem(pendingDiagnosticX/widthSum, pendingDiagnosticW/widthSum, imgFile, title);
      count++;
      pendingDiagnostic = null;
    }
    if (count == 0) {
      this._container.style.display = "none";
    } else {
      this._container.style.display = "";
    }
    //this._container.innerHTML = w; //JSON.stringify(histogramData);
  },
};


