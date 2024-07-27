const $ = document.querySelector.bind(document);
const HOVER_CARD_SELECTOR = ".Popover.js-hovercard-content.position-absolute";
const HOVER_CARD_FOLLOWS_YOU_ID = "hovercard-follows-you";
const PROFILE_FOLLOWS_YOU_ID = "profile-follows-you";

/**
 * returns whether user X is following user Y
 * @param {string} x
 * @param {string} y
 */
async function isFollowing(x, y) {
  const cacheKey = new Date().toISOString().split(":")[0];
  // toISOString() '2022-01-02T13:36:43.370Z' => split(":")[0] '2022-01-02T13' Caching by Date & Hour
  // cache is considered valid for an hour
  // https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting
  // X-RateLimit-Limit: 60  => The maximum number of requests you're permitted to make per hour.
  const url = `https://api.github.com/users/${x}/following/${y}?${cacheKey}`;
  const response = await fetch(url, { cache: "force-cache" });
  return response.status === 204; // according to github docs, 204 means follows
}

/**
 * Follows You
 */
const FY = {
  /**
   * creates and returns a `follows you` element
   * @param {...string} classes
   * @returns {HTMLSpanElement} follows you element
   */
  createElement(...classes) {
    const el = document.createElement("span");
    el.innerText = "follows you";
    el.style.fontSize = "10px";
    el.classList.add(...classes, "label", "text-uppercase", "v-align-middle");
    return el;
  },

  /**
   * shows `follows-you` label on the profile page
   */
  showOnProfilePage() {
    const element = FY.createElement();
    element.id = PROFILE_FOLLOWS_YOU_ID;

    $("h1.vcard-names")?.appendChild(element);
  },

  /**
   * shows `follows-you` label on the user hover card
   */
  showOnHoverCard() {
    const element = FY.createElement("mt-2", "d-flex", "flex-justify-center");
    element.id = HOVER_CARD_FOLLOWS_YOU_ID;

    $(`${HOVER_CARD_SELECTOR} .px-3`)?.append(element);
  },
};

async function init() {
  const loggedInUsername = $("meta[name='user-login']")?.content;
  const followsMe = (x) => isFollowing(x, loggedInUsername);

  // PART 1 --------------------------------------------------
  // if I'm logged in and viewing some user's profile page who follows me
  const isProfilePage = !!$(".vcard-fullname");
  // extract from current url: github.com/username
  const openedProfileUsername = location.pathname.split("/").pop();
  const shouldShowOnProfile =
    isProfilePage &&
    loggedInUsername !== openedProfileUsername && // not my profile
    !$(`#${PROFILE_FOLLOWS_YOU_ID}`) && // not already shown
    (await followsMe(openedProfileUsername));

  if (shouldShowOnProfile) {
    FY.showOnProfilePage();
  }

  // PART 2 --------------------------------------------------
  // show on hover card
  const hoverCardCallback = async () => {
    // already has the label, return
    if ($(`#${HOVER_CARD_FOLLOWS_YOU_ID}`)) return;
    const userImage = $(`${HOVER_CARD_SELECTOR} .avatar-user`);
    const username = userImage?.getAttribute("alt")?.substring(1); // @username => username
    if (username && (await followsMe(username))) {
      FY.showOnHoverCard();
    }
  };

  const selectedHoverCard = $(HOVER_CARD_SELECTOR);
  new MutationObserver(hoverCardCallback).observe(selectedHoverCard, {
    attributes: true,
  });
}

document.documentElement.addEventListener("turbo:load", init);
