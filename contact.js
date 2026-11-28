(function () {
  var $ = function (s, c) {
      return (c || document).querySelector(s);
    },
    $$ = function (s, c) {
      return [].slice.call((c || document).querySelectorAll(s));
    };

  /* ---- join modal (same behaviour as home page) ---- */
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

  /* ---- topic from ?topic= ---- */
  var topic = $("#cf-topic"),
    param = new URLSearchParams(window.location.search).get("topic");
  if (param && topic) {
    var match = [].slice.call(topic.options).find(function (o) {
      return o.value.toLowerCase() === param.toLowerCase();
    });
    if (match) topic.value = match.value;
  }

  /* ---- form ---- */
  var form = $("#contactForm"),
    status = $("#formStatus");
  function setStatus(msg, isError) {
    status.textContent = msg;
    status.classList.toggle("error", Boolean(isError));
  }
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = form.elements.name,
      email = form.elements.email,
      message = form.elements.message,
      ok = true;
    [name, email, message].forEach(function (f) {
      var valid = f.value.trim() !== "" && (f !== email || /^\S+@\S+\.\S+$/.test(f.value.trim()));
      f.closest(".field").classList.toggle("invalid", !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      setStatus("Please fill in your name, a valid email and a message.", true);
      return;
    }
    var phone = form.elements.phone.value.trim(),
      body =
        "Name: " + name.value.trim() +
        "\nEmail: " + email.value.trim() +
        (phone ? "\nPhone: " + phone : "") +
        "\nTopic: " + form.elements.topic.value +
        "\n\n" + message.value.trim();
    window.location.href =
      "mailto:support@integra.ng?subject=" +
      encodeURIComponent("INTEGRA enquiry: " + form.elements.topic.value) +
      "&body=" + encodeURIComponent(body);
    setStatus("Opening your email app to send this to support@integra.ng.", false);
  });
})();
