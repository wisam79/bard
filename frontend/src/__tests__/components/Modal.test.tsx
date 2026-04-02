// NOTE: Component tests that render JSX require vite v5+ to resolve
// the @react-refresh virtual module in jsdom environment.
// To enable these tests: upgrade vite from v3 to v5.

import { describe, it } from 'vitest';

describe.skip('Modal (requires vite v5 upgrade)', () => {
  it.todo('does not render when isOpen is false');
  it.todo('renders title and children when open');
  it.todo('calls onClose when close button is clicked');
  it.todo('calls onClose when Escape key is pressed');
  it.todo('renders footer when provided');
});
