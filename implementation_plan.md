# Implement Role-based Login Flow

Currently, the application allows users to switch between different roles (Farmer, RSK Officer, Mandal Officer, District Officer, State Admin, APRTGS Monitoring) using a quick dropdown menu in the TopNavbar. There is no actual "Login" screen.

This plan outlines the steps to introduce a dedicated Login page, giving each role its own entrance to the application.

## Open Questions

> [!IMPORTANT]
> **Authentication Style:** Do you want a standard login form where you type in a username/password (we can provide mock credentials for each role), or do you prefer a visually appealing "Role Selection" login screen where you simply click on the role you want to log in as?

> [!IMPORTANT]
> **Switch Role Dropdown:** Should we completely remove the "Switch role (demo)" dropdown from the top navigation bar once the login page is in place, and replace it with a "Sign Out" button that takes you back to the login page?

## Proposed Changes

### `src/routes/login.tsx` (New Route)
#### [NEW] login.tsx
- Create a dedicated, beautifully designed login page.
- The page will present options/forms to log in as the different roles defined in the application.
- Upon successful login, the application state will update with the selected role and redirect the user to `/dashboard` (or the appropriate landing page for that role).

### `src/components/layout/TopNavbar.tsx`
#### [MODIFY] TopNavbar.tsx
- Add a "Sign Out" option to the profile dropdown.
- (Pending user feedback) Remove or repurpose the "Switch role (demo)" options.

### `src/lib/store.ts`
#### [MODIFY] store.ts
- Introduce an `isAuthenticated` boolean state.
- Update the store to handle the login and logout actions, persisting the state so a refresh doesn't immediately log the user out.

### Routing Middleware
- Add simple middleware/routing logic to check if the user `isAuthenticated`. If they try to access a protected route without being authenticated, redirect them to `/login`.

## Verification Plan

### Manual Verification
- Attempt to access the `/dashboard` without being logged in and ensure it redirects to `/login`.
- Log in as a "Farmer" and ensure the UI only shows Farmer-specific navigation.
- Log out and ensure the state is cleared and the app redirects back to `/login`.
