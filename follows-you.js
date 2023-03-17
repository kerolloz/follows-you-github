const $ = document.querySelector.bind(document);
const HOVER_CARD_SELECTOR = ".Popover.js-hovercard-content.position-absolute";

/**
 * returns whether user X is following user Y
 * @param {string} x
 * @param {string} y
 */
async function isFollowing(x, y) {
  const cachekey = new Date().toISOString().split(":")[0];
  // toISOString() '2022-01-02T13:36:43.370Z' => split(":")[0] '2022-01-02T13' Caching by Date & Hour
  // cache is considered valid for an hour
  // https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting
  // X-RateLimit-Limit: 60  => The maximum number of requests you're permitted to make per hour.
  const url = `https://api.github.com/users/${x}/following/${y}?${cachekey}`;
  const response = await fetch(url, { cache: "force-cache" });
  return response.status === 204; // according to github docs 204 means follows
}

/**
 * Follows You
 */
class FY {
  /**
   * creates and returns a `follows you` element
   * @param {...string} classes
   * @returns {HTMLSpanElement} follows you element
   */
  static createElement(...classes) {
    const el = document.createElement("span");
    el.innerText = "follows you";
    el.style.fontSize = "10px";
    el.classList.add(...classes, "label", "text-uppercase", "v-align-middle");
    return el;
  }

  /**
   * shows `follows-you` label on the profile page
   */
  static showOnProfilePage() {
    const stickyBarUsername = $(
      "span.d-table-cell.v-align-middle.lh-condensed.pr-2 > div"
    );
    stickyBarUsername?.after(FY.createElement());
    $("h1.vcard-names").appendChild(FY.createElement());
  }

  /**
   * shows `follows-you` label on the user hover card
   */
  static showOnHoverCard() {
    const hovercardLabel = FY.createElement(
      "mt-2",
      "d-flex",
      "flex-justify-center"
    );
    hovercardLabel.id = "hovercard-follows-you";

    if ($(`#${hovercardLabel.id}`)) return; // already added
    $(`${HOVER_CARD_SELECTOR} .px-3`)?.append(hovercardLabel);
  }
}

(async () => {
  const followsMe = (x) => isFollowing(x, loggedInUsername);
  const loggedInUsername = $("meta[name='user-login']")?.content;

  // PART 1 --------------------------------------------------
  // if I'm logged in and viewing some user's profile page who follows me
  const isProfilePage = !!$(".vcard-fullname");
  const openedProfileUsername = $(".vcard-username")?.innerText;
  const shouldShowOnProfile =
    isProfilePage &&
    loggedInUsername !== openedProfileUsername && // not my profile
    (await followsMe(openedProfileUsername));

  if (shouldShowOnProfile) {
    const PROFILE_TAB_SWITCH = "pjax:end";
    document.addEventListener(PROFILE_TAB_SWITCH, FY.showOnProfilePage);
    document.dispatchEvent(new Event(PROFILE_TAB_SWITCH));
  }

  // PART 2 --------------------------------------------------
  // show on hover card
  const callback = async () => {
    const userimage = $(`${HOVER_CARD_SELECTOR} .avatar-user`);
    if (!userimage) return;
    const username = userimage.getAttribute("alt").substring(1); // @username => username
    if (await followsMe(username)) {
      FY.showOnHoverCard();
    }
  };
  const hovercard = $(HOVER_CARD_SELECTOR);
  new MutationObserver(callback).observe(hovercard, { attributes: true });
})();
