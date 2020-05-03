const $ = document.querySelector.bind(document);

/**
 * returns whether user X follows user Y
 * @param {string} x
 * @param {string} y
 */
async function isFollowing(x, y) {
  const response = await fetch(
    `https://api.github.com/users/${x}/following/${y}`,
    { method: "GET" }
  );
  return response.status === 204; // according to github docs 204 means follows
}

class FollowsYou {
  constructor() {
    this.element = this.createElement();
    this.stickyElement = this.createElement("m-1"); // give it some margin
  }

  /**
   * creates and returns a `follows you` element
   * @param {...string} classes
   * @returns {HTMLSpanElement} follows you element
   */
  createElement(...classes) {
    const el = document.createElement("span");
    el.innerText = "follows you";
    el.style.fontSize = "10px";
    el.classList.add(
      ...classes,
      "label",
      "text-uppercase",
      "bg-gray-dark",
      "v-align-middle"
    );
    return el;
  }

  /**
   * show the created elements on the page
   */
  showElements() {
    const stickyBarUsername = $("span.d-table-cell:nth-child(2) > strong");

    stickyBarUsername.parentNode.insertBefore(
      this.stickyElement,
      stickyBarUsername.nextSibling
    );
    $("h1.vcard-names").appendChild(this.element);
  }
}

let shouldShowFollowsYou = false;

(async () => {
  const isProfilePage = !!$(".vcard-fullname");
  const loggedInUsername = $("meta[name='user-login']").content;
  const openedProfileUsername = $("meta[property='profile:username']").content;

  // if I'm logged in and viewing some user's profile page who follows me
  shouldShowFollowsYou =
    isProfilePage &&
    loggedInUsername !== openedProfileUsername && // not my profile
    (await isFollowing(openedProfileUsername, loggedInUsername));

  if (shouldShowFollowsYou) {
    const f = new FollowsYou();
    const showFollowsYou = f.showElements.bind(f);
    const PROFILE_TAB_SWITCH = "pjax:end";

    showFollowsYou();
    document.addEventListener(PROFILE_TAB_SWITCH, showFollowsYou);
  }
})();
