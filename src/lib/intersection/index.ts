// Re-exports the intersection functions to their own module
import * as Intersection from './internal';
export {Intersection};

// NOTE:
// It was somewhat cleaner to export this in one line from src/index.ts
// like so:
// `export * as Intersection from './lib/intersection';`
// But this caused problems for some other applications
// (I think because they were targeting an older JS version).

