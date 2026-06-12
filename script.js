const state = {
  max: 3,
};

verify_window();

window.addEventListener("resize", () => {
  verify_window();
  charge_film();
});
document.addEventListener("DOMContentLoaded", () => {
  proc_animation();
  charge_historic();
  charge_film();

  let menuBtn = $(".burger_main");
  const sideBar = $("._sidebar_nav");
  let isShow = false;

  $(menuBtn).on("click", function () {
    $(sideBar).toggleClass("showed");
    $(menuBtn).toggleClass("showed");

    isShow = !isShow;
  });

  window.addEventListener("click", (e) => {
    if (!isShow) return;

    if (
      !document.querySelector("._sidebar_nav").contains(e.target) &&
      !document.querySelector(".burger_main").contains(e.target)
    ) {
      $(menuBtn).removeClass("showed");
      $(sideBar).removeClass("showed");
      isShow = false;
    }
  });
});

function verify_window() {
  const docHeight = window.innerWidth;

  if (docHeight < 700) {
    state.max = 1;
  } else if (docHeight < 1000) {
    state.max = 2;
  } else {
    state.max = 3;
  }
}

async function charge_film() {
  const req = await fetch("./film_data.json");
  const f_data = await req.json();

  let radioContainerHTML = "";
  const max = state.max;
  const divs = [];
  let currentGroup = $("<div>");
  divs.push(currentGroup);

  for (let i = 0; i < f_data.length; i++) {
    // SI LE GROUPE ACTUELLE A ATTEINT LE VALEUR MAX, ALORS ON CRÉE UN NOUVEL DIV
    if (currentGroup.children().length === max) {
      currentGroup = $("<div>");
      divs.push(currentGroup);
    }

    const film = f_data[i];
    const { title, img, synopsis, link } = film;

    const htmlString = `
        <div class="_card to-top" id="card${i + 1}">
          <div class="_img_container">
            <img src="${img}" alt="Image du film ${title}" class="_film_img" />
            <h2 class="_film_title">${title}</h2>
          </div>
  
          <p>${synopsis}</p>
  
          <div class="trailer_container">
            <a href="${link}">Watch Trailer</a>
          </div>
        </div> 
      `;

    currentGroup.append(htmlString);
  }

  // VIDER LE CONTENER AVANT D'AJOUTER UN NOUVEL CARD (NETTOYAGE PUOR LE RESIZE)
  $("._card_container").empty();

  $.each(divs, function (i, d) {
    let special_class = "";
    if (i == 0) {
      special_class = "active";
      $(d).addClass("active");
    }

    $(d).addClass("_card_sum");
    $("._card_container").append(d);

    radioContainerHTML += `
      <div class="radio_sum to-top" data-index=${i}>
        <span class="radio ${special_class} " id="radio${i + 1}"></span>
      </div>
    `;
  });

  $(".radio_div").html(radioContainerHTML);

  // Gestion des clics sur les boutons radio
  const tri_film = $("._card_sum");
  $(".radio_sum")
    .off("click")
    .click(function () {
      // .off("click") évite de dupliquer les écouteurs
      const radio_index = Number($(this).data("index"));

      tri_film.removeClass("active");
      $(".radio_sum").find("span").removeClass("active");

      $(tri_film[radio_index]).addClass("active");
      $(this).find("span").addClass("active");
    });
}
function proc_animation() {
  $("._hero_sections").addClass("true");

  // animation du section hero
  gsap.to("._hero_sections", {
    scrollTrigger: {
      trigger: "._a_propos",
      start: "-50% 20%",
      end: "50% 80%",

      onLeave: () => {
        $("._hero_sections").removeClass("true");
      },

      onEnterBack: () => {
        $("._hero_sections").addClass("true");
      },
    },
  });

  // animation du navbar, évènement lié au scroll
  gsap.to("._nav_bars", {
    background: "var(--color-black-hard-text)",
    scrollTrigger: {
      trigger: "._hero_sections",
      start: "50% 20%",
      toggleActions: "play none none reverse",
    },
  });

  // animation du sectio a propos
  gsap_scroll_animation("._a_propos", "._hero_sections");

  // historic transition animation
  gsap_scroll_animation(
    "._transition_box",
    "._historic",
    "-100% 40%",
    "true",
    false,
    {
      onEnter: () => {
        $("._transition_box").addClass("true");
        $("._historic_details").css({
          opacity: 1,
          transform: "translateY(0)",
        });
      },
    },
  );

  // film animation
  gsap_scroll_animation("._film_section", "._historic", "90% 70%", "true");
}

function gsap_scroll_animation(
  obj,
  trigger,
  start = "80% 20%",
  className = "true",
  markers = false,
  toggle = {
    onEnter: () => {
      $(obj).addClass(className);
    },
  },
  body = {},
) {
  gsap.to(obj, {
    scrollTrigger: {
      trigger: trigger,
      start: start,
      end: "bottom bottom",
      markers: markers,

      ...toggle,
    },

    ...body,
  });
}

function charge_historic() {
  const req = fetch("historic_data.json");

  req
    .then((data) => data.json())
    .then((d) => {
      const len = d.length;
      let ul_html = "";
      let historic_html = "";

      for (let i = 0; i < len; i++) {
        const { date, img, src, p } = d[i];
        let specific_class = "";

        if (i == 0) {
          specific_class = "showed";
        }

        ul_html = ul_html.concat(`
          <li style="transition-delay: ${i / 10}s;" class="date_list to-top ${specific_class}">${date}</li>
        `);

        historic_html = historic_html.concat(`
          <div class="historic_element ${specific_class}">
            <img
              src="${img}"
              alt="Image historique du ${date}"
              class="_representation_img to-right"
            />

            <p class="to-left">
              ${p}
              <br />
              <a
                target="_blank"
                class="source"
                href="${src.link}selector"
              >${src.name}
              </a>
            </p>
          </div>
        `);
      }

      $(".date_section").html(ul_html);
      $("._historic_details").html(historic_html);

      gsap_scroll_animation(
        ".date_section",
        "._transition_box",
        "-100% 40%",
        "true",
      );

      // évènement clic de l'historique
      const dates = $(".date_list");
      const historic_element = $(".historic_element");

      $.each(dates, function (i, d) {
        $(d).on("click", function () {
          for (let j = 0; j < dates.length; j++) {
            $(dates[j]).removeClass("showed");
            $(historic_element[j]).removeClass("showed");
          }

          setTimeout(() => {
            $(d).addClass("showed");
            $(historic_element[i]).addClass("showed");
          }, 300);
        });
      });
    })
    .catch((err) => console.log(err));
}
