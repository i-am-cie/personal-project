/* MC Notes — the two small interactions this site needs, no libraries. */
(function () {
  'use strict';

  /* 1) Filter the mod cards by category. */
  var filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    var buttons = Array.prototype.slice.call(filterBar.querySelectorAll('.filter-btn'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-cat]'));
    var status = document.querySelector('[data-filter-status]');

    var apply = function (value, label) {
      var shown = 0;
      cards.forEach(function (card) {
        var match = value === 'all' || card.getAttribute('data-cat').split(' ').indexOf(value) !== -1;
        card.classList.toggle('is-hidden', !match);
        card.setAttribute('aria-hidden', match ? 'false' : 'true');
        if (match) { shown += 1; }
      });
      buttons.forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(btn.getAttribute('data-filter') === value));
      });
      if (status) {
        status.textContent = 'Showing ' + shown + ' of ' + cards.length + ' entries' +
          (value === 'all' ? '.' : ' in “' + label + '”.');
      }
    };

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        apply(btn.getAttribute('data-filter'), btn.textContent.trim());
      });
    });
  }

  /* 2) Click any screenshot to see it larger. Esc or a click closes it. */
  var zoomables = Array.prototype.slice.call(document.querySelectorAll('.gallery img, .mod-card-img'));
  if (zoomables.length) {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Enlarged screenshot');
    box.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close">×</button>';
    document.body.appendChild(box);

    var closeBtn = box.querySelector('.lightbox-close');
    var bigImg = null;

    var open = function (src, alt) {
      bigImg = document.createElement('img');
      bigImg.src = src;
      bigImg.alt = alt || '';
      box.appendChild(bigImg);
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    var close = function () {
      box.classList.remove('is-open');
      if (bigImg) { box.removeChild(bigImg); bigImg = null; }
      document.body.style.overflow = '';
    };

    zoomables.forEach(function (img) {
      img.classList.add('zoomable');
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.addEventListener('click', function () { open(img.src, img.alt); });
      img.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open(img.src, img.alt);
        }
      });
    });

    closeBtn.addEventListener('click', close);
    box.addEventListener('click', function (event) {
      if (event.target === box) { close(); }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && box.classList.contains('is-open')) { close(); }
    });
  }
})();
