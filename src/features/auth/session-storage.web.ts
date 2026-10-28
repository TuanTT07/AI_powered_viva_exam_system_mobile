const key = "aives.auth.session";
// Browser preview follows the existing web app: per-tab sessionStorage, never localStorage.
export const sessionStorage = {
  async read() {
    return window.sessionStorage.getItem(key);
  },
  async write(value: string) {
    window.sessionStorage.setItem(key, value);
  },
  async clear() {
    window.sessionStorage.removeItem(key);
  },
};
