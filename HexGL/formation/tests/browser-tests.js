/* Tests du code existant HexGL, sans Node.js. QUnit est chargé localement. */
(function () {
  "use strict";
  if (typeof QUnit === "undefined") {
    document.documentElement.dataset.testStatus = "fail";
    document.documentElement.dataset.testCount = "0";
    document.documentElement.dataset.testFailures = "1";
    document.body.insertAdjacentHTML("afterbegin", "<p style='color:red'>QUnit introuvable : vérifiez le fichier vendor/qunit-2.26.0.js</p>");
    return;
  }

  // Compatible avec le script Chrome headless existant : état mesurable dans le DOM.
  QUnit.done(function (result) {
    const count = result.total;
    const failed = result.failed;
    const root = document.documentElement;
    root.setAttribute("data-test-count", String(count));
    root.setAttribute("data-test-failures", String(failed));
    root.setAttribute("data-test-status", failed === 0 && count >= 4 ? "pass" : "fail");
    let summary = document.getElementById("summary");
    if (!summary) {
      summary = document.createElement("p");
      summary.id = "summary";
      document.body.appendChild(summary);
    }
    summary.textContent = count + " test(s) : " + (count - failed) + " réussi(s), " + failed + " échec(s).";
  });

  const U = window.bkcore && window.bkcore.Utils;
  QUnit.module("HexGL — bkcore.Utils", function () {
    QUnit.test("updateClass ajoute une classe", function (assert) {
      assert.ok(U, "Utils.js chargé");
      const e = document.createElement("div");
      e.id = "test-hexgl-add";
      document.getElementById("qunit-fixture").appendChild(e);
      U.updateClass(e.id, "active", true);
      assert.true(e.classList.contains("active"));
    });
    QUnit.test("updateClass supprime une classe", function (assert) {
      assert.ok(U, "Utils.js chargé");
      const e = document.createElement("div");
      e.id = "test-hexgl-remove";
      e.className = "active";
      document.getElementById("qunit-fixture").appendChild(e);
      U.updateClass(e.id, "active", false);
      assert.false(e.classList.contains("active"));
    });
    QUnit.test("getOffsetTop additionne les décalages parent/enfant", function (assert) {
      const parent = {
        offsetTop: 37,
        offsetParent: null
      };
      const enfant = {
        offsetTop: 13,
        offsetParent: parent
      };
      assert.strictEqual(U.getOffsetTop(enfant), 50);
    });
    QUnit.test("getURLParameter lit les paramètres d'URL", function (assert) {
      assert.ok(U, "Utils.js chargé");
      U.URLParameters = null;
      const url = new URL(window.location.href);
      url.searchParams.set("hexgl_poc", "ok");
      // Le lanceur fournit hexgl_poc=ok ; en ouverture directe, on teste l'absence ou la présence.
      const expected = window.location.search.includes("hexgl_poc=ok") ? "ok" : null;
      assert.strictEqual(U.getURLParameter("hexgl_poc"), expected);
    });
    QUnit.test("getURLParameter renvoie undefined pour un paramètre absent", function (assert) {
      U.URLParameters = null;
      assert.strictEqual(U.getURLParameter("hexgl_absent"), undefined);
    });
  });

  const T = window.bkcore && window.bkcore.Timer;
  QUnit.module("HexGL — bkcore.Timer", function (hooks) {
    // Date.getTime() simulé : le temps ne dépend plus de l'horloge réelle.
    const RealDate = window.Date;
    let now;
    hooks.beforeEach(function () {
      now = 1000000;
      window.Date = function () { this.getTime = function () { return now; }; };
    });
    hooks.afterEach(function () { window.Date = RealDate; });

    QUnit.test("zfill complète avec des zéros sans tronquer", function (assert) {
      assert.strictEqual(T.zfill(7, 2), "07");
      assert.strictEqual(T.zfill(42, 2), "42");
      assert.strictEqual(T.zfill(123, 2), "123");
    });
    QUnit.test("msToTime découpe h/m/s/ms", function (assert) {
      // 1 h 2 min 3 s 456 ms
      const t = T.msToTime(3723456);
      assert.deepEqual([t.h, t.m, t.s, t.ms], [1, 2, 3, 456]);
      assert.deepEqual(T.msToTime(0), { h: 0, m: 0, s: 0, ms: 0 });
    });
    QUnit.test("msToTimeString remplit h/m/s sur 2 chiffres", function (assert) {
      const t = T.msToTimeString(3723456);
      assert.deepEqual([t.h, t.m, t.s], ["01", "02", "03"]);
    });
    QUnit.test("un Timer neuf est inactif et à zéro", function (assert) {
      const timer = new T();
      assert.false(timer.active);
      assert.strictEqual(timer.time.elapsed, 0);
    });
    QUnit.test("start/update mesurent le temps écoulé", function (assert) {
      const timer = new T();
      timer.start();
      assert.true(timer.active);
      now += 1500;
      timer.update();
      assert.strictEqual(timer.time.elapsed, 1500);
      assert.strictEqual(timer.time.delta, 1500);
      assert.strictEqual(timer.getElapsedTime().s, 1);
    });
    QUnit.test("pause(true) fige le temps, pause(false) le reprend", function (assert) {
      const timer = new T();
      timer.start();
      timer.pause(true);
      now += 5000;
      timer.update();
      assert.strictEqual(timer.time.elapsed, 0, "aucune mise à jour en pause");
      timer.pause(false);
      timer.update();
      assert.strictEqual(timer.time.elapsed, 5000);
    });
  });

  const B = window.BRAND;
  QUnit.module("ACME — BRAND (données)", function () {
    QUnit.test("textes d'accueil exacts de la charte", function (assert) {
      assert.ok(B, "brand.js chargé");
      assert.strictEqual(B.welcome, "Bienvenue au ACME Racing Challenge");
      assert.strictEqual(B.subtitle, "Une expérience événementielle aux couleurs de la marque.");
      assert.strictEqual(B.startLabel, "DÉMARRER LA COURSE");
      assert.strictEqual(B.name, "ACME");
      assert.strictEqual(B.event, "ACME Racing Challenge");
    });
    QUnit.test("les couleurs sont exactement la palette de la charte", function (assert) {
      assert.deepEqual(B.colors, {
        bg: "#08090D", violet: "#7628FF", blue: "#315BFF",
        cyan: "#00C4E8", white: "#FFFFFF", lightGray: "#E6E8EE"
      });
    });
    QUnit.test("le logo pointe vers le fichier fourni", function (assert) {
      assert.strictEqual(B.logo, "formation/identite/logo.png");
    });

    // Document isolé : apply() n'altère pas la page de tests.
    function fakeDoc() {
      const d = document.implementation.createHTMLDocument("t");
      d.body.innerHTML = '<img id="brand-logo"><div id="brand-name" style="display:none"></div>' +
        '<h1 id="brand-welcome"></h1><p id="brand-subtitle"></p><div id="start">Start</div>';
      return d;
    }
    QUnit.test("apply remplit les textes et pose les variables CSS", function (assert) {
      const d = fakeDoc();
      B.apply(d);
      assert.strictEqual(d.getElementById("brand-welcome").textContent, B.welcome);
      assert.strictEqual(d.getElementById("brand-subtitle").textContent, B.subtitle);
      assert.strictEqual(d.getElementById("start").textContent, B.startLabel);
      assert.strictEqual(d.getElementById("brand-name").textContent, "ACME");
      assert.strictEqual(d.getElementById("brand-logo").getAttribute("src"), B.logo);
      assert.strictEqual(d.documentElement.style.getPropertyValue("--brand-violet"), "#7628FF");
      assert.strictEqual(d.documentElement.style.getPropertyValue("--brand-bg"), "#08090D");
    });
    QUnit.test("logo en échec : le nom ACME devient visible", function (assert) {
      const d = fakeDoc();
      B.apply(d);
      assert.strictEqual(d.getElementById("brand-name").style.display, "none");
      d.getElementById("brand-logo").onerror();
      assert.strictEqual(d.getElementById("brand-logo").style.display, "none");
      assert.strictEqual(d.getElementById("brand-name").style.display, "");
    });
    QUnit.test("apply tolère un document sans éléments de marque", function (assert) {
      B.apply(document.implementation.createHTMLDocument("vide"));
      assert.ok(true, "pas d'exception");
    });
  });
})();
