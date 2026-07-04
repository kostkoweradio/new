/* =====================================================
   Kostkowe Radio — pobierz.js
   Cała treść wersji aplikacji pochodzi z wersje.json.
   Nic w tym pliku nie jest wpisane na sztywno — zmiana
   wersji odbywa się wyłącznie przez edycję wersje.json.
   ===================================================== */

(function () {
  'use strict';

  var JSON_PATH = '/new/wersje.json';
  var HISTORY_MONTHS = 6;
  var MONTH_NAMES_PL = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];

  var els = {
    card:        document.getElementById('version-card'),
    badge:       document.getElementById('version-badge'),
    notice:      document.getElementById('version-notice'),
    version:     document.getElementById('app-version'),
    size:        document.getElementById('app-size'),
    ram:         document.getElementById('app-ram'),
    android:     document.getElementById('app-android'),
    note:        document.getElementById('app-note'),
    downloadBtn: document.getElementById('download-btn'),
    recoWrap:    document.getElementById('recommend-wrap'),
    recoText:    document.getElementById('recommend-text'),
    recoBtn:     document.getElementById('recommend-btn'),
    otherWrap:   document.getElementById('other-versions-wrap'),
    otherList:   document.getElementById('other-versions')
  };

  function formatDatePL(iso) {
    var d = new Date(iso + 'T00:00:00');
    return d.getDate() + ' ' + MONTH_NAMES_PL[d.getMonth()] + ' ' + d.getFullYear();
  }

  function monthsBefore(iso, months) {
    var d = new Date(iso + 'T00:00:00');
    d.setMonth(d.getMonth() - months);
    return d;
  }

  /* Wykrywanie urządzenia jest przybliżone — przeglądarki nie
     udostępniają w pewny sposób dokładnej wersji Androida ani
     ilości RAM (navigator.deviceMemory działa tylko w części
     przeglądarek). Traktujemy to jako pomocniczą wskazówkę. */
  function detectDevice() {
    var ua = navigator.userAgent || '';
    var match = ua.match(/Android\s([0-9]+(?:\.[0-9]+)?)/i);
    return {
      isAndroid: !!match,
      androidVersion: match ? parseFloat(match[1]) : null,
      ramGB: typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null
    };
  }

  function isCompatible(v, device) {
    if (!device.isAndroid) return true;
    if (device.androidVersion !== null && device.androidVersion < v.androidMin) return false;
    if (device.ramGB !== null && device.ramGB < v.ramMinGB) return false;
    return true;
  }

  function renderVersion(v, isLatest) {
    els.badge.textContent   = isLatest ? 'Najnowsza wersja' : 'Starsza wersja';
    els.version.textContent = 'v' + v.version + ' (' + formatDatePL(v.date) + ')';
    els.size.textContent    = v.size;
    els.ram.textContent     = v.ramLabel;
    els.android.textContent = v.androidLabel;
    els.note.textContent    = v.note;
    els.downloadBtn.href    = v.downloadUrl;
  }

  function renderOtherVersions(available, current) {
    var others = available.filter(function (v) { return v.date !== current.date; });
    els.otherWrap.hidden = others.length === 0;
    els.otherList.innerHTML = '';
    others.forEach(function (v) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'version-pill';
      a.href = '/pobierz-kostkowe-radio.html?date=' + v.date;
      a.innerHTML =
        '<span class="material-symbols-rounded" aria-hidden="true">history</span>' +
        'v' + v.version +
        '<span class="version-pill-date">' + formatDatePL(v.date) + '</span>';
      li.appendChild(a);
      els.otherList.appendChild(li);
    });
  }

  function renderRecommendation(fallback) {
    els.recoWrap.hidden = !fallback;
    if (!fallback) return;
    els.recoText.textContent =
      'Wykryliśmy, że Twoje urządzenie może nie spełniać wymagań tej wersji. Zalecamy v' +
      fallback.version + ' (' + formatDatePL(fallback.date) + ').';
    els.recoBtn.href = '/pobierz-kostkowe-radio.html?date=' + fallback.date;
  }

  function showNotice(text) {
    els.notice.textContent = text;
    els.notice.hidden = false;
  }

  async function init() {
    if (!els.card) return;

    var all;
    try {
      var res = await fetch(JSON_PATH);
      if (!res.ok) throw new Error('Błąd sieci');
      all = await res.json();
    } catch (err) {
      els.card.innerHTML = '<p class="version-error">Nie udało się wczytać danych o wersji. Spróbuj odświeżyć stronę.</p>';
      return;
    }

    if (!Array.isArray(all) || all.length === 0) {
      els.card.innerHTML = '<p class="version-error">Brak dostępnych danych o wersji.</p>';
      return;
    }

    var sorted = all.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    var latest = sorted[0];
    var cutoff = monthsBefore(latest.date, HISTORY_MONTHS);
    var available = sorted.filter(function (v) { return new Date(v.date + 'T00:00:00') >= cutoff; });

    var params = new URLSearchParams(window.location.search);
    var requestedDate = params.get('date');

    var current = latest;

    if (requestedDate) {
      var found = sorted.find(function (v) { return v.date === requestedDate; });
      if (found && available.indexOf(found) !== -1) {
        current = found;
      } else if (found) {
        current = latest;
        showNotice('Wskazana wersja jest starsza niż 6 miesięcy i nie jest już dostępna z tej strony. Sprawdź historię wersji poniżej.');
      } else {
        current = latest;
        showNotice('Nie znaleziono wskazanej wersji — pokazujemy najnowszą dostępną.');
      }
    }

    renderVersion(current, current.date === latest.date);
    renderOtherVersions(available, current);

    var device = detectDevice();
    if (!isCompatible(current, device)) {
      var fallback = available.find(function (v) {
        return new Date(v.date) <= new Date(current.date) && isCompatible(v, device);
      });
      renderRecommendation(fallback || null);
    } else {
      renderRecommendation(null);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
