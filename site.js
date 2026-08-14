(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bar = document.getElementById('bar');
  function progress() {
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
  }
  addEventListener('scroll', progress, { passive: true });
  progress();

  var rises = document.querySelectorAll('.rise');
  var counts = document.querySelectorAll('[data-count]');

  function fmt(el, v) {
    var dec = +(el.dataset.decimal || 0), div = +(el.dataset.div || 1), n = v / div;
    var s = dec ? n.toFixed(dec).replace('.', ',') : Math.round(n).toLocaleString('fr-FR');
    el.textContent = s + (el.dataset.suffix || '');
  }

  if (reduced || !('IntersectionObserver' in window)) {
    rises.forEach(function (e) { e.classList.add('in'); });
    counts.forEach(function (e) { fmt(e, +e.dataset.count); });
    return;
  }

  // Longueur réelle de chaque tracé : une valeur devinée trop courte
  // transforme le trait en pointillés au lieu de l'animer.
  document.querySelectorAll('.draw').forEach(function (el) {
    var len = Math.ceil(el.getTotalLength());
    el.style.strokeDasharray = len;
    el.style.strokeDashoffset = len;
  });

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  rises.forEach(function (e) { io.observe(e); });

  var co = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, target = +el.dataset.count, t0 = null;
      co.unobserve(el);
      requestAnimationFrame(function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / 1100, 1);
        fmt(el, target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      });
    });
  }, { threshold: 0.6 });
  counts.forEach(function (e) { co.observe(e); });
})();
