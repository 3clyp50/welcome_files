import { fetchApi } from "/js/api.js";
import { store as files } from "/components/modals/file-browser/file-browser-store.js";
import { store as welcome } from "/components/welcome/welcome-store.js";
import { toastFrontendError } from "/components/notifications/notification-store.js";

const ID = "welcome_files.browser";
export const legacyFiles = {
  path: "/a0", pathInput: "/a0", parent: "", entries: [], query: "", loading: false,
  wide: false, request: 0,
  mount() {
    welcome.init();
    try {
      this.path = localStorage.getItem("welcomeFiles.path") || "/a0";
      this.wide = localStorage.getItem("welcomeFiles.wide") === "true";
      if (this.canDismiss && localStorage.getItem(`welcome_hidden_${ID}`) === "true") welcome.dismissSection(ID);
    } catch (error) { console.warn("Could not restore Welcome Files preferences", error); }
    this.pathInput = this.path;
    void this.load(this.path);
  },
  cleanup() { this.request++; this.loading = false; },
  get canDismiss() { return typeof welcome.dismissSection === "function"; },
  get hidden() { return welcome.hiddenSections?.includes(ID) || false; },
  dismiss() { welcome.dismissSection(ID); },
  toggleWidth() {
    this.wide = !this.wide;
    try { localStorage.setItem("welcomeFiles.wide", String(this.wide)); } catch (error) { console.warn(error); }
  },
  get filtered() {
    const query = this.query.trim().toLocaleLowerCase();
    return this.entries.filter(file => file.name.toLocaleLowerCase().includes(query))
      .sort((a, b) => Number(b.is_dir) - Number(a.is_dir) || a.name.localeCompare(b.name, undefined, { numeric: true }));
  },
  async load(path = this.path) {
    const request = ++this.request;
    this.loading = true;
    try {
      const response = await fetchApi(`/get_work_dir_files?path=${encodeURIComponent(path.trim() || "/a0")}`);
      const payload = await response.json();
      if (request !== this.request) return;
      const data = payload.data;
      if (!response.ok || payload.error || data?.error || !data?.current_path) {
        throw new Error(payload.error || data?.error || "Could not open this folder.");
      }
      if (this.path !== data.current_path) this.query = "";
      this.path = this.pathInput = data.current_path;
      this.parent = data.parent_path || "";
      this.entries = (data.entries || []).map(file => ({ ...file, permissions: data.permissions }));
      try { localStorage.setItem("welcomeFiles.path", this.path); } catch (error) { console.warn(error); }
    } catch (error) {
      if (request === this.request) { this.pathInput = this.path; toastFrontendError(error.message, "Welcome Files"); }
    } finally { if (request === this.request) this.loading = false; }
  },
  async open(file) {
    if (this.loading) return;
    if (file.is_dir) return this.load(file.path);
    try { await files.ensureLimits(); await files.openInSurface(file); }
    catch (error) { toastFrontendError(error.message, "Welcome Files"); }
  },
  openFiles() { return files.open(this.path); },
  size(file) { return file.is_dir ? "—" : files.formatFileSize(file.size); },
};
