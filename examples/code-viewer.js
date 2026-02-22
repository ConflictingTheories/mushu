// ═══════════════════════════════════════════════════════════════════════
// MUSHU CODE VIEWER
// ═══════════════════════════════════════════════════════════════════════

function initCodeViewer() {
    const codeBtn = document.createElement('button');
    codeBtn.className = 'code-toggle-btn';
    codeBtn.innerHTML = '{ } Code';
    document.body.appendChild(codeBtn);

    const panel = document.createElement('div');
    panel.className = 'code-panel';
    panel.innerHTML = `
    <div class="code-panel-header">
      <h3>SOURCE CODE</h3>
      <button class="code-close-btn">&times;</button>
    </div>
    <div class="code-content"></div>
  `;
    document.body.appendChild(panel);

    const contentDiv = panel.querySelector('.code-content');
    const closeBtn = panel.querySelector('.code-close-btn');

    // Extract code from the main script tag
    const scripts = Array.from(document.querySelectorAll('script:not([src])'));
    let mainScript = scripts.find(s => s.innerText.includes('mushu'));

    // Fallback: look for generic boilerplate/3D scripts
    if (!mainScript) {
        mainScript = scripts.find(s => s.innerText.includes('gl.') || s.innerText.includes('getContext'));
    }

    if (mainScript) {
        let code = mainScript.innerText.trim();

        // Simple basic highlighting (very rudimentary)
        code = code
            .replace(/\/\/.*/g, '<span class="comment">$&</span>')
            .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')
            .replace(/'[^']*'/g, '<span class="string">$&</span>')
            .replace(/"[^"]*"/g, '<span class="string">$&</span>')
            .replace(/`[^`]*`/g, '<span class="string">$&</span>')
            .replace(/\b(const|let|var|function|return|if|else|for|while|import|from|export|default|mushu|gl|gpu|flow|use|go)\b/g, '<span class="keyword">$&</span>')
            .replace(/\b(\w+)\s*\(/g, '<span class="function">$1</span>(')
            .replace(/\b\d+\b/g, '<span class="number">$&</span>');

        contentDiv.innerHTML = `<pre>${code}</pre>`;
    } else {
        contentDiv.innerHTML = '<p style="color: #666">No mushu code block found.</p>';
    }

    codeBtn.onclick = () => panel.classList.add('open');
    closeBtn.onclick = () => panel.classList.remove('open');

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') panel.classList.remove('open');
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeViewer);
} else {
    initCodeViewer();
}
