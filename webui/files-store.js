import { createStore } from "/js/AlpineStore.js";
import * as core from "/components/modals/file-browser/file-browser-store.js";
import { store as welcome } from "/components/welcome/welcome-store.js";
import { legacyFiles } from "/plugins/welcome_files/webui/legacy-files.js";

const ID = "welcome_files.browser";
const browser = typeof core.createFileBrowserView === "function"
  ? core.createFileBrowserView("welcomeFilesBrowser", { embedded: true, rememberKey: "welcomeFiles.path" })
  : null;

export const store = createStore("welcomeFiles", Object.defineProperties({}, {
  ...Object.getOwnPropertyDescriptors(legacyFiles),
  ...Object.getOwnPropertyDescriptors({
    browser,
    get embedded() { return Boolean(this.browser); },
    mount() {
      if (!this.embedded) return legacyFiles.mount.call(this);
      welcome.init();
      try {
        this.wide = localStorage.getItem("welcomeFiles.wide") === "true";
        if (this.canDismiss && localStorage.getItem(`welcome_hidden_${ID}`) === "true") welcome.dismissSection(ID);
      } catch (error) { console.warn("Could not restore Welcome Files preferences", error); }
    },
    cleanup() {
      if (!this.embedded) legacyFiles.cleanup.call(this);
    },
    refresh() {
      if (this.browser && (this.browser.isLoading || this.browser.isRenaming || this.browser.isBulkBusy)) return;
      return this.embedded
        ? this.browser.fetchFiles(this.browser.browser.currentPath, { preserveOnError: true })
        : this.load();
    },
    openFiles() {
      return core.store.open(this.embedded ? this.browser.browser.currentPath : this.path);
    },
  }),
}));
