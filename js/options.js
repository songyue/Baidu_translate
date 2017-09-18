(function() {
  // 插件设置页面使用
  // 快捷键
  document.onkeydown = function() {
    var str = window.event.ctrlKey ? 'ctrl+' : '';
    str = window.event.shiftKey ? str + 'shift+' : str;
    str = window.event.altKey ? str + 'alt+' : str;
    str = str + String.fromCharCode(window.event.keyCode);
    document.getElementById('SWITCH_HOTKEY').value = str;
  }

  // 读取设置
  chrome.storage.sync.get(function(obj) {
    if (obj.T_SWITCH_HOTKEY)
      document.getElementById('SWITCH_HOTKEY').value = obj.T_SWITCH_HOTKEY; // 快捷键
    if (obj.T_TL)
      document.getElementById('SWITCH_TL').value = obj.T_TL; // 语言
  });

  // 保存按钮
  document.getElementById('SAVE_BUTTON').onclick = function() {
    chrome.storage.sync.set({
      'T_SWITCH_HOTKEY': document.getElementById('SWITCH_HOTKEY').value,
      'T_TL': document.getElementById('SWITCH_TL').value
    });
  }
})();