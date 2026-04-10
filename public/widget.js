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
  var page = script.getAttribute('data-page') || 'feedback';
  var baseUrl = script.src.replace('/widget.js', '');
  var pageUrl = baseUrl + '/p/' + project + '/' + page;

  // Icons for different pages
  var icons = {
    feedback: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    roadmap: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>',
    changelog: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
  };

  var closeIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

  if (mode === 'popup') {
    // Create floating button
    var btn = document.createElement('button');
    btn.id = 'featureflow-trigger';
    btn.innerHTML = icons[page] || icons.feedback;
    btn.setAttribute('aria-label', 'Open ' + page);

    var posStyle = '';
    if (position.indexOf('right') >= 0) posStyle += 'right:20px;';
    else posStyle += 'left:20px;';
    if (position.indexOf('top') >= 0) posStyle += 'top:20px;';
    else posStyle += 'bottom:20px;';

    btn.style.cssText = 'position:fixed;' + posStyle + 'z-index:99999;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 20px rgba(0,0,0,0.15);transition:transform 0.2s ease,box-shadow 0.2s ease;background:' + color + ';';

    btn.onmouseenter = function() {
      btn.style.transform = 'scale(1.1)';
      btn.style.boxShadow = '0 6px 30px rgba(0,0,0,0.2)';
    };
    btn.onmouseleave = function() {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
    };

    // Create popup container
    var popup = document.createElement('div');
    popup.id = 'featureflow-popup';

    var popupPos = '';
    if (position.indexOf('right') >= 0) popupPos += 'right:20px;';
    else popupPos += 'left:20px;';
    if (position.indexOf('top') >= 0) popupPos += 'top:85px;';
    else popupPos += 'bottom:85px;';

    popup.style.cssText = 'position:fixed;' + popupPos + 'z-index:99998;width:420px;height:600px;max-width:calc(100vw - 40px);max-height:calc(100vh - 120px);border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.2);display:none;opacity:0;transform:translateY(10px) scale(0.95);transition:opacity 0.3s ease,transform 0.3s ease;background:#fff;';

    // Header bar inside popup
    var header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #e5e7eb;background:#f9fafb;';
    header.innerHTML = '<span style="font-size:14px;font-weight:600;color:#111827;">FeatureFlow</span>';

    // Tab navigation in popup
    var tabs = document.createElement('div');
    tabs.style.cssText = 'display:flex;gap:4px;padding:8px 12px;border-bottom:1px solid #e5e7eb;background:#f9fafb;';

    var tabPages = ['feedback', 'roadmap', 'changelog'];
    var tabLabels = { feedback: '💬 Feedback', roadmap: '🗺️ Roadmap', changelog: '📋 Changelog' };
    var iframe;

    tabPages.forEach(function(tp) {
      var tab = document.createElement('button');
      tab.textContent = tabLabels[tp];
      tab.style.cssText = 'flex:1;padding:6px 8px;border:none;border-radius:6px;font-size:11px;font-weight:500;cursor:pointer;transition:all 0.2s;background:' + (tp === page ? color : 'transparent') + ';color:' + (tp === page ? '#fff' : '#6b7280') + ';';
      tab.onclick = function() {
        iframe.src = baseUrl + '/p/' + project + '/' + tp;
        // Update active tab
        var allTabs = tabs.querySelectorAll('button');
        allTabs.forEach(function(t) {
          t.style.background = 'transparent';
          t.style.color = '#6b7280';
        });
        tab.style.background = color;
        tab.style.color = '#fff';
      };
      tabs.appendChild(tab);
    });

    iframe = document.createElement('iframe');
    iframe.src = pageUrl;
    iframe.style.cssText = 'width:100%;height:calc(100% - 85px);border:none;';
    iframe.title = 'FeatureFlow';

    popup.appendChild(header);
    popup.appendChild(tabs);
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
        btn.innerHTML = closeIcon;
      } else {
        popup.style.opacity = '0';
        popup.style.transform = 'translateY(10px) scale(0.95)';
        setTimeout(function() { popup.style.display = 'none'; }, 300);
        btn.innerHTML = icons[page] || icons.feedback;
      }
    };

    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        btn.click();
      }
    });

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
    inlineIframe.src = pageUrl;
    inlineIframe.style.cssText = 'width:100%;min-height:600px;border:none;border-radius:12px;';
    inlineIframe.title = 'FeatureFlow ' + page.charAt(0).toUpperCase() + page.slice(1);
    target.appendChild(inlineIframe);
  }
})();
