/* Leonida Ledger — offline trophy tracker.
   Loads data/trophies.json (a file inside app/), keeps progress in
   localStorage, never makes a network request of its own. */
(function () {
  "use strict";

  var STORAGE_KEY = "gta6-trophy-guide-v1";
  var GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
  var GRADE_TOTALS = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
  var STAGES = [
    { n: 1, title: "Stage 1 — Play the story", text: "Chapters 1 to 4, the named story missions and the final mission. Do these in order: no chapter replay is confirmed in the official description." },
    { n: 2, title: "Stage 2 — Finish the side strands", text: "The final missions for Andy, Kenton, Billy, Randy and Tyrone, plus 8 stranger strands across Leonida. Take each strand when it is offered." },
    { n: 3, title: "Stage 3 — Activities & skills", text: "Shooting Range gold (42), stunts (250), races (20), drone races (14), fishing vs Cal, arcade, bowling, meditation (18) and hunting. The hard skill trophies live here." },
    { n: 4, title: "Stage 4 — Collectibles & world", text: "Card sets (3), WAiNK (100), vehicles (100), all 52 areas of Leonida, garages and Scooter Bros registrations (10). Explore as you travel; finish in free roam." },
    { n: 5, title: "Stage 5 — Cleanup & money", text: "Challenges (50), bank vaults (5), armored trucks, Marked Bills ($250,000), shop spending ($100,000) — then 100% completion and the platinum." }
  ];

  var trophies = [];
  var earned = new Set();
  var counters = {};
  var revealed = new Set();
  var spoilerOn = true;
  var selectedId = null;
  var view = "tracker";

  var params = new URLSearchParams(window.location.search);
  var shot = params.get("shot");

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function byId(id) {
    for (var i = 0; i < trophies.length; i++) if (trophies[i].id === id) return trophies[i];
    return null;
  }
  function gradeLabel(g) { return g.charAt(0).toUpperCase() + g.slice(1); }

  function loadSaved() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (Array.isArray(data.earned)) data.earned.forEach(function (id) { earned.add(Number(id)); });
      if (data.counters && typeof data.counters === "object") counters = data.counters;
      if (typeof data.spoilerOn === "boolean") spoilerOn = data.spoilerOn;
    } catch (e) { /* corrupt save: start fresh */ }
  }
  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        earned: Array.from(earned).sort(function (a, b) { return a - b; }),
        counters: counters,
        spoilerOn: spoilerOn
      }));
    } catch (e) { /* storage full or blocked: tracker still works in memory */ }
  }

  /* Seeded demo progress for the staged screenshots (?shot=...).
     Same 13 earned trophies and part-way counters in every shot. */
  function applySeed() {
    var seedEarned = [2, 3, 8, 20, 21, 33, 42, 44, 46, 47, 52, 53, 55];
    seedEarned.forEach(function (id) { earned.add(id); });
    counters = { 15: 87, 17: 18, 18: 6, 19: 9, 25: 3, 28: 7, 30: 1, 31: 34, 32: 21, 35: 41, 42: 52, 43: 4, 48: 137, 52: 250000, 53: 100000, 54: 3, 55: 10 };
    spoilerOn = true;
    save();
  }

  function isHidden(t) { return spoilerOn && t.hidden && !earned.has(t.id) && !revealed.has(t.id); }

  function filtered() {
    var q = ($("search").value || "").trim().toLowerCase();
    var kind = $("filterKind").value;
    var grade = $("filterGrade").value;
    var status = $("filterStatus").value;
    var list = trophies.filter(function (t) {
      if (kind === "missable") { if (!t.missable) return false; }
      else if (kind !== "all" && t.kind !== kind) return false;
      if (grade !== "all" && t.grade !== grade) return false;
      if (status === "earned" && !earned.has(t.id)) return false;
      if (status === "not" && earned.has(t.id)) return false;
      if (q) {
        var hay = (t.name + " " + t.description + " " + t.kind).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    var sort = $("sortBy").value;
    if (sort === "grade") {
      list.sort(function (a, b) { return (GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]) || (a.id - b.id); });
    } else if (sort === "name") {
      list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    } else {
      list.sort(function (a, b) { return a.id - b.id; });
    }
    return list;
  }

  function renderProgress() {
    var total = trophies.length;
    var n = earned.size;
    $("earnedCount").textContent = String(n);
    $("progressFill").style.width = total ? Math.round((n / total) * 100) + "%" : "0%";
    $("progressBar").setAttribute("aria-valuenow", String(n));
    var parts = [];
    ["platinum", "gold", "silver", "bronze"].forEach(function (g) {
      var c = trophies.filter(function (t) { return t.grade === g && earned.has(t.id); }).length;
      parts.push(gradeLabel(g) + " " + c + "/" + GRADE_TOTALS[g]);
    });
    $("gradeCounts").textContent = parts.join(" · ");
    var stageParts = STAGES.map(function (s) {
      var inStage = trophies.filter(function (t) { return t.stage === s.n; });
      var done = inStage.filter(function (t) { return earned.has(t.id); }).length;
      return "Stage " + s.n + " · " + done + "/" + inStage.length;
    });
    $("stageCounts").textContent = "Roadmap: " + stageParts.join(" · ");
    var next = trophies.filter(function (t) { return !earned.has(t.id); })[0];
    if (next) {
      var stageName = STAGES[next.stage - 1].title;
      $("nextUp").textContent = stageName + " — next trophy: #" + next.id + " " + next.name + " (" + gradeLabel(next.grade) + ").";
    } else {
      $("nextUp").textContent = "All 55 trophies earned — Leonida Legend. The platinum is yours.";
    }
  }

  function renderList() {
    var list = filtered();
    var ul = $("trophyList");
    ul.innerHTML = "";
    $("listMeta").textContent = "Showing " + list.length + " of 55 trophies" +
      (earned.size ? " · " + earned.size + " earned" : "");
    $("emptyMsg").hidden = list.length !== 0;
    list.forEach(function (t) {
      var li = document.createElement("li");
      var isEarned = earned.has(t.id);
      var hidden = isHidden(t);
      li.className = "trophy" + (isEarned ? " earned" : "") + (selectedId === t.id ? " selected" : "");
      li.setAttribute("role", "button");
      li.tabIndex = 0;
      var targetHtml = "";
      if (t.target) {
        var have = counters[t.id] || 0;
        targetHtml = '<span class="target">Target: ' + esc(t.targetLabel || String(t.target)) +
          " · " + have + " / " + t.target + "</span>";
      }
      var nameHtml = hidden
        ? '<span class="locked">🔒 Hidden trophy — earn it to reveal</span>'
        : esc(t.name);
      var descHtml = hidden ? "Hidden on PlayStation until earned." : esc(t.description);
      var flags = '<span class="badge ' + t.grade + '">' + gradeLabel(t.grade) + "</span>" +
        '<span class="kind">' + esc(t.kind) + "</span>" +
        (t.missable ? '<span class="flag">⚠ Missable</span>' : "") +
        (t.hidden && !isEarned ? '<span class="kind">Hidden</span>' : "");
      li.innerHTML =
        '<span class="check" aria-hidden="true">' + (isEarned ? "✓" : "") + "</span>" +
        '<span class="trophy-body">' +
          '<span class="trophy-name">' + nameHtml + "</span><br>" +
          '<span class="trophy-desc">' + descHtml + "</span>" +
          '<span class="trophy-meta">' + flags + targetHtml + "</span>" +
          (hidden ? '<br><button type="button" class="reveal" data-reveal="' + t.id + '">Reveal this trophy</button>' : "") +
        "</span>";
      li.addEventListener("click", function (ev) {
        if (ev.target && ev.target.getAttribute("data-reveal")) return;
        openDetail(t.id);
      });
      li.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openDetail(t.id); }
      });
      ul.appendChild(li);
    });
    ul.querySelectorAll("[data-reveal]").forEach(function (btn) {
      btn.addEventListener("click", function (ev) {
        ev.stopPropagation();
        revealed.add(Number(btn.getAttribute("data-reveal")));
        renderAll();
      });
    });
  }

  function renderDetail() {
    var body = $("detailBody");
    var empty = $("detailEmpty");
    if (!selectedId) { body.hidden = true; empty.hidden = false; return; }
    var t = byId(selectedId);
    if (!t) { body.hidden = true; empty.hidden = false; return; }
    empty.hidden = true;
    body.hidden = false;
    var isEarned = earned.has(t.id);
    var hidden = isHidden(t);
    var steps = (t.steps || []).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
    var sources = (t.sources || []).map(function (s) {
      return '<a href="' + esc(s.url) + '">' + esc(s.name) + "</a>";
    }).join(" · ");
    var targetHtml = "";
    if (t.target) {
      var have = counters[t.id] || 0;
      targetHtml = '<p class="counter">Progress: ' + have + " / " + t.target + " — " + esc(t.targetLabel || "") + "</p>";
    }
    body.innerHTML =
      '<span class="badge ' + t.grade + '">' + gradeLabel(t.grade) + "</span> " +
      '<span class="kind">' + esc(t.kind) + "</span> " +
      (t.missable ? '<span class="flag">⚠ Missable</span>' : "") +
      "<h3>" + (hidden ? "🔒 Hidden trophy" : esc(t.name)) + "</h3>" +
      '<p class="official">Official: “' + (hidden ? "Hidden on PlayStation until earned." : esc(t.description)) + "”</p>" +
      (hidden
        ? '<p class="guide">This trophy is hidden on PlayStation until you earn it. Reveal it from the list, or earn it, to read its guide.</p>'
        : '<p class="guide">' + esc(t.guide) + "</p>" +
          (t.whenMissable ? "<p><strong>When it can be missed:</strong> " + esc(t.whenMissable) + "</p>" : "") +
          targetHtml +
          (steps ? "<p><strong>Steps:</strong></p><ol>" + steps + "</ol>" : "")) +
      '<p class="sources"><strong>Sources:</strong> ' + sources +
      ' · Guide: our own advice from the official description — not yet checked in the game.</p>' +
      '<button type="button" class="earn-btn" id="earnToggle">' +
        (isEarned ? "✓ Earned — click to unmark" : "Mark as earned") + "</button>";
    $("earnToggle").addEventListener("click", function () {
      toggleEarned(t.id);
    });
  }

  function renderRoadmap() {
    var box = $("roadmapStages");
    box.innerHTML = "";
    STAGES.forEach(function (s) {
      var inStage = trophies.filter(function (t) { return t.stage === s.n; });
      var done = inStage.filter(function (t) { return earned.has(t.id); }).length;
      var miss = inStage.filter(function (t) { return t.missable; }).length;
      var div = document.createElement("div");
      div.className = "stage";
      var items = inStage.map(function (t) {
        var name = isHidden(t) ? "🔒 Hidden trophy" : esc(t.name);
        return "<li>" + (earned.has(t.id) ? "✓ " : "○ ") + name + " — " + gradeLabel(t.grade) +
          (t.missable ? " · ⚠ Missable" : "") + "</li>";
      }).join("");
      div.innerHTML = "<h3>" + esc(s.title) + " — " + done + " / " + inStage.length + " earned" +
        (miss ? " · " + miss + " missable" : "") + "</h3>" +
        "<p>" + esc(s.text) + "</p>" +
        '<div class="stagebar"><span style="width:' + Math.round((done / inStage.length) * 100) + '%"></span></div>' +
        "<ul>" + items + "</ul>";
      box.appendChild(div);
    });
  }

  function renderMissables() {
    var box = $("missableList");
    box.innerHTML = "";
    trophies.filter(function (t) { return t.missable; }).forEach(function (t) {
      var div = document.createElement("div");
      div.className = "misscard";
      var name = isHidden(t) ? "🔒 Hidden trophy" : esc(t.name);
      div.innerHTML = "<h3>" + name + ' <span class="badge ' + t.grade + '">' + gradeLabel(t.grade) + "</span></h3>" +
        "<p><strong>Official:</strong> “" + (isHidden(t) ? "Hidden on PlayStation until earned." : esc(t.description)) + "”</p>" +
        "<p><strong>Why it can be missed:</strong> " + esc(t.whenMissable || "Tied to a one-time moment — see the guide.") + "</p>" +
        '<p><button type="button" data-open="' + t.id + '">Open the guide →</button></p>';
      box.appendChild(div);
    });
    box.querySelectorAll("[data-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setView("tracker");
        openDetail(Number(btn.getAttribute("data-open")));
        window.scrollTo(0, 0);
      });
    });
  }

  function renderAll() {
    renderProgress();
    renderList();
    renderDetail();
    renderRoadmap();
    renderMissables();
  }

  function setView(v) {
    view = v;
    ["tracker", "roadmap", "missable"].forEach(function (name) {
      $("view" + name.charAt(0).toUpperCase() + name.slice(1)).hidden = name !== v;
      $("tab" + name.charAt(0).toUpperCase() + name.slice(1)).classList.toggle("active", name === v);
    });
  }

  function openDetail(id) {
    selectedId = id;
    renderList();
    renderDetail();
  }

  function toggleEarned(id) {
    if (earned.has(id)) earned.delete(id); else earned.add(id);
    save();
    renderAll();
  }

  function exportProgress() {
    var payload = {
      app: "Leonida Ledger — GTA 6 Trophy Guide",
      earned: Array.from(earned).sort(function (a, b) { return a - b; }),
      counters: counters,
      spoilerOn: spoilerOn
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "leonida-ledger-progress.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        if (!data || !Array.isArray(data.earned)) throw new Error("bad file");
        earned = new Set(data.earned.map(Number).filter(function (id) { return byId(id); }));
        counters = data.counters && typeof data.counters === "object" ? data.counters : {};
        if (typeof data.spoilerOn === "boolean") { spoilerOn = data.spoilerOn; $("spoilerToggle").checked = spoilerOn; }
        save();
        renderAll();
        window.alert("Progress imported: " + earned.size + " trophies earned.");
      } catch (e) {
        window.alert("That file is not a Leonida Ledger progress export.");
      }
    };
    reader.readAsText(file);
  }

  function bind() {
    document.querySelectorAll(".tab").forEach(function (btn) {
      btn.addEventListener("click", function () { setView(btn.getAttribute("data-view")); });
    });
    ["search", "filterKind", "filterGrade", "filterStatus", "sortBy"].forEach(function (id) {
      $(id).addEventListener("input", renderList);
      $(id).addEventListener("change", renderList);
    });
    $("spoilerToggle").addEventListener("change", function () {
      spoilerOn = $("spoilerToggle").checked;
      save();
      renderAll();
    });
    $("exportBtn").addEventListener("click", exportProgress);
    $("importBtn").addEventListener("click", function () { $("importFile").click(); });
    $("importFile").addEventListener("change", function () {
      if ($("importFile").files && $("importFile").files[0]) importProgress($("importFile").files[0]);
      $("importFile").value = "";
    });
    $("resetBtn").addEventListener("click", function () {
      if (window.confirm("Clear all earned trophies and counters? Export first if you want a backup.")) {
        earned = new Set();
        counters = {};
        selectedId = null;
        save();
        renderAll();
      }
    });
  }

  function start() {
    loadSaved();
    if (shot) applySeed();
    $("spoilerToggle").checked = spoilerOn;
    bind();
    if (shot === "roadmap") setView("roadmap");
    else if (shot === "missable") setView("missable");
    else setView("tracker");
    if (shot === "guide") openDetail(17);
    renderAll();
    if (shot) {
      setTimeout(function () { window.__shotReady = true; }, 350);
    }
  }

  fetch("data/trophies.json")
    .then(function (r) { if (!r.ok) throw new Error("trophies.json failed to load"); return r.json(); })
    .then(function (data) {
      trophies = data.trophies || data;
      trophies.sort(function (a, b) { return a.id - b.id; });
      $("missablePill").textContent = trophies.filter(function (t) { return t.missable; }).length + " flagged";
      start();
    })
    .catch(function (err) {
      document.getElementById("trophyList").innerHTML =
        "<li class='trophy'>Could not load the trophy list (data/trophies.json). " + esc(err.message) + "</li>";
      window.__shotReady = true;
    });
})();
