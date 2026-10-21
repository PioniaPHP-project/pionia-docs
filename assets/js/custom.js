// Keep independent sidebar sections available while reading across topics.
// Search is also reachable without leaving the keyboard.
document.addEventListener('keydown', (event) => {
  const target = event.target;
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey ||
      target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
  const button = window.innerWidth >= 992
    ? document.getElementById('searchToggleDesktop')
    : document.getElementById('searchToggleMobile');
  if (button) { event.preventDefault(); button.click(); }
});
