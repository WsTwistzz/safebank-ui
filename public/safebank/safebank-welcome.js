/* SafeBank welcome component. No dependency, no backend calls. */
(function () {
  'use strict';
  if (customElements.get('safebank-welcome')) return;
  const sourceScript = document.currentScript;
  const assetBase = new URL('./', sourceScript && sourceScript.src || document.baseURI);
  const CSS = ":host { display: grid; place-items: center; width: 100%; height: 100%; min-width: 0; min-height: 0; overflow: hidden; background: #efecff; color-scheme: light; font-family: \"Helvetica Neue\", Arial, sans-serif; }\n\n    * { box-sizing: border-box; }\n    \n    \n    .viewport { position: relative; width: 674px; height: 1270px; flex: none; }\n    .stage { position: relative; width: 674px; height: 1270px; overflow: hidden; transform-origin: top left; }\n    .source { display: block; width: 674px; height: 1270px; }\n    .header-patch, .skip-patch, .nav-patch { position: absolute; pointer-events: none; }\n    .header-patch {\n      left: 112px; top: 184px; width: 206px; height: 71px;\n      background: radial-gradient(ellipse at 100% 100%, rgba(248,238,226,.94), transparent 72%), linear-gradient(180deg,#f4f4f4,#f3f3f5);\n    }\n    .brand {\n      position: absolute; left: 125px; top: 198px; display: flex; align-items: center; gap: 3px;\n      height: 43px; color: #101010; white-space: nowrap;\n    }\n    .brand svg { display: block; width: 43px; height: 43px; flex: none; }\n    .brand-name { font-family: \"Helvetica Neue\", Arial, sans-serif; font-size: 25px; font-weight: 600; letter-spacing: -1.25px; line-height: 1; transform: translateY(1px); }\n    .skip-patch {\n      left: 505px; top: 188px; width: 92px; height: 65px;\n      background: radial-gradient(ellipse at 10% 100%,rgba(251,233,203,.92),transparent 75%),linear-gradient(165deg,#f8ecdb,#f8ecda 35%,#fae9cf);\n    }\n    .pagination-patch {\n      position: absolute; left: 111px; top: 990px; width: 266px; height: 31px;\n      background: linear-gradient(180deg, #f2eaf7, #f1ebf7); pointer-events: none;\n    }\n    .nav-patch {\n      left: 112px; top: 1067px; width: 486px; height: 113px;\n      background: radial-gradient(ellipse 54% 100% at 19% 52%, rgba(209,211,250,.3), transparent 88%),\n                  radial-gradient(ellipse 55% 90% at 84% 38%, rgba(245,218,233,.19), transparent 88%),\n                  linear-gradient(180deg, #f1ebf7, #f0e8f7);\n    }\n    .glass-nav {\n      position: absolute; left: 125px; top: 1082px; width: 461px; height: 79px;\n      display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 14px;\n    }\n    .glass-nav a {\n      position: relative; display: flex; align-items: center; justify-content: center; min-width: 0;\n      border: 1px solid rgba(255,255,255,.78); border-radius: 999px;\n      background: radial-gradient(ellipse 80% 62% at 24% 0%, rgba(255,255,255,.24), transparent 90%),\n                  linear-gradient(145deg, rgba(255,255,255,.22), rgba(255,255,255,.07) 58%, rgba(196,191,231,.13));\n      box-shadow: inset 0 1px rgba(255,255,255,.86), inset 0 -2px 3px rgba(152,144,196,.12),\n                  0 13px 30px rgba(93,88,130,.13), 0 2px 6px rgba(93,88,130,.06);\n      -webkit-backdrop-filter: blur(28px) saturate(1.45); backdrop-filter: blur(28px) saturate(1.45);\n      color: #171915; font-size: 20px; font-weight: 610; line-height: 1; text-decoration: none;\n      -webkit-tap-highlight-color: transparent;\n      isolation: isolate;\n      transform: translate3d(var(--float-x, 0px), var(--float-y, 0px), 0) scale(var(--press-scale, 1));\n      transition: background .2s ease, box-shadow .2s ease, transform .32s cubic-bezier(.2,1.4,.4,1);\n    }\n    .glass-nav a::before {\n      content: \"\"; position: absolute; inset: 1px; border-radius: inherit;\n      background: radial-gradient(ellipse 94px 55px at var(--glint-x, 35%) var(--glint-y, 0%),\n                  rgba(255,255,255,.65), rgba(255,255,255,.16) 42%, transparent 86%);\n      opacity: var(--glint-opacity, .42); pointer-events: none;\n      transition: opacity .18s ease;\n    }\n    .glass-nav a .glass-refraction {\n      position: absolute; z-index: 0; inset: 0; padding: 8px; border-radius: inherit;\n      pointer-events: none; opacity: .55;\n      backdrop-filter: url(#safebank-liquid-edge);\n      -webkit-backdrop-filter: url(#safebank-liquid-edge);\n      -webkit-mask: linear-gradient(#000,#000) content-box, linear-gradient(#000,#000);\n      -webkit-mask-composite: xor; mask-composite: exclude;\n    }\n    .glass-nav a .label { position: relative; z-index: 1; }\n    .glass-nav a::after { content: \"\"; position: absolute; inset: -13px 0; }\n    .glass-nav a:last-child {\n      background: radial-gradient(ellipse 80% 62% at 24% 0%, rgba(255,255,255,.34), transparent 90%),\n                  linear-gradient(145deg, rgba(255,255,255,.31), rgba(255,255,255,.1) 58%, rgba(196,191,231,.16));\n      box-shadow: inset 0 1px rgba(255,255,255,.94), inset 0 -2px 3px rgba(152,144,196,.12),\n                  0 15px 32px rgba(93,88,130,.15), 0 2px 6px rgba(93,88,130,.06);\n    }\n    .glass-nav a:hover { background-color: rgba(255,255,255,.16); box-shadow: inset 0 1px #fff, 0 16px 32px rgba(93,88,130,.18); }\n    .glass-nav a:active { --press-scale: .965; }\n    .glass-nav a.is-opening { --press-scale: .978; --glint-opacity: 1; }\n    .glass-nav a:focus-visible { outline: 3px solid #34352f; outline-offset: 3px; }\n    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }\n    @media (prefers-reduced-motion: reduce) { .glass-nav a { transition: none; transform: none; } .glass-nav a::before { transition: none; } }\n  ";
  const HTML = "<div class=\"viewport\" id=\"viewport\">\n    <main class=\"stage\" id=\"stage\" aria-label=\"SafeBank welcome screen\">\n      <img class=\"source\" width=\"674\" height=\"1270\" alt=\"\" aria-hidden=\"true\" src=\"__SAFE_ASSET_0__\">\n      <div class=\"header-patch\" aria-hidden=\"true\"></div>\n      <div class=\"skip-patch\" aria-hidden=\"true\"></div>\n      <div class=\"pagination-patch\" aria-hidden=\"true\"></div>\n      <div class=\"nav-patch\" aria-hidden=\"true\"></div>\n      <div class=\"brand\" role=\"img\" aria-label=\"SafeBank\">\n        <svg viewBox=\"0 0 48 48\" aria-hidden=\"true\" focusable=\"false\">\n          <circle cx=\"24\" cy=\"24\" r=\"21\" fill=\"#101010\"/>\n          <path d=\"M34.6 13.8c-3.4-3.7-10.7-4.6-15.5-2.2-5.8 2.9-5.5 8.2 1 10.4l7 2.3c7.2 2.4 9 6.5 4.7 10.2-4.4 3.8-12 3.2-17.2-.6\" fill=\"none\" stroke=\"#f4f4f4\" stroke-width=\"6.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n        </svg>\n        <span class=\"brand-name\" aria-hidden=\"true\">afeBank</span>\n      </div>\n      <h1 class=\"sr-only\">Clear Insights For Smarter Decisions</h1>\n      <p class=\"sr-only\">Your Investment Space. 三张半透明银行卡以抽象纹理和掩码卡号展示。</p>\n      <svg width=\"0\" height=\"0\" aria-hidden=\"true\" style=\"position:absolute;overflow:hidden\" color-interpolation-filters=\"sRGB\">\n        <defs>\n          <filter id=\"safebank-liquid-edge\" x=\"0%\" y=\"0%\" width=\"100%\" height=\"100%\">\n            <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.018 0.025\" numOctaves=\"2\" seed=\"3\" result=\"flow\"/>\n            <feDisplacementMap in=\"SourceGraphic\" in2=\"flow\" scale=\"3\" xChannelSelector=\"R\" yChannelSelector=\"G\"/>\n          </filter>\n        </defs>\n      </svg>\n      <nav class=\"glass-nav\" aria-label=\"账户入口\">\n        <a href=\"../SafeBank-Auth-Premium/SafeBank-Login.html\"><span class=\"glass-refraction\" aria-hidden=\"true\"></span><span class=\"label\">直接登录</span></a>\n        <a href=\"../SafeBank-Auth-Premium/SafeBank-Register.html\"><span class=\"glass-refraction\" aria-hidden=\"true\"></span><span class=\"label\">注册</span></a>\n      </nav>\n    </main>\n  </div>";
  let sequence = 0;
  class SafeBankWelcome extends HTMLElement {
    static get observedAttributes() { return ['login-url', 'register-url']; }
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      const filterId = 'safebank-liquid-edge-' + (++sequence);
      let html = HTML.replaceAll('safebank-liquid-edge', filterId);
      html = html.replace(/__SAFE_ASSET_(\d+)__/g, (_, n) => new URL(ASSETS[Number(n)], assetBase).href);
      const style = document.createElement('style');
      style.textContent = CSS.replaceAll('safebank-liquid-edge', filterId);
      this.shadowRoot.append(style);
      const template = document.createElement('template');
      template.innerHTML = html;
      this.shadowRoot.append(template.content.cloneNode(true));
      this._viewport = this.shadowRoot.querySelector('.viewport');
      this._stage = this.shadowRoot.querySelector('.stage');
      this._buttons = Array.from(this.shadowRoot.querySelectorAll('.glass-nav a'));
      this._motion = matchMedia('(prefers-reduced-motion: reduce)');
      this._navigationTimer = null;
      this._resizeFrame = null;
    }
    connectedCallback() {
      if (this._controller) return;
      this._controller = new AbortController();
      const signal = this._controller.signal;
      this._syncLinks();
      const fit = () => {
        cancelAnimationFrame(this._resizeFrame);
        this._resizeFrame = requestAnimationFrame(() => this._fit());
      };
      this._observer = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
      if (this._observer) this._observer.observe(this);
      else window.addEventListener('resize', fit, { passive: true, signal });
      this._buttons.forEach((button, index) => {
        const settle = () => this._settle(button);
        const reflect = event => {
          const bounds = button.getBoundingClientRect();
          if (!bounds.width || !bounds.height) return;
          const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
          const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
          button.style.setProperty('--glint-x', `${Math.round(x * 100)}%`);
          button.style.setProperty('--glint-y', `${Math.round(y * 100)}%`);
          button.style.setProperty('--glint-opacity', '.95');
          if (!this._motion.matches) {
            button.style.setProperty('--float-x', `${((x - .5) * 4).toFixed(2)}px`);
            button.style.setProperty('--float-y', `${((y - .5) * 3).toFixed(2)}px`);
          }
        };
        button.addEventListener('pointerenter', reflect, { signal });
        button.addEventListener('pointermove', reflect, { signal });
        button.addEventListener('pointerdown', event => {
          reflect(event);
          if (!this._motion.matches) button.style.setProperty('--press-scale', '.965');
        }, { signal });
        button.addEventListener('pointerup', () => button.style.setProperty('--press-scale', '1'), { signal });
        ['pointercancel', 'pointerleave', 'blur'].forEach(type => button.addEventListener(type, settle, { signal }));
        button.addEventListener('focus', () => button.style.setProperty('--glint-opacity', '.72'), { signal });
        button.addEventListener('click', event => {
          // Preserve native modified-click/open-in-new-tab behavior.
          if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          if (this._navigationTimer !== null) return;
          const target = index === 0 ? 'login' : 'register';
          const href = button.href;
          const navigation = new CustomEvent('safebank-navigate', {
            detail: { target, href }, bubbles: true, composed: true, cancelable: true
          });
          if (!this.dispatchEvent(navigation)) return;
          if (this._motion.matches) { window.location.assign(href); return; }
          button.classList.add('is-opening');
          button.style.setProperty('--glint-opacity', '1');
          button.style.setProperty('--press-scale', '.978');
          this._navigationTimer = setTimeout(() => {
            this._navigationTimer = null;
            window.location.assign(href);
          }, 170);
        }, { signal });
      });
      const reset = () => this._buttons.forEach(button => this._settle(button));
      this._motion.addEventListener('change', reset, { signal });
      window.addEventListener('pageshow', reset, { signal });
      this._fit();
    }
    disconnectedCallback() {
      if (this._controller) this._controller.abort();
      this._controller = null;
      if (this._observer) this._observer.disconnect();
      cancelAnimationFrame(this._resizeFrame);
      clearTimeout(this._navigationTimer);
      this._navigationTimer = null;
      this._buttons.forEach(button => this._settle(button));
    }
    attributeChangedCallback() { if (this._buttons) this._syncLinks(); }
    _syncLinks() {
      this._buttons.forEach((button, index) => {
        const target = index === 0 ? 'login' : 'register';
        const candidate = this.getAttribute(target + '-url') || '/' + target;
        const fallback = new URL('/' + target, document.baseURI);
        let url;
        try { url = new URL(candidate, document.baseURI); } catch (_) { url = fallback; }
        // These navigation controls only use web/file paths; never execute URL scripts.
        button.href = /^(https?:|file:)$/.test(url.protocol) ? url.href : fallback.href;
        button.dataset.target = target;
      });
    }
    _fit() {
      const width = this.clientWidth;
      const height = this.clientHeight;
      if (!width || !height) return;
      const scale = Math.min(width / 674, height / 1270, 1);
      this._viewport.style.width = `${674 * scale}px`;
      this._viewport.style.height = `${1270 * scale}px`;
      this._stage.style.transform = `scale(${scale})`;
    }
    _settle(button) {
      button.classList.remove('is-opening');
      Object.entries({ '--glint-x': '35%', '--glint-y': '0%', '--glint-opacity': '.42', '--float-x': '0px', '--float-y': '0px', '--press-scale': '1' })
        .forEach(([key, value]) => button.style.setProperty(key, value));
    }
  }
  const ASSETS = ["assets/welcome-art-dd7418b231eb.png"];
  customElements.define('safebank-welcome', SafeBankWelcome);
})();
