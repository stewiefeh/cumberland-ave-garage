/* Cumberland Ave Garage · interactions
   No template literals in this file on purpose. */

(function () {
  "use strict";
  document.documentElement.classList.add("js");
  if (window.location.search.indexOf("static") !== -1) { document.documentElement.classList.add("no-anim"); }

  /* ---------------- data ---------------- */

  var SERVICES = [
    { no: "WO-01", title: "Diagnostics", copy: "We find the fault before we touch a bolt. No parts-cannon guesses, no mystery labor lines.", tag: "every job starts here" },
    { no: "WO-02", title: "Check engine light", copy: "Codes read and explained in plain English. Cleared when it is actually fixed, not to make the dash quiet.", tag: "CEL" },
    { no: "WO-03", title: "Tires", copy: "Mounting, balancing, and rotating, done on the schedule your tires actually want.", tag: "mount · balance · rotate" },
    { no: "WO-04", title: "Exhaust", copy: "Weld, patch, or replace. Whatever the pipe needs, and nothing the pipe does not.", tag: "repair + replacement" },
    { no: "WO-05", title: "Suspension", copy: "Clunks, leans, and highway wander tracked down and sorted out.", tag: "shocks · springs · bushings" },
    { no: "WO-06", title: "Coolant flushes", copy: "Old coolant out, fresh antifreeze in. Cheap insurance against a cooked engine.", tag: "antifreeze service" },
    { no: "WO-07", title: "Something else?", copy: "This is a full-service auto repair center. Brakes to batteries, if it is shop work, ask us. Bring the car by and tell us what it is doing.", tag: "just ask", wild: true }
  ];

  var REVIEWS_ROW1 = [
    { stars: 5, text: "Super quick, affordable, and knowledgeable. They rode with me to hear where the noise came from, and fixed it again within a few hours. Never charged me for the second visit.", who: "Alec M." },
    { stars: 5, text: "Recently moved to town from out of state. Everyone I talked to was extremely friendly and helpful and got it done for me extremely quickly.", who: "Maureen P." },
    { stars: 5, text: "A reliable shop that is always genuine in their work. They helped me with an ongoing problem in my car and I could not be happier with the service.", who: "Phaelan M." },
    { stars: 5, text: "Honest, fair, and fast. My go-to garage.", who: "Returning customer" }
  ];

  var REVIEWS_ROW2 = [
    { stars: 5, text: "Coming from New York City, where even the smallest repair often involves a long wait and a massive bill, Cumberland Avenue Garage was a breath of fresh air.", who: "Clarence J. H. Jr." },
    { stars: 5, text: "Great garage with fair pricing!", who: "Local driver" },
    { stars: 5, text: "Would recommend to anyone who needs work done on their vehicle.", who: "Phaelan M." },
    { stars: 5, text: "A car mechanic that I feel comfortable going to the next time I have car issues.", who: "Maureen P." }
  ];

  /* day index: 0 Sun ... 6 Sat. minutes since midnight */
  var HOURS = {
    1: { open: 450, close: 1020 },
    2: { open: 450, close: 1020 },
    3: { open: 450, close: 1020 },
    4: { open: 450, close: 1020 },
    5: { open: 450, close: 720 }
  };
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /* ---------------- helpers ---------------- */

  function fmtTime(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var ampm = h >= 12 ? "PM" : "AM";
    var h12 = h % 12;
    if (h12 === 0) { h12 = 12; }
    return h12 + ":" + (m < 10 ? "0" + m : m) + " " + ampm;
  }

  /* New York wall-clock time */
  function nyNow() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "short", hour: "numeric", minute: "numeric", hour12: false
    }).formatToParts(new Date());
    var out = { day: 0, mins: 0 };
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (p.type === "weekday") {
        var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
        out.day = map[p.value];
      }
      if (p.type === "hour") { out.mins += parseInt(p.value, 10) % 24 * 60; }
      if (p.type === "minute") { out.mins += parseInt(p.value, 10); }
    }
    return out;
  }

  function starsHtml(n) {
    var s = "";
    for (var i = 0; i < n; i++) { s += "\u2605"; }
    return s;
  }

  /* ---------------- hours chip + lists ---------------- */

  function renderHours() {
    var now = nyNow();
    var chip = document.getElementById("openChip");
    var todayLine = document.querySelector("[data-live='today-hours']");
    var footerLine = document.querySelector("[data-live='hours-short']");

    var today = HOURS[now.day];
    if (today && now.mins >= today.open && now.mins < today.close) {
      if (chip) {
        chip.textContent = "Open now \u00b7 closes " + fmtTime(today.close);
        chip.classList.remove("chip-closed");
      }
      if (todayLine) { todayLine.textContent = "Today: " + fmtTime(today.open) + " \u2013 " + fmtTime(today.close); }
      if (footerLine) { footerLine.textContent = "Open today until " + fmtTime(today.close); }
    } else {
      /* find next open day */
      var offset = 0;
      var next = null;
      while (offset < 8) {
        var d = (now.day + offset) % 7;
        if (HOURS[d] && (offset > 0 || now.mins < HOURS[d].open)) { next = { day: d, hours: HOURS[d], offset: offset }; break; }
        offset++;
      }
      var label = (offset === 0) ? "today" : (offset === 1 ? "tomorrow" : DAY_NAMES[next.day]);
      if (chip) {
        chip.textContent = "Closed \u00b7 opens " + label + " " + fmtTime(next.hours.open);
        chip.classList.add("chip-closed");
      }
      if (todayLine) {
        todayLine.textContent = today ? "Today: " + fmtTime(today.open) + " \u2013 " + fmtTime(today.close) : "Closed today";
      }
      if (footerLine) { footerLine.textContent = "Opens " + label + " at " + fmtTime(next.hours.open); }
    }

    /* hours board */
    var list = document.getElementById("hoursList");
    if (list) {
      var order = [1, 2, 3, 4, 5, 6, 0];
      var html = "";
      for (var i = 0; i < order.length; i++) {
        var d = order[i];
        var h = HOURS[d];
        var classes = [];
        if (d === now.day) { classes.push("today"); }
        var val;
        if (h) {
          val = fmtTime(h.open) + " \u2013 " + fmtTime(h.close);
        } else {
          val = "Closed";
          classes.push("closed-day");
        }
        html += "<li class='" + classes.join(" ") + "'><span>" + DAY_NAMES[d] + "</span><span>" + val + "</span></li>";
      }
      list.innerHTML = html;
    }
  }
  renderHours();

  /* ---------------- marquee + tickets + reviews ---------------- */

  var marquee = document.getElementById("serviceMarquee");
  if (marquee) {
    var words = ["Check engine lights", "Diagnostics", "Tires", "Exhaust", "Suspension", "Coolant flushes", "Full service"];
    var half = "";
    for (var i = 0; i < words.length; i++) {
      half += "<span class='m-item'>" + words[i] + "</span>";
    }
    marquee.innerHTML = half + half;
  }

  var grid = document.getElementById("ticketGrid");
  if (grid) {
    var tHtml = "";
    for (var j = 0; j < SERVICES.length; j++) {
      var s = SERVICES[j];
      tHtml += "<article class='ticket reveal" + (s.wild ? " ticket-wild" : "") + "' style='--stagger:" + (j % 3) * 0.12 + "s'>"
        + "<div class='ticket-top'><span class='ticket-no'>" + s.no + "</span><span class='ticket-stamp'>IN SERVICE</span></div>"
        + "<h3>" + s.title + "</h3>"
        + "<p>" + s.copy + "</p>"
        + "<span class='ticket-tag'>" + s.tag + "</span>"
        + "</article>";
    }
    grid.innerHTML = tHtml;
  }

  function reviewsHtml(list) {
    var out = "";
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      out += "<article class='review-card'>"
        + "<span class='review-stars' aria-label='" + r.stars + " out of 5 stars'>" + starsHtml(r.stars) + "</span>"
        + "<p class='review-text'>\u201C" + r.text + "\u201D</p>"
        + "<div class='review-meta'><span>" + r.who + "</span><span>Google review</span></div>"
        + "</article>";
    }
    return out;
  }

  var row1 = document.getElementById("reviewRow1");
  var row2 = document.getElementById("reviewRow2");
  if (row1) { row1.innerHTML = reviewsHtml(REVIEWS_ROW1) + reviewsHtml(REVIEWS_ROW1); }
  if (row2) { row2.innerHTML = reviewsHtml(REVIEWS_ROW2) + reviewsHtml(REVIEWS_ROW2); }

  /* ---------------- reveal on scroll ---------------- */

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add("in");
          io.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    for (var r = 0; r < reveals.length; r++) { io.observe(reveals[r]); }
  } else {
    for (var r2 = 0; r2 < reveals.length; r2++) { reveals[r2].classList.add("in"); }
  }

  /* ---------------- counters ---------------- */

  var counters = document.querySelectorAll(".count");
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var start = null;
    var dur = 1200;
    function step(ts) {
      if (!start) { start = ts; }
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) { requestAnimationFrame(step); }
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          runCounter(entries[i].target);
          cio.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.6 });
    for (var c = 0; c < counters.length; c++) { cio.observe(counters[c]); }
  } else {
    for (var c2 = 0; c2 < counters.length; c2++) { runCounter(counters[c2]); }
  }

  /* ---------------- nav ---------------- */

  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    var links = nav.querySelectorAll("a");
    for (var l = 0; l < links.length; l++) {
      links[l].addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    }
  }

  /* ---------------- scroll progress ---------------- */

  var bar = document.getElementById("progressBar");
  function onScroll() {
    if (!bar) { return; }
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    bar.style.width = (p * 100).toFixed(2) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

})();
