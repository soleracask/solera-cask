(function () {
    'use strict';
  
    // ── CONFIG ─────────────────────────────────────────────────────────────────
    var PHONE    = '34656778590';       // Your number without + or spaces
    var DELAY_MS = 1500;               // ms after page load before bubble appears
  
    var isSpanish = window.location.pathname.startsWith('/es');
  
    var MESSAGE  = isSpanish
      ? 'Hola, me gustaría obtener más información sobre sus barricas de Jerez.'
      : "Hi, I'd like to learn more about your sherry casks.";
    var TOOLTIP  = isSpanish ? 'Chat en WhatsApp' : 'Chat on WhatsApp';
    // ───────────────────────────────────────────────────────────────────────────
  
    var waUrl = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(MESSAGE);
  
    // ---------------------------------------------------------------------------
    // STYLES
    // ---------------------------------------------------------------------------
    var styleEl = document.createElement('style');
    styleEl.textContent = [
      '.wa-bubble {',
      '  position: fixed;',
      '  bottom: 32px;',
      '  right: 32px;',
      '  z-index: 9999;',
      '  opacity: 0;',
      '  transform: translateY(20px) scale(0.85);',
      '  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);',
      '  pointer-events: none;',
      '}',
      '.wa-bubble.visible {',
      '  opacity: 1;',
      '  transform: translateY(0) scale(1);',
      '  pointer-events: auto;',
      '}',
      '.wa-bubble-btn {',
      '  position: relative;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  width: 56px;',
      '  height: 56px;',
      '  border-radius: 50%;',
      '  background: #1c1c1c;',
      '  color: #ffffff;',
      '  text-decoration: none;',
      '  box-shadow: 0 4px 20px rgba(0,0,0,0.22);',
      '  transition: background 0.35s cubic-bezier(0.4,0,0.2,1),',
      '              color      0.35s cubic-bezier(0.4,0,0.2,1),',
      '              box-shadow 0.35s cubic-bezier(0.4,0,0.2,1),',
      '              transform  0.35s cubic-bezier(0.4,0,0.2,1);',
      '}',
      '.wa-bubble-btn:hover {',
      '  background: #eadabd;',
      '  color: #1c1c1c;',
      '  box-shadow: 0 6px 28px rgba(0,0,0,0.18);',
      '  transform: translateY(-3px);',
      '}',
      '.wa-bubble-btn svg {',
      '  width: 26px;',
      '  height: 26px;',
      '  fill: currentColor;',
      '  flex-shrink: 0;',
      '}',
      '.wa-bubble-btn::before {',
      '  content: "";',
      '  position: absolute;',
      '  inset: 0;',
      '  border-radius: 50%;',
      '  animation: wa-pulse 3s ease-out infinite;',
      '}',
      '@keyframes wa-pulse {',
      '  0%   { box-shadow: 0 0 0 0    rgba(28,28,28,0.30); }',
      '  65%  { box-shadow: 0 0 0 14px rgba(28,28,28,0);    }',
      '  100% { box-shadow: 0 0 0 0    rgba(28,28,28,0);    }',
      '}',
      '.wa-bubble-tooltip {',
      '  position: absolute;',
      '  right: calc(100% + 14px);',
      '  top: 50%;',
      '  transform: translateY(-50%) translateX(8px);',
      '  background: #1c1c1c;',
      '  color: #ffffff;',
      '  font-family: "Inter", sans-serif;',
      '  font-size: 13px;',
      '  font-weight: 500;',
      '  letter-spacing: 0.03em;',
      '  white-space: nowrap;',
      '  padding: 8px 14px;',
      '  pointer-events: none;',
      '  opacity: 0;',
      '  transition: opacity 0.25s ease, transform 0.25s ease;',
      '}',
      '.wa-bubble-btn:hover .wa-bubble-tooltip {',
      '  opacity: 1;',
      '  transform: translateY(-50%) translateX(0);',
      '}',
      '@media (max-width: 768px) {',
      '  .wa-bubble { bottom: 20px; right: 20px; }',
      '  .wa-bubble-btn { width: 52px; height: 52px; }',
      '  .wa-bubble-tooltip { display: none; }',
      '}'
    ].join('\n');
    document.head.appendChild(styleEl);
  
    // ---------------------------------------------------------------------------
    // HTML
    // ---------------------------------------------------------------------------
    var bubble = document.createElement('div');
    bubble.id = 'waBubble';
    bubble.className = 'wa-bubble';
  
    var link = document.createElement('a');
    link.className = 'wa-bubble-btn';
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', TOOLTIP);
  
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('xmlns', svgNS);
  
    var path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d',
      'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15' +
      '-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463' +
      '-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606' +
      '.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025' +
      '-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008' +
      '-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0' +
      ' 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262' +
      '.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413' +
      '.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h' +
      '-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a' +
      '9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122' +
      ' 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885' +
      ' 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892' +
      'c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683' +
      ' 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'
    );
  
    var tooltip = document.createElement('span');
    tooltip.className = 'wa-bubble-tooltip';
    tooltip.textContent = TOOLTIP;
  
    svg.appendChild(path);
    link.appendChild(svg);
    link.appendChild(tooltip);
    bubble.appendChild(link);
    document.body.appendChild(bubble);
  
    // Animate in after delay
    setTimeout(function () {
      bubble.classList.add('visible');
    }, DELAY_MS);
  
  })();