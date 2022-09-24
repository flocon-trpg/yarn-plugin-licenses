import { WorkspaceRequiredError } from '@yarnpkg/cli'
import { CommandContext, Configuration, Project } from '@yarnpkg/core'
import { Command, Usage, Option } from 'clipanion'
import { getDisclaimer, parseExcludingDependencies } from '../utils'

export class LicensesGenerateDisclaimerCommand extends Command<CommandContext> {
  static paths = [[`licenses`, `generate-disclaimer`]]

  recursive = Option.Boolean(`-R,--recursive`, false, {
    description: `Include transitive dependencies (dependencies of direct dependencies)`
  })

  production = Option.Boolean(`--production`, false, {
    description: `Exclude development dependencies`
  })

  exclude = Option.String(`--exclude`, {
    description: `Exclude specified dependencies (e.g. --exclude="eslint,@yarnpkg/core,@types/*")`
  })

  static usage: Usage = Command.Usage({
    description: `display the license disclaimer including all packages in the project`,
    details: `
      This command prints the license disclaimer for packages in the project. By default, only direct dependencies are listed.

      If \`-R,--recursive\` is set, the disclaimer will include transitive dependencies (dependencies of direct dependencies).

      If \`--production\` is set, the disclaimer will exclude development dependencies.
    `,
    examples: [
      [`Include licenses of direct dependencies`, `$0 licenses generate-disclaimer`],
      [`Include licenses of direct and transitive dependencies`, `$0 licenses generate-disclaimer --recursive`],
      [`Include licenses of production dependencies only`, `$0 licenses list --production`]
    ]
  })

  async execute(): Promise<void> {
    const configuration = await Configuration.find(this.context.cwd, this.context.plugins)
    const { project, workspace } = await Project.find(configuration, this.context.cwd)

    if (!workspace) {
      throw new WorkspaceRequiredError(project.cwd, this.context.cwd)
    }

    await project.restoreInstallState()

    const disclaimer = await getDisclaimer(
      project,
      this.recursive,
      this.production,
      this.exclude == null ? [] : [...parseExcludingDependencies(this.exclude)]
    )
    this.context.stdout.write(disclaimer)
  }
}
