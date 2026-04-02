// Mock for @react-refresh virtual module used by @vitejs/plugin-react
// This prevents "file URL" errors when vitest processes React components
export default {};
export const RefreshRuntime = {};
export const injectIntoGlobalHook = () => {};
export const isReactRefreshBoundary = () => false;
export const registerExportsForReactRefresh = () => {};
export const validateRefreshBoundaryAndEnqueueUpdate = () => {};
