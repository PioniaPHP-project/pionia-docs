import Clipboard from 'clipboard';

for (const block of document.querySelectorAll('.highlight')) {
  const control = document.createElement('div');
  control.className = 'copy';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn-copy';
  button.title = 'Copy code';
  button.setAttribute('aria-label', 'Copy code');
  button.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/></svg>';
  control.append(button);
  block.prepend(control);
}
const clipboard = new Clipboard('.btn-copy', {
  target: (button) => button.closest('.highlight').querySelector('pre'),
});
clipboard.on('success', (event) => {
  event.clearSelection();
  const button = event.trigger;
  button.setAttribute('aria-label', 'Code copied');
  button.title = 'Copied';
  const status = document.createElement('span');
  status.className = 'copy-feedback';
  status.setAttribute('role', 'status');
  status.textContent = 'Copied';
  button.closest('.highlight').append(status);
  setTimeout(() => { status.remove(); button.setAttribute('aria-label', 'Copy code'); button.title = 'Copy code'; }, 1800);
});
clipboard.on('error', (event) => {
  event.trigger.title = 'Select the code and copy it manually';
  event.trigger.setAttribute('aria-label', 'Unable to copy. Select the code and copy it manually.');
});
