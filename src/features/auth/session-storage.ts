import * as SecureStore from "expo-secure-store";
const key = "aives.auth.session";
export const sessionStorage = {
  read: () => SecureStore.getItemAsync(key),
  write: (value: string) =>
    SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }),
  clear: () => SecureStore.deleteItemAsync(key),
};
