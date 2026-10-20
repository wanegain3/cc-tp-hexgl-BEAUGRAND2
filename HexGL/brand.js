// Point unique de configuration du branding ACME (données seules, voir work/company-event/plan.md).
window.BRAND = {
  name: "ACME",
  event: "ACME Racing Challenge",
  welcome: "Bienvenue au ACME Racing Challenge",
  subtitle: "Une expérience événementielle aux couleurs de la marque.",
  startLabel: "DÉMARRER LA COURSE",
  logo: "formation/identite/logo.png",
  colors: {
    bg: "#08090D",
    violet: "#7628FF",
    blue: "#315BFF",
    cyan: "#00C4E8",
    white: "#FFFFFF",
    lightGray: "#E6E8EE"
  }
};

// Applique le branding à un document (couleurs en variables CSS, textes, logo). Tolère les éléments absents.
window.BRAND.apply = function (doc) {
  var B = window.BRAND;
  var $ = function (id) { return doc.getElementById(id); };
  var text = function (id, value) { var e = $(id); if (e) e.textContent = value; };
  var k, logo = $("brand-logo"), name = $("brand-name");
  for (k in B.colors) {
    doc.documentElement.style.setProperty("--brand-" + k, B.colors[k]);
  }
  text("brand-welcome", B.welcome);
  text("brand-subtitle", B.subtitle);
  text("start", B.startLabel);
  if (name) name.textContent = B.name;
  if (logo) {
    // Logo en échec : on le masque et le nom ACME en texte prend le relais.
    logo.onerror = function () {
      logo.style.display = "none";
      if (name) name.style.display = "";
    };
    logo.alt = B.name;
    logo.src = B.logo;
  }
};
window.BRAND.apply(document);
