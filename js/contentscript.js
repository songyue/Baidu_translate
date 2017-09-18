(function() {
	/**
	@ BaiduTranslateEX for Chrome
	@ date : 2016-08-04
	@ last update : 2016-08-04
	@ author : Songyue
	@ version : 0.0.2
	**/

	var BaiduTransateEx = new(function() {
		var _instance = this; // 实例
		this.transEvent = null;
		this.hotKeyStr = null;
		this.oldkeydownF = document.onkeydown;
		this.init = function() {
			this.createDiv();
			this.regeidtHotKey();
		};
		// 创建 显示内容的页面元素
		this.createDiv = function() {
			this.div = document.createElement("div");
			this.div.setAttribute("id", "GoogleTranslateExDiv");
			document.body.appendChild(this.div);
			this.bindEvent();
		};
		//
		this.regeidtHotKey = function() {
			chrome.storage.sync.get(function(obj) {
				_instance.hotKeyStr = obj.T_SWITCH_HOTKEY;  // 快捷键
				document.onkeydown = _instance.hotKeyFun;
			});
		};
		this.hotKeyFun = function() {
			// 没有设置快捷键
			if (!_instance.hotKeyStr)
				return;
			//
			if (_instance.oldkeydownF)
				_instance.oldkeydownF();
			//
			if (_instance.hotKeyStr.indexOf("ctrl") > 0 && !window.event.ctrlKey)
				return;
			if (_instance.hotKeyStr.indexOf("shift") > 0 && !window.event.shiftKey)
				return;
			if (_instance.hotKeyStr.indexOf("alt") > 0 && !window.event.altKey)
				return;
			// 从content script发送给background：
			if (_instance.hotKeyStr[_instance.hotKeyStr.length - 1] == String.fromCharCode(window.event.keyCode))
				chrome.runtime.sendMessage({
					method: "execBackFun",
					key: "fswitch"
				});
		};
		this.bindEvent = function() {
			var self = this;
			document.onmousedown = function(event) {
				var e = event;
				var s = e.toElement || e.relatedTarget;
				var temp = document.getElementById('GoogleTranslateExDiv');

				var res = temp.compareDocumentPosition(s);
				if (!s || !(res == 20 || res == 0)) {
					self.closeGoogleTranslateEx();
				}
			};

			document.onmouseup = function(event) {
				var selectText = window.getSelection().toString();
				if (self.trim(selectText) == "") return;
				self.selectText = selectText;

				var e = event;
				var s = e.toElement || e.relatedTarget;
				var temp = document.getElementById('GoogleTranslateExDiv');

				var res = temp.compareDocumentPosition(s);
				if (!s || !(res == 20 || res == 0)) {
					self.transEvent = event;
					// 从content script发送给background：
					chrome.runtime.sendMessage({
						"method": "translateTxt",
						"key": selectText
					}, function(json) {
						if (json)
							_instance.displayResult(eval("(" + json + ")"));
					});
				}
			};
		};

		this.displayResult = function(data) {
			var self = this;
			var event = this.transEvent || window.event;
			var x = event.clientX;
			var y = event.clientY;
			var _html = ['<div class="GoogleTransTitle"><span id="GoogleTranslateEXClose"><img src="', chrome.extension.getURL("images/buttonClose.gif"), '" /></span><strong>"']
			_html.push(this.cutStr(this.selectText, 20));
			_html.push('"</strong> 的翻译结果</div>');

			if(typeof(data.dict_result.simple_means) !== "undefined"){
				var res_data = data.dict_result.simple_means.word_means; // 单词翻译
				for (var i = 0; i < res_data.length; i++)
					_html.push('<div class="GoogleTransContent">', res_data[i], '</div>');
			}
			if(data.trans_result.data.length > 0){
				var res_data = data.trans_result.data;// 长句翻译
				for (var i = 0; i < res_data.length; i++)
					_html.push('<div class="GoogleTransContent">', res_data[i].dst, '</div>');
			}


			_html.push('<div class="GoogleTransBottom">Baidu Translate EX v0.01 以上结果由<a href="http://fanyi.baidu.com" target="_blank">Baidu</a>提供</div>');

			this.div.innerHTML = _html.join('');
			document.getElementById("GoogleTranslateEXClose").onclick = function() {
				self.closeGoogleTranslateEx();
			};
			if (x + 300 < document.body.offsetWidth) {
				this.div.style.left = x + "px";
			} else {
				this.div.style.right = 0 + "px";
			}
			this.div.style.top = y + 15 + document.body.scrollTop + "px";
			this.div.style.display = "block";
		};
		this.cutStr = function(str, len) {

			var a = 0;
			var i = 0;
			var temp = '';
			for (i = 0; i < str.length; i++) {
				if (str.charCodeAt(i) > 255) {
					a += 2;
				} else {
					a++;
				}
				if (a > len) {
					return temp + "...";
				}
				temp += str.charAt(i);
			}
			return str;
		};
		this.closeGoogleTranslateEx = function() {
			this.div.style.display = "none";
		};
		this.trim = function(str, type) {
			switch (type) {
				case 'l':
					return str.replace(/(^\s*)/g, "");
				case 'r':
					return str.replace(/(\s*$)/g, "");
				default:
					return str.replace(/(^\s*)|(\s*$)/g, "");
			}
		}
	})();

	BaiduTransateEx.init();
})();