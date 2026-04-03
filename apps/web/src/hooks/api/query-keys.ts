/**
 * Query Keys Factory
 * ------------------
 * Centralised query key definitions for TanStack React Query.
 * Follows the factory pattern recommended by TkDodo:
 *   https://tkdodo.eu/blog/effective-react-query-keys
 *
 * Structure: [feature, scope, ...params]
 *
 * Usage:
 *   queryKey: authKeys.checkRegistration("+919876543210")
 *   queryClient.invalidateQueries({ queryKey: authKeys.all })
 */

export const authKeys = {
  all: ["auth"] as const,
  checkRegistration: (phone: string) =>
    [...authKeys.all, "check-registration", phone] as const,
};
