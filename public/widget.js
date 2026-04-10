(function() {
  'use strict';

  // Find the script tag to read config
  var scripts = document.querySelectorAll('script[data-project]');
  var script = scripts[scripts.length - 1];

  if (!script) return;

  var project = script.getAttribute('data-project');
  var mode = script.getAttribute('data-mode') || 'inline';
  var color = script.getAttribute('data-color') || '#6366f1';
  var position = script.getAttribute('data-position') || 'bottom-right';
  var baseUrl = script.src.replace('/widget.js', '');

  if (mode === 'popup') {
    // Create floating button
    var btn = document.createElement('button');
    btn.id = 'featureflow-trigger';
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    btn.style.cssText = 'position:fixed;' + (position.includes('right') ? 'right:20px;' : 'left:20px;') + (position.includes('top') ? 'top:20px;' : 'bottom:20px;') + 'z-index:99999;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 20px rgba(0,0,0,0.15);transition:transform 0.2s,box-shadow 0.2s;background:' + color + ';';

    btn.onmouseenter = function() { btn.style.transform = 'scale(1.1)'; btn.style.boxShadow = '0 6px 30px rgba(0,0,0,0.2)'; };
    btn.onmouseleave = function() { btn.style.transform = 'scale(1)'; btn.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'; };

    // Create popup container
    var popup = document.createElement('div');
    popup.id = 'featureflow-popup';
    popup.style.cssText = 'position:fixed;' + (position.includes('right') ? 'right:20px;' : 'left:20px;') + (position.includes('top') ? 'top:85px;' : 'bottom:85px;') + 'z-index:99998;width:420px;height:600px;max-width:calc(100vw - 40px);max-height:calc(100vh - 120px);border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.2);display:none;opacity:0;transform:translateY(10px) scale(0.95);transition:opacity 0.3s,transform 0.3s;';

    var iframe = document.createElement('iframe');
    iframe.src = baseUrl + '/p/' + project + '/feedback';
    iframe.style.cssText = 'width:100%;height:100%;border:none;';
    iframe.title = 'Feedback';
    popup.appendChild(iframe);

    var isOpen = false;
    btn.onclick = function() {
      isOpen = !isOpen;
      if (isOpen) {
        popup.style.display = 'block';
        setTimeout(function() {
          popup.style.opacity = '1';
          popup.style.transform = 'translateY(0) scale(1)';
        }, 10);
        btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      } else {
        popup.style.opacity = '0';
        popup.style.transform = 'translateY(10px) scale(0.95)';
        setTimeout(function() { popup.style.display = 'none'; }, 300);
        btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      }
    };

    document.body.appendChild(btn);
    document.body.appendChild(popup);
  } else {
    // Inline mode - find target div or create iframe
    var target = document.getElementById('featureflow');
    if (!target) {
      target = document.createElement('div');
      target.id = 'featureflow';
      script.parentNode.insertBefore(target, script);
    }

    var inlineIframe = document.createElement('iframe');
    inlineIframe.src = baseUrl + '/p/' + project + '/feedback';
    inlineIframe.style.cssText = 'width:100%;min-height:600px;border:none;border-radius:12px;';
    inlineIframe.title = 'Feedback';
    target.appendChild(inlineIframe);
  }
})();
