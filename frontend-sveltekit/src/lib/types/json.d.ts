/**
 * Type declarations for JSON imports
 *
 * Allows importing JSON files from parent directory (data/)
 * Declares module types for menu.json and footer.json
 *
 * @version 1.0
 * @date 2025-11-08
 */

declare module '../../../../data/menu.json' {
  import type { MenuData } from './layout.types';
  const value: MenuData;
  export default value;
}

declare module '../../../../data/footer.json' {
  import type { FooterData } from './layout.types';
  const value: FooterData;
  export default value;
}
