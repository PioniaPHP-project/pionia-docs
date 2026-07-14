import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

function isDarkMode() {
  const theme = document.documentElement.getAttribute('data-bs-theme');
  return theme === 'dark'
    || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

function mermaidConfig() {
  const dark = isDarkMode();

  return {
    startOnLoad: false,
    theme: dark ? 'dark' : 'neutral',
    securityLevel: 'loose',
    flowchart: { htmlLabels: true, useMaxWidth: true },
    themeVariables: dark
      ? {
          fontSize: '17px',
          signalTextColor: '#f1f5f9',
          noteTextColor: '#1f2937',
          noteBkgColor: '#fef08a',
          actorTextColor: '#1f2937',
          actorBkg: '#f8fafc',
          actorBorder: '#94a3b8',
          lineColor: '#cbd5e1',
        }
      : undefined,
  };
}

mermaid.initialize(mermaidConfig());

const nodes = document.querySelectorAll('.mermaid');
if (nodes.length > 0) {
  await mermaid.run({ nodes });
}
