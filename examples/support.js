// ═══════════════════════════════════════════════════════════════════════
// FLOATING SUPPORT BUTTON
// Consistent across all mushu pages
// ═══════════════════════════════════════════════════════════════════════

function initSupportFab() {
  const supportFab = document.getElementById('supportFab');
  const supportFabBtn = document.getElementById('supportFabBtn');
  const supportPopup = document.getElementById('supportPopup');
  
  if (!supportFab || !supportFabBtn || !supportPopup) return;
  
  supportFabBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    supportPopup.classList.toggle('open');
    supportFabBtn.classList.toggle('active');
  });
  
  // Close popup when clicking outside
  document.addEventListener('click', (e) => {
    if (!supportFab.contains(e.target)) {
      supportPopup.classList.remove('open');
      supportFabBtn.classList.remove('active');
    }
  });
  
  // Close popup on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      supportPopup.classList.remove('open');
      supportFabBtn.classList.remove('active');
    }
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupportFab);
} else {
  initSupportFab();
}
