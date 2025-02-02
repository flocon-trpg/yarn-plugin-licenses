import {
  Project,
  Cache,
  ThrowReport,
  Descriptor,
  Package,
  treeUtils,
  structUtils,
  miscUtils,
  formatUtils,
  IdentHash,
  Linker
} from '@yarnpkg/core'
import { PortablePath, ppath, npath, Filename } from '@yarnpkg/fslib'
import { resolveLinker } from './linkers'

const anyName = '*'

/**
 * Root directory of this plugin, for use in automated tests
 */
export const pluginRootDir: PortablePath =
  npath.basename(__dirname) === '@yarnpkg'
    ? // __dirname = `<rootDir>/bundles/@yarnpkg`
      ppath.join(npath.toPortablePath(__dirname), '../..' as PortablePath)
    : // __dirname = `<rootDir>/src`
      ppath.join(npath.toPortablePath(__dirname), '..' as PortablePath)

type PackageName = {
  scope: string | null
  name: string
}

const readFilePromise = (linker: ReturnType<typeof resolveLinker>, path: PortablePath) => {
  return linker.fs.readFilePromise(path, 'utf8').catch((e: Error) => {
    // Prevents errors like "Error: ENOENT: no such file or directory, open 'SOME_DIR\.yarn\unplugged\@next-swc-android-arm-eabi-npm-12.3.1-27d8113023\node_modules\@next\swc-android-arm-eabi\package.json'" when non-android environments
    if (e.message.includes('no such file or directory')) {
      return null
    }
    throw e
  })
}

/**
 * Get the license tree for a project
 *
 * @param {Project} project - Yarn project
 * @param {boolean} json - Whether to output as JSON
 * @param {boolean} recursive - Whether to compute licenses recursively
 * @param {boolean} production - Whether to exclude devDependencies
 * @param {object[]} excludingDependencies - Packages to exclude from generated text or tree
 * @param {boolean} excludeMetadata - Whether to exclude metadata in tree
 * @returns {treeUtils.TreeNode} Root tree node
 */
export const getTree = async (
  project: Project,
  json: boolean,
  recursive: boolean,
  production: boolean,
  excludingDependencies: readonly PackageName[],
  excludeMetadata: boolean
): Promise<treeUtils.TreeNode> => {
  const rootChildren: treeUtils.TreeMap = {}
  const root: treeUtils.TreeNode = { children: rootChildren }

  const sortedPackages = await getSortedPackages(project, recursive, production, excludingDependencies)

  const linker = resolveLinker(project.configuration.get('nodeLinker'))

  for (const [descriptor, pkg] of sortedPackages.entries()) {
    const packagePath = await linker.getPackagePath(project, pkg)
    if (packagePath === null) continue

    const path = ppath.join(packagePath, Filename.manifest)
    const file = await readFilePromise(linker, path)
    if (file === null) continue

    const packageManifest: ManifestWithLicenseInfo = JSON.parse(file)

    const { license, url, vendorName, vendorUrl } = getLicenseInfoFromManifest(packageManifest)

    if (!rootChildren[license]) {
      rootChildren[license] = {
        value: formatUtils.tuple(formatUtils.Type.NO_HINT, license),
        children: {} as treeUtils.TreeMap
      } as treeUtils.TreeNode
    }

    const locator = structUtils.convertPackageToLocator(pkg)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const nodeValue = formatUtils.tuple(formatUtils.Type.DEPENDENT, {
      locator,
      descriptor
    })

    const children = excludeMetadata
      ? {}
      : {
          ...(url
            ? {
                url: {
                  value: formatUtils.tuple(formatUtils.Type.NO_HINT, stringifyKeyValue('URL', url, json))
                }
              }
            : {}),
          ...(vendorName
            ? {
                vendorName: {
                  value: formatUtils.tuple(formatUtils.Type.NO_HINT, stringifyKeyValue('VendorName', vendorName, json))
                }
              }
            : {}),
          ...(vendorUrl
            ? {
                vendorUrl: {
                  value: formatUtils.tuple(formatUtils.Type.NO_HINT, stringifyKeyValue('VendorUrl', vendorUrl, json))
                }
              }
            : {})
        }

    const node: treeUtils.TreeNode = {
      value: nodeValue,
      children
    }

    const key = structUtils.stringifyLocator(locator)
    const licenseChildren = rootChildren[license].children as treeUtils.TreeMap
    licenseChildren[key] = node
  }

  return root
}

const excludeDependencies = (
  dependenciesMap: Map<IdentHash, Descriptor>,
  excludingDependencies: readonly PackageName[]
) => {
  for (const excludingDependency of excludingDependencies) {
    ;[...dependenciesMap]
      .filter(([, descriptor]) => {
        if (descriptor.scope !== excludingDependency.scope) {
          return false
        }
        if (excludingDependency.name === anyName) {
          return true
        }
        return descriptor.name === excludingDependency.name
      })
      .forEach(([hash]) => {
        dependenciesMap.delete(hash)
      })
  }
}

/**
 * Get a sorted map of packages for the project
 *
 * @param {Project} project - Yarn project
 * @param {boolean} recursive - Whether to get packages recursively
 * @param {boolean} production - Whether to exclude devDependencies
 * @param {object[]} excludingDependencies - Packages to exclude from generated text or tree
 * @returns {Promise<Map<Descriptor, Package>>} Map of packages in the project
 */
export const getSortedPackages = async (
  project: Project,
  recursive: boolean,
  production: boolean,
  excludingDependencies: readonly PackageName[]
): Promise<Map<Descriptor, Package>> => {
  const packages = new Map<Descriptor, Package>()
  let storedDescriptors: Iterable<Descriptor>
  const packagesToSkip = new Set(['api-server', 'cache'])
  if (recursive) {
    if (production) {
      for (const workspace of project.workspaces) {
        workspace.manifest.devDependencies.clear()
        if (workspace.manifest.name?.scope === 'flocon-trpg') {
          if (packagesToSkip.delete(workspace.manifest.name.name)) {
            workspace.manifest.dependencies.clear()
            workspace.manifest.peerDependencies.clear()
          } else {
            excludeDependencies(workspace.manifest.dependencies, excludingDependencies)
            excludeDependencies(workspace.manifest.peerDependencies, excludingDependencies)
          }
        }
      }
      const cache = await Cache.find(project.configuration)
      await project.resolveEverything({ report: new ThrowReport(), cache })
    } else {
      throw new Error('--production=false is not supported.')
    }
    storedDescriptors = project.storedDescriptors.values()
  } else {
    throw new Error('--recursive=false is not supported.')
  }
  if (packagesToSkip.size !== 0) {
    throw new Error(
      'Following flocon-trpg packages are not found. Renamed or removed?: ' + JSON.stringify([...packagesToSkip])
    )
  }

  const sortedDescriptors = miscUtils.sortMap(storedDescriptors, [
    (descriptor) => structUtils.stringifyIdent(descriptor),
    // store virtual descriptors before non-virtual descriptors because the `node-modules` linker prefers virtual
    (descriptor) => (structUtils.isVirtualDescriptor(descriptor) ? '0' : '1'),
    (descriptor) => descriptor.range
  ])

  const seenDescriptorHashes = new Set<string>()

  for (const descriptor of sortedDescriptors.values()) {
    const identHash = project.storedResolutions.get(descriptor.descriptorHash)
    if (!identHash) continue
    const pkg = project.storedPackages.get(identHash)
    if (!pkg) continue
    if (pkg.scope === 'flocon-trpg' && pkg.name === 'servers') {
      continue
    }

    const { descriptorHash } = structUtils.isVirtualDescriptor(descriptor)
      ? structUtils.devirtualizeDescriptor(descriptor)
      : descriptor
    if (seenDescriptorHashes.has(descriptorHash)) continue
    seenDescriptorHashes.add(descriptorHash)

    packages.set(descriptor, pkg)
  }

  return packages
}

type Author = { name?: string; email?: string; url?: string }

/**
 * Get author information from a manifest's author string
 *
 * @param {string} author - format: "name (url) <email>"
 * @returns {Author} parsed author information
 */
export function parseAuthor(author: string) {
  const result: Author = {}

  const nameMatch = author.match(/^([^(<]+)/)
  if (nameMatch) {
    const name = nameMatch[0].trim()
    if (name) {
      result.name = name
    }
  }

  const emailMatch = author.match(/<([^>]+)>/)
  if (emailMatch) {
    result.email = emailMatch[1]
  }

  const urlMatch = author.match(/\(([^)]+)\)/)
  if (urlMatch) {
    result.url = urlMatch[1]
  }

  return result
}

/**
 * Get license information from a manifest
 *
 * @param {ManifestWithLicenseInfo} manifest - Manifest with license information
 * @returns {LicenseInfo} License information
 */
export const getLicenseInfoFromManifest = (manifest: ManifestWithLicenseInfo): LicenseInfo => {
  const { license, licenses, repository, homepage, author } = manifest

  const vendor = typeof author === 'string' ? parseAuthor(author) : author

  const getNormalizedLicense = () => {
    if (license) {
      return normalizeManifestLicenseValue(license)
    }
    if (licenses) {
      if (!Array.isArray(licenses)) {
        return normalizeManifestLicenseValue(licenses)
      }
      if (licenses.length === 1) {
        return normalizeManifestLicenseValue(licenses[0])
      }
      if (licenses.length > 1) {
        return `(${licenses.map(normalizeManifestLicenseValue).join(' OR ')})`
      }
    }
    return UNKNOWN_LICENSE
  }

  return {
    license: getNormalizedLicense(),
    url: repository?.url || homepage,
    vendorName: vendor?.name,
    vendorUrl: homepage || vendor?.url
  }
}

type ManifestWithLicenseInfo = {
  name: string
  license?: ManifestLicenseValue
  licenses?: ManifestLicenseValue | ManifestLicenseValue[]
  repository?: { url: string }
  homepage?: string
  author?: { name: string; url: string }
}

type ManifestLicenseValue = string | { type: string }

const UNKNOWN_LICENSE = 'UNKNOWN'

/**
 * Normalize a manifest license value into a license string
 *
 * @param {ManifestLicenseValue} manifestLicenseValue - Manifest license value
 * @returns {string} License string
 */
const normalizeManifestLicenseValue = (manifestLicenseValue: ManifestLicenseValue): string =>
  (typeof manifestLicenseValue !== 'string' ? manifestLicenseValue.type : manifestLicenseValue) || UNKNOWN_LICENSE

type LicenseInfo = {
  license: string
  url?: string
  vendorName?: string
  vendorUrl?: string
}

const stringifyKeyValue = (key: string, value: string, json: boolean) => {
  return json ? value : `${key}: ${value}`
}

/**
 * Get the license disclaimer for a project
 *
 * @param {Project} project - Yarn project
 * @param {boolean} recursive - Whether to include licenses recursively
 * @param {boolean} production - Whether to exclude devDependencies
 * @param {object[]} excludingDependencies - Packages to exclude from generated text or tree
 * @returns {string} License disclaimer
 */
export const getDisclaimer = async (
  project: Project,
  recursive: boolean,
  production: boolean,
  excludingDependencies: readonly PackageName[]
): Promise<string> => {
  const sortedPackages = await getSortedPackages(project, recursive, production, excludingDependencies)

  const linker = resolveLinker(project.configuration.get('nodeLinker'))

  const manifestsByLicense: Map<string, Map<string, ManifestWithLicenseInfo>> = new Map()

  for (const pkg of sortedPackages.values()) {
    const packagePath = await linker.getPackagePath(project, pkg)
    if (packagePath === null) continue

    const path = ppath.join(packagePath, Filename.manifest)
    const file = await readFilePromise(linker, path)
    if (file === null) continue

    const packageManifest: ManifestWithLicenseInfo = JSON.parse(file)

    const directoryEntries = await linker.fs.readdirPromise(packagePath, {
      withFileTypes: true
    })
    const files = directoryEntries.filter((dirEnt) => dirEnt.isFile()).map(({ name }) => name)

    const licenseFilename = files.find((filename): boolean => {
      const lower = filename.toLowerCase()
      return (
        lower === 'license' || lower.startsWith('license.') || lower === 'unlicense' || lower.startsWith('unlicense.')
      )
    })

    if (!licenseFilename) continue

    const licenseText = await readFilePromise(linker, ppath.join(packagePath, licenseFilename))
    if (licenseText === null) continue

    const noticeFilename = files.find((filename): boolean => {
      const lower = filename.toLowerCase()
      return lower === 'notice' || lower.startsWith('notice.')
    })

    let noticeText
    if (noticeFilename) {
      noticeText = await readFilePromise(linker, ppath.join(packagePath, noticeFilename))
    }

    const licenseKey = noticeText ? `${licenseText}\n\nNOTICE\n\n${noticeText}` : licenseText

    const manifestMap = manifestsByLicense.get(licenseKey)
    if (!manifestMap) {
      manifestsByLicense.set(licenseKey, new Map([[packageManifest.name, packageManifest]]))
    } else {
      manifestMap.set(packageManifest.name, packageManifest)
    }
  }

  let disclaimer =
    'THE FOLLOWING SETS FORTH ATTRIBUTION NOTICES FOR THIRD PARTY SOFTWARE THAT MAY BE CONTAINED ' +
    `IN PORTIONS OF FLOCON WEB SERVER PRODUCT.\n\n`

  for (const [licenseKey, packageMap] of manifestsByLicense.entries()) {
    disclaimer += '-----\n\n'

    const names = []
    const urls = []
    for (const { name, repository } of packageMap.values()) {
      names.push(name)
      if (repository?.url) {
        urls.push(packageMap.size === 1 ? repository.url : `${repository.url} (${name})`)
      }
    }

    const heading = []
    heading.push(`The following software may be included in this product: ${names.join(', ')}.`)
    if (urls.length > 0) {
      heading.push(`A copy of the source code may be downloaded from ${urls.join(', ')}.`)
    }
    heading.push('This software contains the following license and notice below:')

    disclaimer += `${heading.join(' ')}\n\n`
    disclaimer += `${licenseKey.trim()}\n\n`
  }

  return disclaimer
}

/**
 * @param source
 * @example
 * ```typescript
 * [...parseExcludingDependencies('eslint,@yarnpkg/core,@types/*')]
 * // => [{ scope: null, name: 'eslint' }, { scope: 'yarnpkg', name: 'core' }, { scope: 'types', name: '*' }]
 * ```
 */
export function* parseExcludingDependencies(source: string): Iterable<PackageName> {
  for (const packageString of source.split(',')) {
    const [elem0, elem1, elem2] = packageString.trim().split('/')
    if (elem2 != null) {
      throw new Error(`"${packageString}" has more than one slashes.`)
    }
    let scope: string | null
    let name: string
    if (elem1 == null) {
      scope = null
      name = elem0
    } else {
      if (!elem0.startsWith('@')) {
        throw new Error(`Scope must start with "@", but "${packageString}" does not.`)
      }
      scope = elem0.substring(1)
      name = elem1
    }
    const invalidCharacters = /[^0-9a-zA-Z-.]/
    if (scope != null) {
      if (invalidCharacters.test(scope)) {
        throw new Error(`"${packageString}" has invalid characters.`)
      }
    }
    if (name !== anyName && invalidCharacters.test(name)) {
      throw new Error(`"${packageString}" has invalid characters.`)
    }
    yield { scope, name }
  }
}
