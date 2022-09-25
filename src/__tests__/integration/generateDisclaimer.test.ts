import { Configuration, Project } from '@yarnpkg/core'
import { xfs, ppath, npath, PortablePath, normalizeLineEndings } from '@yarnpkg/fslib'
import PnpPlugin from '@yarnpkg/plugin-pnp'
import NpmPlugin from '@yarnpkg/plugin-npm'
import { pluginRootDir, getDisclaimer, parseExcludingDependencies } from '../../utils'
import { execSync } from 'child_process'

const expectedRecursiveProduction = normalizeLineEndings(
  '\n',
  xfs.readFileSync(
    ppath.join(__dirname as PortablePath, 'fixtures/expected/disclaimerRecursiveProduction.txt' as PortablePath),
    'utf8'
  )
)
const expectedRecursiveProductionExclude = normalizeLineEndings(
  '\n',
  xfs.readFileSync(
    ppath.join(__dirname as PortablePath, 'fixtures/expected/disclaimerRecursiveProductionExclude.txt' as PortablePath),
    'utf8'
  )
)

describe.each(['pnp', 'node-modules'])('licenses generate-disclaimer (%s)', (linker) => {
  const cwd = npath.join(__dirname, 'fixtures', `test-package-${linker}`)
  beforeAll(() => {
    execSync('yarn', { cwd })
  })

  it('should generate disclaimer recursively for production', () => {
    const stdout = execSync('yarn licenses generate-disclaimer --recursive --production', {
      cwd
    }).toString()
    expect(normalizeLineEndings('\n', stdout)).toBe(expectedRecursiveProduction)
  })

  it('should generate disclaimer recursively for production with exclude', () => {
    const stdout = execSync(
      'yarn licenses generate-disclaimer --recursive --production --exclude="serve,@kizahasi/result,@types/*"',
      {
        cwd
      }
    ).toString()
    expect(normalizeLineEndings('\n', stdout)).toBe(expectedRecursiveProductionExclude)
  })
})
