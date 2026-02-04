/**
 * Type declarations for CSS Modules.
 *
 * Allows TypeScript to import .module.css files and provides
 * a type-safe mapping of class names to strings.
 */
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
