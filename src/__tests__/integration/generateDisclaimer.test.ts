import { Configuration, Project } from '@yarnpkg/core'
import { xfs, ppath, npath, PortablePath, normalizeLineEndings } from '@yarnpkg/fslib'
import PnpPlugin from '@yarnpkg/plugin-pnp'
import NpmPlugin from '@yarnpkg/plugin-npm'
import { pluginRootDir, getDisclaimer } from '../../utils'
import { execSync } from 'child_process'

const expectedRecursiveProduction = normalizeLineEndings(
  '\n',
  xfs.readFileSync(
    ppath.join(__dirname as PortablePath, 'fixtures/expected/disclaimerRecursiveProduction.txt' as PortablePath),
    'utf8'
  )
)

describe.each(['pnp', 'node-modules'])('licenses generate-disclaimer (%s)', (linker) => {
  const cwd = npath.join(__dirname, 'fixtures', `test-package-${linker}`)
  beforeAll(() => {
    execSync('yarn', { cwd })
  })

  it('should generate disclaimer', () => {
    const exec = () => execSync('yarn licenses generate-disclaimer', {
      cwd
    })
    expect(exec).toThrow()
  })

  it('should generate disclaimer recursively', () => {
    const exec = () => execSync('yarn licenses generate-disclaimer --recursive', {
      cwd
    })
    expect(exec).toThrow()
  })

  it('should generate disclaimer for production', () => {
    const exec = () => execSync('yarn licenses generate-disclaimer --production', {
      cwd
    })
    expect(exec).toThrow()
  })

  it('should generate disclaimer recursively for production', () => {
    const stdout = execSync('yarn licenses generate-disclaimer --recursive --production', {
      cwd
    }).toString()
    expect(stdout).toBe(expectedRecursiveProduction)
  })
})

describe('getDisclaimer', () => {
  it.each([
    ['recursively for production', true, true, expectedRecursiveProduction]
  ])('should generate disclaimer %s', async (description, recursive, production, expected) => {
    const cwd = ppath.join(
      pluginRootDir,
      'src/__tests__/integration/fixtures/test-package-node-modules' as PortablePath
    )
    const configuration = await Configuration.find(
      cwd,
      {
        modules: new Map([
          [`@yarnpkg/plugin-pnp`, PnpPlugin],
          [`@yarnpkg/plugin-npm`, NpmPlugin]
        ]),
        plugins: new Set([`@yarnpkg/plugin-pnp`, `@yarnpkg/plugin-npm`])
      },
      { useRc: false }
    )
    const { project } = await Project.find(configuration, cwd)

    await project.restoreInstallState()

    const disclaimer = await getDisclaimer(project, recursive, production)

    expect(disclaimer).toBe(expected)
  })
})
