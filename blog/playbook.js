(function () {
  "use strict";
  var KEY = "portfolio-sdlc-priority-v1";
  var FIELDS = [
    { key: "reach", step: "1", min: "0" },
    { key: "hours", step: "0.1", min: "0" },
    { key: "weight", step: "0.05", min: "0", max: "1" },
    { key: "conf", step: "0.1", min: "0", max: "1" },
    { key: "effort", step: "0.5", min: "0.5" },
    { key: "risk", step: "1", min: "1", max: "3" }
  ];
  var LABELS = { reach: "Reach per week", hours: "Hours saved per use", weight: "Bottleneck weight", conf: "Confidence", effort: "Effort in person-weeks", risk: "Risk" };
  var EXAMPLES = [
    { name: "AI PR review on every repo", reach: 300, hours: 0.3, weight: 0.25, conf: 1, effort: 1, risk: 1 },
    { name: "Build-failure remediation agent", reach: 120, hours: 0.5, weight: 0.15, conf: 1, effort: 2, risk: 2 },
    { name: "On-call triage agent", reach: 30, hours: 1, weight: 0.3, conf: 0.8, effort: 3, risk: 1 },
    { name: "Ticket-to-PR background agent", reach: 40, hours: 2, weight: 0.1, conf: 0.8, effort: 4, risk: 2 },
    { name: "Custom MCP server for feature flags", reach: 50, hours: 0.2, weight: 0.1, conf: 0.5, effort: 3, risk: 2 },
    { name: "Self-hosted agent runtime", reach: 20, hours: 1, weight: 0.1, conf: 0.5, effort: 12, risk: 2 }
  ];

  function clone(rows) { return rows.map(function (r) { return Object.assign({}, r); }); }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) { /* storage unavailable */ }
    return clone(EXAMPLES);
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch (e) { /* storage unavailable */ } }

  function score(r) {
    var num = (+r.reach || 0) * (+r.hours || 0) * (+r.weight || 0) * (+r.conf || 0);
    var den = (+r.effort || 0) * (+r.risk || 0);
    return den > 0 ? num / den : 0;
  }
  function fmt(n) { return n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2); }

  var rows = load();
  var body = document.getElementById("calc-body");
  if (!body) return;

  function render() {
    body.textContent = "";
    rows.forEach(function (r, i) {
      var tr = document.createElement("tr");
      tr.dataset.index = String(i);
      var rank = document.createElement("td");
      rank.className = "rank";
      tr.appendChild(rank);
      var nameTd = document.createElement("td");
      var name = document.createElement("input");
      name.type = "text"; name.className = "name"; name.id = "calc-" + i + "-name";
      name.value = r.name; name.dataset.field = "name";
      name.setAttribute("aria-label", "Candidate name");
      nameTd.appendChild(name); tr.appendChild(nameTd);
      FIELDS.forEach(function (f) {
        var td = document.createElement("td");
        var input = document.createElement("input");
        input.type = "number"; input.inputMode = "decimal";
        input.id = "calc-" + i + "-" + f.key; input.dataset.field = f.key;
        input.step = f.step; input.min = f.min; if (f.max) input.max = f.max;
        input.value = r[f.key];
        input.setAttribute("aria-label", LABELS[f.key] + " for " + (r.name || "candidate"));
        td.appendChild(input); tr.appendChild(td);
      });
      var sc = document.createElement("td");
      sc.className = "score";
      sc.innerHTML = '<div class="score-val"></div><div class="meter" aria-hidden="true"><span></span></div>';
      tr.appendChild(sc);
      var rm = document.createElement("td");
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "remove"; btn.dataset.remove = String(i);
      btn.setAttribute("aria-label", "Remove " + (r.name || "candidate"));
      btn.textContent = "×";
      rm.appendChild(btn); tr.appendChild(rm);
      body.appendChild(tr);
    });
    update();
  }

  function update() {
    var scores = rows.map(score);
    var max = Math.max.apply(null, scores.concat([0]));
    var order = scores.map(function (s, i) { return [s, i]; }).sort(function (a, b) { return b[0] - a[0]; });
    var ranks = {};
    order.forEach(function (pair, pos) { ranks[pair[1]] = pos + 1; });
    Array.prototype.forEach.call(body.children, function (tr) {
      var i = +tr.dataset.index;
      tr.querySelector(".rank").textContent = String(ranks[i]);
      tr.querySelector(".score-val").textContent = fmt(scores[i]);
      tr.querySelector(".meter span").style.width = (max > 0 ? (scores[i] / max) * 100 : 0) + "%";
    });
  }

  body.addEventListener("input", function (e) {
    var t = e.target;
    var tr = t.closest("tr");
    if (!tr || !t.dataset.field) return;
    var r = rows[+tr.dataset.index];
    r[t.dataset.field] = t.dataset.field === "name" ? t.value : (t.value === "" ? 0 : +t.value);
    save();
    update();
  });
  body.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-remove]");
    if (!b) return;
    rows.splice(+b.dataset.remove, 1);
    save(); render();
  });
  document.getElementById("calc-add").addEventListener("click", function () {
    rows.push({ name: "New candidate", reach: 10, hours: 0.5, weight: 0.2, conf: 0.5, effort: 2, risk: 1 });
    save(); render();
    var last = document.getElementById("calc-" + (rows.length - 1) + "-name");
    if (last) { last.focus(); last.select(); }
  });
  document.getElementById("calc-sort").addEventListener("click", function () {
    rows.sort(function (a, b) { return score(b) - score(a); });
    save(); render();
  });
  document.getElementById("calc-reset").addEventListener("click", function () {
    rows = clone(EXAMPLES);
    save(); render();
  });
  render();

})();
