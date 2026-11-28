(function () {
  var $ = function (s, c) {
      return (c || document).querySelector(s);
    },
    $$ = function (s, c) {
      return [].slice.call((c || document).querySelectorAll(s));
    };
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ---- join modal (same behaviour as the other pages) ---- */
  var joinModal = $("#joinModal");
  function openJoinModal() {
    if (!joinModal) return;
    joinModal.hidden = false;
    document.body.style.overflow = "hidden";
    var close = joinModal.querySelector(".join-modal-close");
    if (close) close.focus();
  }
  function closeJoinModal() {
    if (!joinModal) return;
    joinModal.hidden = true;
    document.body.style.overflow = "";
  }
  $$(".join-integra").forEach(function (button) {
    button.addEventListener("click", function (event) {
      if (button.tagName === "A") event.preventDefault();
      openJoinModal();
    });
  });
  if (joinModal) {
    $$(".join-modal-close, .join-modal-backdrop", joinModal).forEach(function (button) {
      button.addEventListener("click", closeJoinModal);
    });
  }

  /* ---- menu ---- */
  var menu = $("#menu"),
    burger = $("#burger"),
    menuOpen = false;
  $$(".m-it", menu).forEach(function (el, k) {
    el.style.setProperty("--i", k);
  });
  function toggleMenu(on) {
    menuOpen = on;
    document.body.classList.toggle("menu-open", on);
    menu.classList.toggle("open", on);
    burger.classList.toggle("open", on);
    burger.setAttribute("aria-expanded", on);
    burger.setAttribute("aria-label", on ? "Close menu" : "Open menu");
  }
  burger.addEventListener("click", function () {
    toggleMenu(!menuOpen);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (joinModal && !joinModal.hidden) closeJoinModal();
    else if (menuOpen) toggleMenu(false);
  });

  /* ---- section links go to the home page ---- */
  $$("[data-go]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "index.html#" + a.dataset.go;
    });
  });

  /* ---- accordion (same behaviour as the home page FAQ) ---- */
  var qs = $$(".q"),
    groups = $$(".faq-group"),
    navLinks = $$(".faq-nav a"),
    input = $("#faqSearch"),
    clearBtn = $("#faqClear"),
    statusEl = $("#faqStatus"),
    empty = $("#faqEmpty"),
    emptyTerm = $("#faqEmptyTerm"),
    total = qs.length;

  qs.forEach(function (q) {
    var btn = $("button", q),
      qt = $(".qt", q),
      p = $(".a p", q);
    q._btn = btn;
    q._qt = qt;
    q._p = p;
    q._qo = qt.innerHTML;
    q._ao = p.innerHTML;
    q._text = (qt.textContent + " " + p.textContent).toLowerCase();
    btn.addEventListener("click", function () {
      var wasOpen = q.classList.contains("open");
      qs.forEach(function (x) {
        x.classList.remove("open");
        x._btn.setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        q.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---- search ---- */
  function esc(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function highlight(root, re) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null),
      nodes = [],
      n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var text = node.nodeValue;
      re.lastIndex = 0;
      if (!re.test(text)) return;
      re.lastIndex = 0;
      var frag = document.createDocumentFragment(),
        last = 0,
        m;
      while ((m = re.exec(text))) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var mark = document.createElement("mark");
        mark.textContent = m[0];
        frag.appendChild(mark);
        last = m.index + m[0].length;
        if (m[0].length === 0) re.lastIndex++;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function runSearch() {
    var raw = input.value.trim(),
      terms = raw.toLowerCase().split(/\s+/).filter(Boolean),
      re = terms.length ? new RegExp(terms.map(esc).join("|"), "gi") : null,
      shown = 0,
      lastShown = null;

    clearBtn.hidden = input.value === "";

    qs.forEach(function (q) {
      var match = terms.every(function (t) {
        return q._text.indexOf(t) > -1;
      });
      q.hidden = !match;
      q._qt.innerHTML = q._qo;
      q._p.innerHTML = q._ao;
      if (match) {
        shown++;
        lastShown = q;
        if (re) {
          highlight(q._qt, re);
          highlight(q._p, re);
        }
      }
    });

    groups.forEach(function (g) {
      var count = $$(".q", g).filter(function (q) {
        return !q.hidden;
      }).length;
      g.hidden = count === 0;
      var link = $('.faq-nav a[data-cat="' + g.dataset.cat + '"]');
      if (link) {
        $("em", link).textContent = count;
        link.classList.toggle("dim", count === 0);
      }
    });

    empty.hidden = shown > 0;
    if (shown === 0) emptyTerm.textContent = raw;
    $(".faq-cta").hidden = false;

    if (!terms.length) {
      statusEl.textContent = total + " questions";
    } else if (shown === 0) {
      statusEl.textContent = "No results";
    } else {
      statusEl.textContent =
        shown + (shown === 1 ? " result" : " results") + " for “" + raw + "”";
    }

    if (terms.length && shown === 1 && lastShown) {
      qs.forEach(function (x) {
        x.classList.remove("open");
        x._btn.setAttribute("aria-expanded", "false");
      });
      lastShown.classList.add("open");
      lastShown._btn.setAttribute("aria-expanded", "true");
    }
  }

  input.addEventListener("input", runSearch);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && input.value) {
      input.value = "";
      runSearch();
    }
  });
  clearBtn.addEventListener("click", function () {
    input.value = "";
    runSearch();
    input.focus();
  });
  document.addEventListener("keydown", function (e) {
    var t = e.target && e.target.tagName;
    if (e.key === "/" && t !== "INPUT" && t !== "TEXTAREA" && t !== "SELECT" && !menuOpen && (!joinModal || joinModal.hidden)) {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });

  /* ---- topic nav: smooth scroll + scroll-spy ---- */
  navLinks.forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.getElementById(a.dataset.cat);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", "#" + a.dataset.cat);
    });
  });
  var navEl = $(".faq-nav");
  function setCurrent(id) {
    navLinks.forEach(function (a) {
      var on = a.dataset.cat === id;
      a.setAttribute("aria-current", on ? "true" : "false");
      /* keep the active topic in view inside the pinned, separately scrolling list */
      if (on && navEl.scrollHeight > navEl.clientHeight + 2 && getComputedStyle($(".faq-side")).position === "sticky") {
        var top = a.offsetTop,
          bottom = top + a.offsetHeight;
        if (top < navEl.scrollTop + 8 || bottom > navEl.scrollTop + navEl.clientHeight - 40) {
          navEl.scrollTo({ top: Math.max(0, top - navEl.clientHeight / 3), behavior: reduce ? "auto" : "smooth" });
        }
      }
    });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) setCurrent(en.target.dataset.cat);
        });
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    groups.forEach(function (g) {
      io.observe(g);
    });
  }
  setCurrent(groups[0] && groups[0].dataset.cat);

  /* ---- floating "Topics" button: shows once the topic list has scrolled away ---- */
  var topBtn = $("#faqTop"),
    side = $(".faq-side"),
    faqsSec = $("#faqs"),
    ticking = false;
  function updateTopBtn() {
    ticking = false;
    var s = side.getBoundingClientRect(),
      f = faqsSec.getBoundingClientRect(),
      vh = window.innerHeight;
    topBtn.classList.toggle("show", s.bottom < 0 && f.bottom > vh * 0.6);
  }
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateTopBtn);
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", updateTopBtn);
  topBtn.addEventListener("click", function (e) {
    e.preventDefault();
    side.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });
  updateTopBtn();

  /* ?q= pre-fills the search; always run once so the counts match the markup */
  var preset = new URLSearchParams(window.location.search).get("q");
  if (preset) input.value = preset;
  runSearch();
})();
