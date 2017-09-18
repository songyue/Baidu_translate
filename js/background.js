(function() {
	// 事件页面
	var T_SWITCH_CACHE = "true"; // 开关状态 开
	var T_TL_CACHE = "zh-CN";	// 翻译语言 中文

    // 加载扩展，设置图标状态
	var load_switch = function() {
		chrome.storage.local.get(function(obj) {
			T_SWITCH_CACHE = obj.T_SWITCH;
			if (obj.T_SWITCH == "false") {
				chrome.browserAction.setIcon({
					path: "images/off.ico"
				});
			} else {
				chrome.browserAction.setIcon({
					path: "images/on.ico"
				});
			}
		});
	}
	load_switch();

    // 插件开关
	var fswitch = function() {
		if (T_SWITCH_CACHE == "true")
			T_SWITCH_CACHE = "false";
		else
			T_SWITCH_CACHE = "true";
		chrome.storage.local.set({
			'T_SWITCH': T_SWITCH_CACHE
		});
		load_switch();
	}

	// 读取设置
	chrome.storage.sync.get(function(obj) {
		if (obj.T_TL)
			T_TL_CACHE = obj.T_TL; // 语言
	});

	//
	chrome.storage.onChanged.addListener(function(changes, areaName) {
		if (changes.T_TL)
			T_TL_CACHE = changes.T_TL.newValue;
	});

	// 监听绑定图标点击事件
	chrome.browserAction.onClicked.addListener(function() {
		fswitch();
	});

    // 接收方代码
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.method == "execBackFun") {
			if (request.key == "fswitch")
				fswitch();
		} else if (T_SWITCH_CACHE == "false") {
			sendResponse(null);
		} else if (request.method == "translateTxt") {
			var xhr = new XMLHttpRequest();
			// xhr.open("GET", "http://translate.google.cn/translate_a/single?client=t&sl=auto&tl=" + T_TL_CACHE + "&hl=" + T_TL_CACHE + "&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&source=btn&srcrom=1&ssel=0&tsel=0&kc=0&tk=490269.81926&q=" + encodeURIComponent(request.key), false);
			xhr.open("POST", "http://fanyi.baidu.com/v2transapi?from=en&to=zh&query=" + encodeURIComponent(request.key), false);
			xhr.send(null);
			sendResponse(xhr.responseText);
		}
	});
})();

