// Generated by CoffeeScript 1.7.1
(function() {
  var SimpleTextEditor;

  SimpleTextEditor = {
    init: function() {
      var boldBtn, italicBtn;
      this.contentHolder = document.querySelector('#editbox');
      if (!this.contentHolder) {
        throw new Error('The editbox element has not been defined');
      }
      this.contentHolder.addEventListener('keyup', this, false);
      boldBtn = document.querySelector('#bold');
      if (boldBtn) {
        boldBtn.addEventListener('click', this, false);
      }
      italicBtn = document.querySelector('#italic');
      if (italicBtn) {
        italicBtn.addEventListener('click', this, false);
      }
      return this.restoreDocument();
    },
    saveData: function() {
      var timeout;
      return timeout = window.setTimeout((function(_this) {
        return function() {
          var data;
          window.clearTimeout(timeout);
          data = _this.contentHolder.innerHTML;
          return window.localStorage.setItem('content', data);
        };
      })(this), 1000);
    },
    restoreDocument: function() {
      if (window.localStorage.content) {
        return this.contentHolder.innerHTML = window.localStorage.content;
      }
    },
    handleEvent: function(e) {
      if (e.type === 'keyup') {
        return this.saveData(null);
      }
      if (e.target.id === 'italic') {
        document.execCommand('italic');
      } else if (e.target.id === 'bold') {
        document.execCommand('bold');
      }
      return this.saveData(null);
    }
  };

  SimpleTextEditor.init();

}).call(this);
