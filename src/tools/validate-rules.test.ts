import { readdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const RULES_DIR = resolve(process.cwd(), '.claude/rules')

function parseGlobs(content: string): string[] {
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatter) return []

  const globsLine = frontmatter[1].match(/^globs:\s*"?([^"\n]+)"?/m)
  if (!globsLine) return []

  return globsLine[1].split(',').map(g => g.trim()).filter(Boolean)
}

describe('Claude rules files', () => {
  it('all rules files have a globs field', async () => {
    const files = (await readdir(RULES_DIR)).filter(f => f.endsWith('.md'))
    expect(files.length).toBeGreaterThan(0)

    for (const file of files) {
      const content = await readFile(join(RULES_DIR, file), 'utf-8')
      const globs = parseGlobs(content)
      expect(globs.length, `${file}: missing or empty globs frontmatter`).toBeGreaterThan(0)
    }
  })

  describe('testing.md', () => {
    it('is scoped to test and spec files', async () => {
      const content = await readFile(join(RULES_DIR, 'testing.md'), 'utf-8')
      const globs = parseGlobs(content)

      expect(globs).toContain('**/*.test.ts')
      expect(globs).toContain('**/*.spec.ts')
    })

    it('covers test structure, what to test, and mock data', async () => {
      const content = await readFile(join(RULES_DIR, 'testing.md'), 'utf-8')

      expect(content).toMatch(/##\s+Test structure/i)
      expect(content).toMatch(/##\s+What to test/i)
      expect(content).toMatch(/mock data/i)
    })

    it('does not scope to non-test files', async () => {
      const content = await readFile(join(RULES_DIR, 'testing.md'), 'utf-8')
      const globs = parseGlobs(content)

      for (const glob of globs) {
        expect(glob, `glob "${glob}" should only match test/spec files`).toMatch(
          /\.(test|spec)\./
        )
      }
    })
  })
})
