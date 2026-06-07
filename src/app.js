/* ===========================================================================
   Quiz "Quel type de coccinelle es-tu ?" — Cox Animation
   Application 100 % statique, sans backend, sans cookie, sans donnée perso.
   =========================================================================== */

"use strict";

/* --- Lien officiel de l'association --------------------------------------- */
const OFFICIAL_URL = "https://www.cox-anim.fr";

/* --- Les résultats possibles ---------------------------------------------- */
/* Les photos (assets/results/) proviennent de Wikimedia Commons, sous licence
   libre. Crédits complets dans le README ; rappel court affiché sous l'image. */
const RESULTS = {
  classique: {
    title: "La Coccinelle classique",
    species: "Coccinella septempunctata · la « bête à bon Dieu »",
    desc: "Fidèle, chaleureuse et rassurante : tu es la coccinelle que tout le monde adore voir se poser sur sa main. Sept points, zéro chichi, un grand cœur.",
    joke: "Deux coccinelles font leur jogging. Soudain, l'une s'arrête et s'écrie : « Attends… j'ai un point de côté ! »",
    img: "assets/results/classique.jpg",
    alt: "Coccinelle rouge à sept points posée sur de la mousse",
    credit: "Photo : Flocci Nivis · Wikimedia Commons · CC BY 4.0",
  },
  festive: {
    title: "La Coccinelle festive",
    species: "Psyllobora · la coccinelle jaune à 22 points",
    desc: "Pétillante, lumineuse et toujours partante : tu es l'âme des fêtes du village ! Là où tu poses tes pattes, l'ambiance monte d'un cran.",
    joke: "Une coccinelle entre dans une pharmacie et demande : « Vous n'auriez pas une lotion contre les points noirs, s'il vous plaît ? »",
    img: "assets/results/festive.jpg",
    alt: "Coccinelle jaune à vingt-deux points noirs sur une feuille",
    credit: "Photo : Alex Ashworth-Smith · Wikimedia Commons · CC BY 4.0",
  },
  aventuriere: {
    title: "La Coccinelle aventurière",
    species: "Harmonia axyridis · la coccinelle voyageuse",
    desc: "Curieuse et intrépide, tu n'as pas froid aux élytres ! Nouvelles rencontres, nouveaux horizons : tu explores tout et reviens avec mille histoires.",
    joke: "Une coccinelle attend le mille-pattes pour sortir. Au bout d'une heure, elle s'impatiente : « Tu te dépêches ?! » Et le mille-pattes répond : « Minute ! Je mets mes chaussures ! »",
    img: "assets/results/aventuriere.jpg",
    alt: "Coccinelle asiatique orange à nombreux points sur une feuille",
    credit: "Photo : JackyM59 · Wikimedia Commons · CC BY-SA 4.0",
  },
  zen: {
    title: "La Coccinelle zen",
    species: "Adalia bipunctata · la coccinelle à 2 points",
    desc: "Calme, posée et minimaliste : deux points te suffisent. Tu prends la vie comme elle vient, à ton rythme, et tu mets tout le monde à l'aise.",
    joke: "Quel est le comble pour une coccinelle ? — C'est d'avoir un point de côté !",
    img: "assets/results/zen.jpg",
    alt: "Coccinelle rouge à deux points sur une tige verte",
    credit: "Photo : Victor Heng · Wikimedia Commons · CC0",
  },
};

/* --- Les questions -------------------------------------------------------- */
/* Chaque réponse ajoute un point au profil correspondant. */
const QUESTIONS = [
  {
    q: "C'est le jour de la fête du village. Tu arrives…",
    options: [
      { emoji: "🤗", text: "Pile à l'heure, prêt(e) à dire bonjour à tout le monde", key: "classique" },
      { emoji: "🎉", text: "En avance, pour ne rien rater de l'ambiance", key: "festive" },
      { emoji: "🧭", text: "On verra bien… j'explore d'abord les alentours", key: "aventuriere" },
      { emoji: "😌", text: "Tranquillement, l'important c'est d'y être", key: "zen" },
    ],
  },
  {
    q: "Ta couleur de cœur, ce serait plutôt…",
    options: [
      { emoji: "❤️", text: "Le rouge franc et rassurant", key: "classique" },
      { emoji: "💛", text: "Le jaune soleil qui pétille", key: "festive" },
      { emoji: "🧡", text: "L'orange vif qui ne passe pas inaperçu", key: "aventuriere" },
      { emoji: "🌿", text: "Les teintes douces et naturelles", key: "zen" },
    ],
  },
  {
    q: "Un week-end idéal, pour toi, c'est…",
    options: [
      { emoji: "👪", text: "Un grand repas avec la famille et les amis", key: "classique" },
      { emoji: "💃", text: "Un bal, de la musique et des confettis", key: "festive" },
      { emoji: "🥾", text: "Une rando vers un endroit jamais vu", key: "aventuriere" },
      { emoji: "📖", text: "Un hamac, un livre et zéro réveil", key: "zen" },
    ],
  },
  {
    q: "On te confie l'organisation d'un événement. Ton réflexe ?",
    options: [
      { emoji: "🤝", text: "Fédérer l'équipe, chacun à sa place", key: "classique" },
      { emoji: "✨", text: "Soigner l'ambiance et les surprises", key: "festive" },
      { emoji: "🚀", text: "Proposer une idée folle jamais tentée", key: "aventuriere" },
      { emoji: "🧘", text: "Garder tout le monde calme et serein", key: "zen" },
    ],
  },
  {
    q: "Quelle phrase te ressemble le plus ?",
    options: [
      { emoji: "🫶", text: "« On est tellement mieux ensemble. »", key: "classique" },
      { emoji: "🥳", text: "« La vie est une fête, profitons-en ! »", key: "festive" },
      { emoji: "🌍", text: "« Et si on essayait quelque chose de neuf ? »", key: "aventuriere" },
      { emoji: "☕", text: "« Rien ne sert de courir… »", key: "zen" },
    ],
  },
];

/* --- État du quiz --------------------------------------------------------- */
const card = document.getElementById("card");
let current = 0;
let scores = { classique: 0, festive: 0, aventuriere: 0, zen: 0 };

/* --- Vues ----------------------------------------------------------------- */
function renderIntro() {
  card.innerHTML = `
    <p class="eyebrow">Quiz · Cox Animation</p>
    <h1>Quel type de coccinelle es-tu&nbsp;?</h1>
    <p class="lead">
      ${QUESTIONS.length} petites questions, aucune bonne ou mauvaise réponse,
      et un résultat 100&nbsp;% rigolo. C'est anonyme, sans inscription, et ça
      prend moins d'une minute. Prêt(e) à le découvrir&nbsp;?
    </p>
    <button class="btn btn--primary btn--block" id="start">C'est parti&nbsp;! →</button>
  `;
  document.getElementById("start").addEventListener("click", () => {
    current = 0;
    scores = { classique: 0, festive: 0, aventuriere: 0, zen: 0 };
    renderQuestion();
  });
}

function renderQuestion() {
  const item = QUESTIONS[current];
  const pct = Math.round((current / QUESTIONS.length) * 100);
  card.innerHTML = `
    <div class="progress">
      <div class="progress__bar"><div class="progress__fill" id="fill"></div></div>
      <span class="progress__count">${current + 1} / ${QUESTIONS.length}</span>
    </div>
    <h2 class="question">${item.q}</h2>
    <ul class="options" id="options">
      ${item.options
        .map(
          (o, i) => `
        <li>
          <button class="option" data-key="${o.key}" data-i="${i}">
            <span class="option__emoji" aria-hidden="true">${o.emoji}</span>
            <span>${o.text}</span>
          </button>
        </li>`
        )
        .join("")}
    </ul>
  `;
  // Animate the progress bar after paint.
  requestAnimationFrame(() => {
    document.getElementById("fill").style.width = pct + "%";
  });
  document.querySelectorAll(".option").forEach((btn) => {
    btn.addEventListener("click", () => {
      scores[btn.dataset.key] += 1;
      current += 1;
      if (current < QUESTIONS.length) {
        renderQuestion();
      } else {
        renderResult();
      }
    });
  });
}

function winningKey() {
  // Highest score; ties broken by question order of first occurrence.
  let best = null;
  let bestScore = -1;
  for (const key of Object.keys(RESULTS)) {
    if (scores[key] > bestScore) {
      bestScore = scores[key];
      best = key;
    }
  }
  return best;
}

function renderResult() {
  const res = RESULTS[winningKey()];
  card.classList.add("result");
  card.innerHTML = `
    <p class="eyebrow">Ton résultat</p>
    <figure class="result__art">
      <img src="${res.img}" alt="${res.alt}" loading="lazy" width="320" height="320" />
      <figcaption class="result__credit">${res.credit}</figcaption>
    </figure>
    <h1 class="result__title">${res.title}</h1>
    <p class="result__species">${res.species}</p>
    <p class="result__desc">${res.desc}</p>
    <div class="joke">
      <p class="joke__label">La petite blague 🐞</p>
      <p class="joke__text">${res.joke}</p>
    </div>
    <div class="result__actions">
      <a class="btn btn--primary btn--block" href="${OFFICIAL_URL}" target="_blank" rel="noopener noreferrer">
        (re)Découvrir Cox Animation
      </a>
      <button class="btn btn--ghost" id="restart">↺ Refaire le quiz</button>
    </div>
  `;
  document.getElementById("restart").addEventListener("click", () => {
    card.classList.remove("result");
    renderIntro();
  });
}

/* --- Démarrage ------------------------------------------------------------ */
renderIntro();
