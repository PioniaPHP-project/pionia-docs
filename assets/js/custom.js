// Section nav: keep only one open details group at a time
document.querySelectorAll('.section-nav.docs-links').forEach(function (nav) {
  nav.querySelectorAll('details').forEach(function (details) {
    details.addEventListener('toggle', function () {
      if (!details.open) return;
      nav.querySelectorAll('details').forEach(function (other) {
        if (other !== details) other.open = false;
      });
    });
  });
});
