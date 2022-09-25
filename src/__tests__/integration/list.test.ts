import { Configuration, Project, treeUtils } from '@yarnpkg/core'
import { xfs, ppath, npath, PortablePath, normalizeLineEndings } from '@yarnpkg/fslib'
import PnpPlugin from '@yarnpkg/plugin-pnp'
import NpmPlugin from '@yarnpkg/plugin-npm'
import { pluginRootDir, getTree, parseExcludingDependencies } from '../../utils'
import { execSync } from 'child_process'
import { Writable } from 'stream'

const expectedRecursiveProduction = normalizeLineEndings(
  '\n',
  xfs.readFileSync(
    ppath.join(__dirname as PortablePath, 'fixtures/expected/listRecursiveProduction.txt' as PortablePath),
    'utf8'
  )
)

const expectedRecursiveProductionJson = normalizeLineEndings(
  '\n',
  xfs.readFileSync(
    ppath.join(__dirname as PortablePath, 'fixtures/expected/listRecursiveProductionJson.txt' as PortablePath),
    'utf8'
  )
)

const expectedRecursiveProductionExclude = normalizeLineEndings(
  '\n',
  xfs.readFileSync(
    ppath.join(__dirname as PortablePath, 'fixtures/expected/listRecursiveProductionExclude.txt' as PortablePath),
    'utf8'
  )
)

const expectedRecursiveProductionExcludeMetadata = normalizeLineEndings(
  '\n',
  xfs.readFileSync(
    ppath.join(
      __dirname as PortablePath,
      'fixtures/expected/listRecursiveProductionExcludeMetadata.txt' as PortablePath
    ),
    'utf8'
  )
)

describe.each(['pnp', 'node-modules'])('licenses list (%s)', (linker) => {
  const cwd = npath.join(__dirname, 'fixtures', `test-package-${linker}`)
  beforeAll(() => {
    execSync('yarn', { cwd })
  })

  it('should list licenses', () => {
    const stdout = () => execSync('yarn licenses list', { cwd })
    expect(stdout).toThrow()
  })

  it('should list licenses recursively', () => {
    const stdout = () =>
      execSync('yarn licenses list --recursive', {
        cwd
      })
    expect(stdout).toThrow()
  })

  it('should list licenses for production', () => {
    const stdout = () =>
      execSync('yarn licenses list --production', {
        cwd
      })
    expect(stdout).toThrow()
  })

  it('should list licenses recursively for production', () => {
    const stdout = execSync('yarn licenses list --recursive --production', {
      cwd
    }).toString()
    expect(stdout).toBe(expectedRecursiveProduction)
  })

  it('should list licenses recursively for production with --exclude', () => {
    const stdout = execSync('yarn licenses list --recursive --production --exclude="serve,@kizahasi/result,@types/*"', {
      cwd
    }).toString()
    expect(stdout).toBe(expectedRecursiveProductionExclude)
  })

  it('should list licenses as json', () => {
    const stdout = execSync('yarn licenses list --recursive --production --json', { cwd }).toString()
    expect(stdout).toBe(expectedRecursiveProductionJson)
  })

  it('should list licenses without metadata', () => {
    const stdout = execSync('yarn licenses list --recursive --production --exclude-metadata', {
      cwd
    }).toString()
    expect(stdout).toBe(expectedRecursiveProductionExcludeMetadata)
  })
})

describe('licenses list (node-modules with aliases)', () => {
  const cwd = npath.join(__dirname, 'fixtures', `test-package-node-modules-aliases`)
  beforeAll(() => {
    execSync('yarn', { cwd })
  })

  it('should include aliases in licenses list', () => {
    const stdout = execSync('yarn licenses list --recursive --production', { cwd }).toString()
    expect(stdout).toContain('babel-loader@npm:8.2.4 [dc3fc] (via npm:^8.2.4 [dc3fc])')
  })
})
