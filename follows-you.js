const $ = document.querySelector.bind(document);

/**
 * returns whether user X follows user Y
 * @param {string} x
 * @param {string} y
 */
async function isFollowing(x, y) {
  const url = `https://api.github.com/users/${x}/following/${y}`;
  const response = await fetch(url);
  if (response.status === 403) {
    console.error(await response.json());
  }
  return response.status === 204; // according to github docs 204 means follows
}

class FollowsYou {
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
  }

  /**
   * show the created elements on the profile page
   */
  showOnProfilePage() {
    const stickyBarUsername = $(
      ".js-user-profile-sticky-bar > div:nth-child(1) > span:nth-child(2) > strong:nth-child(1)"
    );

    stickyBarUsername.parentNode.insertBefore(
      this.createElement("ml-1"), // give it some margin
      stickyBarUsername.nextSibling
    );
    $("h1.vcard-names").appendChild(this.createElement());
  }
}

let shouldShowFollowsYou = false;

(async () => {
  const f = new FollowsYou();
  const isProfilePage = !!$(".vcard-fullname");
  const loggedInUsername = $("meta[name='user-login']")?.content;
  const openedProfileUsername = $("meta[property='profile:username']")?.content;

  // if I'm logged in and viewing some user's profile page who follows me
  shouldShowOnProfile =
    isProfilePage &&
    loggedInUsername !== openedProfileUsername && // not my profile
    (await isFollowing(openedProfileUsername, loggedInUsername));

  if (shouldShowOnProfile) {
    const PROFILE_TAB_SWITCH = "pjax:end";
    document.addEventListener(PROFILE_TAB_SWITCH, f.showOnProfilePage.bind(f));
    document.dispatchEvent(new Event(PROFILE_TAB_SWITCH));
  }
})();
