(function () {
  var joinModal = document.getElementById("joinModal");
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
  document.querySelectorAll(".join-integra").forEach(function (button) {
    button.addEventListener("click", openJoinModal);
  });
  if (joinModal) {
    joinModal.querySelectorAll(".join-modal-close, .join-modal-backdrop").forEach(function (button) {
      button.addEventListener("click", closeJoinModal);
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && joinModal && !joinModal.hidden) closeJoinModal();
  });

  var $ = function (s, c) {
      return (c || document).querySelector(s);
    },
    $$ = function (s, c) {
      return [].slice.call((c || document).querySelectorAll(s));
    };
  function cl(x, a, b) {
    return x < a ? a : x > b ? b : x;
  }
  function ease(p) {
    return p * p * (3 - 2 * p);
  }
  function seg(p, a, b) {
    return cl((p - a) / (b - a), 0, 1);
  }
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var IDS = [
      "hero",
      "belief",
      "reach",
      "paths",
      "app",
      "pillars",
      "stories",
      "faq",
      "join",
    ],
    LAND = {
      hero: 0,
      belief: 0,
      reach: 0.58,
      paths: 0.5,
      app: 0.14,
      pillars: 0,
      stories: 0,
      faq: 0,
      join: 0,
    },
    DARK = { 0: 1, 1: 1, 2: 1, 5: 1, 7: 1 };
  var programmaticScroll = false,
    S = {},
    vh,
    vw,
    y = 0,
    ty = 0,
    menuOpen = false;

  /* ---- words & shapes ---- */
  var wEl = $("#words"),
    ws;
  wEl.innerHTML = wEl.textContent
    .trim()
    .split(/\s+/)
    .map(function (w) {
      var m = w.match(/^\{(.)\}$/);
      return m ? '<i class="sh ' + m[1] + '"></i>' : "<span>" + w + "</span>";
    })
    .join(" ");
  ws = wEl.children;
  function shape(el, t) {
    t = ease(t);
    var type = ["r", "y", "b", "g"].find(function (name) {
        return el.classList.contains(name);
      }),
      size = {
        r: [0.62, 0.62],
        y: [1.5, 0.62],
        b: [1.1, 0.55],
        g: [0.95, 0.72],
      }[type],
      wobble = Math.sin(t * Math.PI),
      scale = 0.7 + 0.3 * t + 0.2 * wobble;
    el.style.width = size[0] * t + "em";
    el.style.height = size[1] * t + "em";
    el.style.marginInline = 0.14 * t + "em";
    el.style.opacity = t === 0 ? 0 : 0.25 + 0.75 * t;
    if (type === "r") {
      el.style.borderRadius =
        50 +
        10 * wobble +
        "% " +
        (50 - 10 * wobble) +
        "% " +
        (50 + 6 * wobble) +
        "% " +
        (50 - 6 * wobble) +
        "% / 50% 50% 50% 50%";
      el.style.transform =
        "rotate(" + 18 * wobble + "deg) scale(" + scale + ")";
    } else if (type === "y") {
      el.style.borderRadius =
        50 -
        28 * wobble +
        "% " +
        (50 + 22 * wobble) +
        "% " +
        (50 - 28 * wobble) +
        "% " +
        (50 + 22 * wobble) +
        "%";
      el.style.transform =
        "skewX(" +
        14 * wobble +
        "deg) rotate(" +
        -8 * wobble +
        "deg) scale(" +
        scale +
        ")";
    } else if (type === "b") {
      el.style.borderRadius =
        "55% 55% " + 24 * wobble + "% " + 8 * wobble + "%";
      el.style.transform =
        "translateY(" + -0.12 * wobble + "em) scale(" + scale + ")";
    } else {
      el.style.borderRadius =
        24 +
        18 * wobble +
        "% " +
        (24 - 8 * wobble) +
        "% " +
        (24 + 12 * wobble) +
        "% " +
        (24 - 10 * wobble) +
        "%";
      el.style.transform =
        "rotate(" + 45 * (1 - t) + "deg) scale(" + scale + ")";
    }
  }

  /* ---- count-up ---- */
  var cs = $$("[data-count]"),
    cuId = 0,
    cuOn = false;
  function setCount(f) {
    cs.forEach(function (el) {
      el.textContent =
        (el.dataset.pre || "") +
        Math.round(+el.dataset.count * f) +
        (el.dataset.suf || "");
    });
  }
  function runCount() {
    var id = ++cuId,
      t0 = performance.now();
    (function tick(n) {
      if (id !== cuId) return;
      var p = cl((n - t0) / 1900, 0, 1);
      setCount(1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  setCount(0);

  /* ---- elements ---- */
  var heroPhoto = $("#heroPhoto"),
    heroCopy = $("#heroCopy"),
    heroShade = $("#heroShade"),
    hint = $("#hint");
  var reachImg = $("#reachImg"),
    reachBg = $("#reachBg"),
    veil = $("#veil"),
    reachCopy = $("#reachCopy"),
    stats = $$(".stat");
  var track = $("#track"),
    pcards = $$(".pcard");
  var app = $("#app"),
    appText = $("#appText"),
    appMobile = $("#appMobile"),
    mobileFeatureSteps = [],
    appHeadings = $$("#appHeadings > div"),
    appDescriptions = $$(".app-descriptions > div"),
    phoneWrap = $("#phoneWrap"),
    screens = $$(".screen"),
    ticks = $$(".ticks i"),
    storyTrack = $("#storiesTrack"),
    storyCards = $$(".scard"),
    storyPrev = $("#storyPrev"),
    storyNext = $("#storyNext"),
    storyLoopWidth = 0;
  var featureBackgrounds = ["#f3f6f8", "#e5edf0", "#f1eef7", "#eef2e1"];
  screens.forEach(function (screen, i) {
    var step = document.createElement("div"),
      feature = document.createElement("article"),
      heading = document.createElement("div"),
      index = document.createElement("span"),
      title = document.createElement("h2"),
      device = document.createElement("div"),
      screenFrame = document.createElement("div"),
      ui = screen.cloneNode(true),
      description = document.createElement("p");
    feature.className = "app-feature";
    feature.style.setProperty("--feature-bg", featureBackgrounds[i]);
    step.className = "app-feature-step";
    step.style.zIndex = i + 1;
    heading.className = "app-feature-heading";
    index.className = "app-feature-index";
    index.textContent = "0" + (i + 1) + " / 04";
    title.textContent = appHeadings[i].textContent;
    heading.append(index, title);
    feature.append(heading);
    device.className = "phone app-mobile-phone";
    device.setAttribute("aria-hidden", "true");
    screenFrame.className = "screens";
    ui.className = "app-mobile-ui";
    ui.style.opacity = "";
    ui.style.transform = "";
    ui.style.clipPath = "";
    ui.style.translate = "";
    screenFrame.append(ui);
    device.append(screenFrame);
    feature.append(device);
    description.className = "app-feature-copy";
    description.textContent = appDescriptions[i].textContent;
    feature.append(description);
    step.append(feature);
    appMobile.append(step);
    mobileFeatureSteps.push({ step: step, feature: feature });
  });
  var mobileCta = document.createElement("div"),
    mobileCtaLink = document.createElement("a"),
    mobileCtaIcon = document.createElement("img");
  mobileCta.className = "app-mobile-cta";
  mobileCtaLink.className = "btn btn-dark";
  mobileCtaLink.href = "#";
  mobileCtaLink.type = "button";
  mobileCtaIcon.className = "play-icon";
  mobileCtaIcon.src = "play-store.svg";
  mobileCtaIcon.alt = "";
  mobileCtaIcon.setAttribute("aria-hidden", "true");
  var mobileAppleIcon = document.createElement("img");
  mobileAppleIcon.className = "apple-icon";
  mobileAppleIcon.src = "apple-store.svg";
  mobileAppleIcon.alt = "";
  mobileAppleIcon.setAttribute("aria-hidden", "true");
  mobileCtaLink.append(mobileAppleIcon, mobileCtaIcon, document.createTextNode("Join INTEGRA"));
  mobileCtaLink.addEventListener("click", function (event) {
    event.preventDefault();
    openJoinModal();
  });
  mobileCta.append(mobileCtaLink);
  appMobile.append(mobileCta);
  for (var copyIndex = 0; copyIndex < 2; copyIndex++) {
    storyCards.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.removeAttribute("data-par");
      clone.querySelectorAll("[data-par]").forEach(function (el) {
        el.removeAttribute("data-par");
      });
      storyTrack.append(clone);
    });
  }
  var BG = ["#F27B18", "#D8C5E4", "#E3FF6A", "#C9DFE9"].map(function (h) {
    return [1, 3, 5].map(function (q) {
      return parseInt(h.substr(q, 2), 16);
    });
  });
  var par = $$("[data-par]").map(function (el) {
    return { el: el, f: parseFloat(el.dataset.par), base: 0 };
  });
  var dots = $("#dots"),
    lastActive = -1;
  IDS.forEach(function (id, k) {
    var b = document.createElement("button");
    b.setAttribute("aria-label", "Go to section " + (k + 1));
    b.onclick = function () {
      go(id);
    };
    dots.appendChild(b);
  });

  function getStoryGroupWidth() {
    var first = storyCards[0],
      last = storyCards[storyCards.length - 1];
    return (
      last.offsetLeft - first.offsetLeft + first.getBoundingClientRect().width
    );
  }
  function centerMobileStoryLoop() {
    if (vw <= 780) {
      storyLoopWidth = getStoryGroupWidth();
      storyTrack.scrollLeft = storyLoopWidth;
    }
  }
  storyTrack.addEventListener(
    "scroll",
    function () {
      if (vw > 780 || !storyLoopWidth) return;
      if (storyTrack.scrollLeft < storyLoopWidth * 0.5) {
        storyTrack.scrollLeft += storyLoopWidth;
      } else if (storyTrack.scrollLeft > storyLoopWidth * 2) {
        storyTrack.scrollLeft -= storyLoopWidth;
      }
    },
    { passive: true },
  );
  storyPrev.addEventListener("click", function () {
    if (vw <= 780) {
      storyTrack.scrollBy({
        left: -(storyCards[0].getBoundingClientRect().width + 14),
        behavior: reduce ? "auto" : "smooth",
      });
    } else {
      var p = prog("stories");
      programmaticScroll = true;
      ty = cl(
        S.stories.top +
          cl(p - 1 / (storyCards.length - 1), 0, 1) * (S.stories.h - vh),
        0,
        maxY,
      );
    }
  });
  storyNext.addEventListener("click", function () {
    if (vw <= 780) {
      storyTrack.scrollBy({
        left: storyCards[0].getBoundingClientRect().width + 14,
        behavior: reduce ? "auto" : "smooth",
      });
    } else {
      var p = prog("stories");
      programmaticScroll = true;
      ty = cl(
        S.stories.top +
          cl(p + 1 / (storyCards.length - 1), 0, 1) * (S.stories.h - vh),
        0,
        maxY,
      );
    }
  });

  function measure() {
    vh = innerHeight;
    vw = innerWidth;
    IDS.forEach(function (id) {
      var e = $("#" + id);
      S[id] = { el: e, top: e.offsetTop, h: e.offsetHeight };
    });
    par.forEach(function (it) {
      it.el.style.translate = "";
      var r = it.el.getBoundingClientRect();
      it.base = r.top + (window.pageYOffset || 0) + r.height / 2;
    });
    maxY = document.documentElement.scrollHeight - vh;
  }
  var maxY = 0;
  function prog(id) {
    var s = S[id];
    return cl((y - s.top) / (s.h - vh), 0, 1);
  }

  /* ---- render: everything is a function of the scroll position ---- */
  function render() {
    var s = cl(y / vh, 0, 1);
    /* hero: photo drifts the opposite way, copy leaves faster */
    heroPhoto.style.transform =
      "translate3d(0," + y * 0.28 + "px,0) scale(" + (1.02 + 0.05 * s) + ")";
    heroCopy.style.transform = "translate3d(0," + -y * 0.2 + "px,0)";
    heroCopy.style.opacity = 1 - cl(s * 1.35, 0, 1);
    heroShade.style.opacity = s * 0.55;
    hint.style.opacity = y > 30 ? 0 : 1;

    /* belief: words + shapes */
    var p = prog("belief"),
      w = seg(p, 0.06, 0.74),
      L = ws.length,
      i;
    for (i = 0; i < L; i++) {
      var t = cl(w * (L + 3) - i, 0, 1);
      if (ws[i].tagName === "I") shape(ws[i], t);
      else ws[i].style.opacity = 0.15 + 0.85 * ease(t);
    }

    /* reach: image grows from the centre, then copy and numbers arrive */
    p = prog("reach");
    var g = ease(seg(p, 0, 0.3)),
      side = (vw > vh ? 22 : 7) * (1 - g),
      tb = (vw > vh ? 16 : 20) * (1 - g);
    reachImg.style.clipPath =
      "inset(" +
      tb +
      "% " +
      side +
      "% " +
      tb +
      "% " +
      side +
      "% round " +
      28 * (1 - g) +
      "px)";
    reachBg.style.transform =
      "translate3d(0," +
      (p - 0.5) * -9 +
      "%,0) scale(" +
      (1.12 - 0.12 * g) +
      ")";
    veil.style.opacity = ease(seg(p, 0.22, 0.4));
    var c = ease(seg(p, 0.34, 0.48));
    reachCopy.style.opacity = c;
    reachCopy.style.transform = "translate3d(0," + (1 - c) * 34 + "px,0)";
    stats.forEach(function (el, k) {
      var q = ease(seg(p, 0.5 + k * 0.035, 0.62 + k * 0.035));
      el.style.opacity = q;
      el.style.transform = "translate3d(0," + (1 - q) * 30 + "px,0)";
    });
    if (p > 0.5 && !cuOn) {
      cuOn = true;
      runCount();
    } else if (p < 0.3 && cuOn) {
      cuOn = false;
      cuId++;
      setCount(0);
    }

    /* paths: cards rise one after another, then the row slides */
    p = prog("paths");
    pcards.forEach(function (el, k) {
      var q = ease(seg(p, 0.04 + k * 0.05, 0.28 + k * 0.05));
      el.style.opacity = Math.min(1, q * 1.8);
      el.style.transform = "translate3d(0," + (1 - q) * vh * 0.75 + "px,0)";
    });
    var tl = parseFloat(getComputedStyle(track).left) || 0,
      shift = Math.max(0, track.scrollWidth + tl * 2 - vw);
    track.style.transform =
      "translate3d(" + -shift * ease(seg(p, 0.42, 0.92)) + "px,0,0)";

    /* app: centered phone and paired copy transition together */
    p = prog("app");
    if (vw <= 780) {
      var mobileTrackTop = appMobile.getBoundingClientRect().top + y;
      mobileFeatureSteps.forEach(function (item, i) {
        var feature = item.feature;
        if (i === 0) {
          feature.style.transform = "translate3d(0,0,0)";
          return;
        }
        var featureTop = mobileTrackTop + item.step.offsetTop,
          enter = reduce
            ? 1
            : ease(seg(y, featureTop - vh * 0.3, featureTop + vh * 0.08));
        feature.style.transform = "translate3d(" + (1 - enter) * 100 + "%,0,0)";
      });
    } else {
      mobileFeatureSteps.forEach(function (item) {
        item.feature.style.transform = "";
      });
    }
    var rise = ease(seg(p, 0, 0.14));
    phoneWrap.style.transform = "translate3d(0,0,0)";
    appText.style.opacity = rise;
    var f = seg(p, 0.08, 0.96) * 4;
    var activeScreen = Math.min(Math.floor(f), screens.length - 1),
      stageProgress = f - activeScreen,
      screenProgress = ease(seg(stageProgress, 0.7, 1)),
      copyExit = ease(seg(screenProgress, 0.2, 0.52)),
      copyEnter = ease(seg(screenProgress, 0.48, 0.8)),
      copyShift = vw <= 780 ? 34 : 180;
    for (i = 0; i < 4; i++) {
      var d = f - i,
        a = Math.abs(d),
        o = cl(1 - a, 0, 1);
      screens[i].style.opacity =
        i === activeScreen || i === activeScreen + 1 ? 1 : 0;
      screens[i].style.clipPath = "inset(0)";
      screens[i].style.transform =
        "translate3d(" +
        (i === activeScreen + 1 ? (1 - screenProgress) * 100 : 0) +
        "%,0,0)";
      [appHeadings[i], appDescriptions[i]].forEach(function (el) {
        var isCurrent = i === activeScreen,
          isNext = i === activeScreen + 1,
          opacity = isCurrent ? 1 - copyExit : isNext ? copyEnter : 0;
        if (vw <= 780) {
          el.style.opacity = opacity;
          el.style.transform = "translate3d(0,0,0)";
        } else {
          var copyY = isCurrent
            ? -copyExit * copyShift
            : isNext
              ? (1 - copyEnter) * copyShift
              : 0;
          el.style.opacity = opacity;
          el.style.transform = "translate3d(0," + copyY + "px,0)";
        }
      });
      ticks[i].style.width = 6 + 30 * o + "px";
      ticks[i].style.opacity = 0.25 + 0.65 * o;
    }
    var i0 = Math.min(Math.floor(f), BG.length - 2),
      tq = cl(f - i0, 0, 1);
    app.style.background =
      "rgb(" +
      [0, 1, 2].map(function (q) {
        return Math.round(BG[i0][q] + (BG[i0 + 1][q] - BG[i0][q]) * tq);
      }) +
      ")";

    /* stories: center each member card as the section scrolls */
    p = prog("stories");
    if (vw <= 780) {
      storyTrack.style.transform = "none";
      storyCards.forEach(function (el) {
        el.style.opacity = 1;
        el.style.transform = "none";
      });
    } else {
      var storyWidth = storyCards[0].getBoundingClientRect().width,
        storyGap = parseFloat(getComputedStyle(storyTrack).gap) || 0,
        storyTravel = Math.max(0, getStoryGroupWidth() - storyWidth),
        storyShift = p * storyTravel,
        storyStart = (vw - storyWidth) / 2;
      storyTrack.style.transform =
        "translate3d(" + (storyStart - storyShift) + "px,-50%,0)";
      storyCards.forEach(function (el) {
        var center = storyStart - storyShift + el.offsetLeft + storyWidth / 2,
          distance = cl(
            Math.abs(center - vw / 2) / (storyWidth + storyGap),
            0,
            1,
          );
        el.style.opacity = 1 - distance * 0.38;
        el.style.transform =
          "translate3d(0," +
          distance * 18 +
          "px,0) scale(" +
          (1 - distance * 0.1) +
          ")";
      });
    }

    /* free-flowing parallax layers: positive = lags behind, negative = runs ahead */
    for (i = 0; i < par.length; i++) {
      var it = par[i],
        off = it.base - y - vh / 2;
      if (vw <= 780 && it.el.closest("#stories")) continue;
      if (Math.abs(off) < vh * 1.6)
        it.el.style.translate = "0 " + off * it.f + "px";
    }

    /* dots + ui colour */
    var act = 0;
    IDS.forEach(function (id, k) {
      if (y + vh * 0.5 >= S[id].top) act = k;
    });
    if (act !== lastActive) {
      lastActive = act;
      document.documentElement.style.setProperty(
        "--ui",
        DARK[act] ? "#fff" : "#17181C",
      );
      $$("button", dots).forEach(function (b, j) {
        b.classList.toggle("on", j === act);
      });
    }
  }

  /* ---- scripted scrolling; native touch scroll stays in control ---- */
  function go(id) {
    ty = cl(S[id].top + LAND[id] * (S[id].h - vh), 0, maxY);
    if (vw <= 780) {
      programmaticScroll = false;
      scrollTo({ top: ty, behavior: reduce ? "auto" : "smooth" });
    } else {
      programmaticScroll = true;
    }
  }
  function frame(now) {
    var dt = Math.min(0.05, (now - (frame.t || now)) / 1000);
    frame.t = now;
    if (programmaticScroll) {
      if (!reduce) y += (ty - y) * (1 - Math.exp(-dt * 8));
      else y = ty;
      if (Math.abs(ty - y) < 0.1) {
        y = ty;
        programmaticScroll = false;
      }
      if (Math.abs((window.pageYOffset || 0) - y) > 0.4) scrollTo(0, y);
    } else {
      y = ty = window.pageYOffset || 0;
    }
    if (frame.last !== y) {
      frame.last = y;
      render();
    }
    requestAnimationFrame(frame);
  }
  addEventListener(
    "wheel",
    function (e) {
      if (menuOpen || e.ctrlKey) return;
      e.preventDefault();
      programmaticScroll = true;
      ty = cl(
        ty + e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh : 1),
        0,
        maxY,
      );
    },
    { passive: false },
  );
  addEventListener(
    "scroll",
    function () {
      /* touch, scrollbar, anything native */
      if (programmaticScroll) return;
      y = ty = window.pageYOffset || 0;
      frame.last = -1;
    },
    { passive: true },
  );
  addEventListener(
    "touchstart",
    function () {
      if (!programmaticScroll) return;
      programmaticScroll = false;
      y = ty = window.pageYOffset || 0;
      frame.last = -1;
    },
    { passive: true },
  );
  addEventListener("keydown", function (e) {
    if (menuOpen) {
      if (e.key === "Escape") toggleMenu(false);
      return;
    }
    var k = e.key,
      d = 0;
    if (k === "ArrowDown") d = 90;
    else if (k === "ArrowUp") d = -90;
    else if (k === "PageDown" || (k === " " && !e.shiftKey)) d = vh * 0.85;
    else if (k === "PageUp" || (k === " " && e.shiftKey)) d = -vh * 0.85;
    else if (k === "Home") {
      programmaticScroll = true;
      ty = 0;
      e.preventDefault();
      return;
    } else if (k === "End") {
      programmaticScroll = true;
      ty = maxY;
      e.preventDefault();
      return;
    }
    if (d) {
      e.preventDefault();
      programmaticScroll = true;
      ty = cl(ty + d, 0, maxY);
    }
  });
  addEventListener("resize", function () {
    measure();
    centerMobileStoryLoop();
    programmaticScroll = false;
    y = ty = cl(window.pageYOffset || 0, 0, maxY);
    frame.last = -1;
  });

  /* ---- menu ---- */
  var menu = $("#menu"),
    burger = $("#burger");
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
    document.documentElement.style.setProperty(
      "--ui",
      on ? "#fff" : DARK[lastActive] ? "#fff" : "#17181C",
    );
  }
  burger.addEventListener("click", function () {
    toggleMenu(!menuOpen);
  });
  $$("[data-go]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      if (menuOpen) toggleMenu(false);
      go(a.dataset.go);
    });
  });

  /* ---- faq ---- */
  $$(".q button").forEach(function (b) {
    b.addEventListener("click", function () {
      var q = b.parentNode,
        o = q.classList.contains("open");
      $$(".q").forEach(function (x) {
        x.classList.remove("open");
        $("button", x).setAttribute("aria-expanded", "false");
      });
      if (!o) {
        q.classList.add("open");
        b.setAttribute("aria-expanded", "true");
      }
    });
  });
  /* ---- start ---- */
  measure();
  centerMobileStoryLoop();
  y = ty = window.pageYOffset || 0;
  render();
  addEventListener("load", function () {
    measure();
    centerMobileStoryLoop();
    frame.last = -1;
  });
  requestAnimationFrame(frame);
})();
