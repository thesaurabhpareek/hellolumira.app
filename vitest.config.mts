import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: ['lib/supabase/**', 'lib/resend.ts'],
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        // Safety-critical files must have high coverage
        'lib/emotional-signals.ts': { branches: 100, functions: 100, lines: 100, statements: 100 },
        'lib/pattern-rules.ts': { branches: 90, functions: 100, lines: 90, statements: 90 },
        'lib/baby-age.ts': { branches: 80, functions: 100, lines: 80, statements: 80 },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
