/**
 * Android PWA Installation & Android Mobile UX Controller
 */

export class AndroidAppController {
  constructor(uiRenderer) {
    this.ui = uiRenderer;
    this.deferredPrompt = null;
    this.installBtn = document.getElementById('android-install-btn');

    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.listenForInstallPrompt();
    this.checkStandaloneMode();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => console.log('[Android SW] Service Worker registered:', reg.scope))
          .catch((err) => console.warn('[Android SW] Service Worker registration failed:', err));
      });
    }
  }

  listenForInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent browser default mini-infobar
      e.preventDefault();
      this.deferredPrompt = e;

      // Show custom Android Install button
      if (this.installBtn) {
        this.installBtn.style.display = 'inline-flex';
        this.installBtn.addEventListener('click', () => this.promptAndroidInstall());
      }
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      if (this.installBtn) this.installBtn.style.display = 'none';
      if (this.ui) this.ui.showToast('📲 Aether Weather installed to your Android home screen!', 'success');
    });
  }

  async promptAndroidInstall() {
    if (!this.deferredPrompt) {
      if (this.ui) this.ui.showToast('Tap your Android browser menu (⋮) and select "Add to Home screen"', 'info');
      return;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      if (this.ui) this.ui.showToast('Installing Android App...', 'success');
    }
    this.deferredPrompt = null;
    if (this.installBtn) this.installBtn.style.display = 'none';
  }

  checkStandaloneMode() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      document.body.classList.add('android-standalone');
      if (this.installBtn) this.installBtn.style.display = 'none';
    }
  }
}
