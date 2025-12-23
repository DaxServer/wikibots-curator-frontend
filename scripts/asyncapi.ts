import {
  ConstrainedDictionaryModel,
  PYTHON_PYDANTIC_PRESET,
  PythonGenerator,
  TypeScriptGenerator,
  typeScriptDefaultEnumKeyConstraints,
} from '@asyncapi/modelina'
import fs from 'node:fs'
import path from 'node:path'

const CUSTOM_PYDANTIC_PRESET = {
  class: {
    ...PYTHON_PYDANTIC_PRESET.class,
    // @ts-expect-error
    property({ property, model, renderer }) {
      let type = property.property.type
      const propertyName = property.propertyName
      const isOptional = !property.required || property.property.options.isNullable === true

      if (isOptional) {
        type = `Optional[${type}]`
      }

      if (property.property.options.const) {
        renderer.dependencyManager.addDependency('from typing import Literal')
        type = `Literal['${property.property.options.const.originalInput}']`
      }

      type = renderer.renderPropertyType({
        modelType: model.type,
        propertyType: type,
      })

      const decoratorArgs = []

      if (property.property.originalInput.description) {
        decoratorArgs.push(`description='''${property.property.originalInput.description}'''`)
      }

      // Fix: Check for default value in originalInput
      const defaultValue = property.property.originalInput.default
      if (defaultValue !== undefined) {
        if (typeof defaultValue === 'string') {
          decoratorArgs.push(`default='${defaultValue}'`)
        } else {
          decoratorArgs.push(`default=${defaultValue}`)
        }
      } else if (isOptional) {
        decoratorArgs.push('default=None')
      }

      if (property.property.options.const) {
        let value = property.property.options.const.value
        if (model.options.discriminator?.discriminator === property.unconstrainedPropertyName) {
          value = property.property.options.const.originalInput
        }
        decoratorArgs.push(`default='${value}'`)
        decoratorArgs.push('frozen=True')
      }

      if (
        property.property instanceof ConstrainedDictionaryModel &&
        property.property.serializationType === 'unwrap'
      ) {
        decoratorArgs.push('exclude=True')
      }

      if (
        property.propertyName !== property.unconstrainedPropertyName &&
        (!(property.property instanceof ConstrainedDictionaryModel) ||
          property.property.serializationType !== 'unwrap')
      ) {
        decoratorArgs.push(`alias='''${property.unconstrainedPropertyName}'''`)
      }

      return `${propertyName}: ${type} = Field(${decoratorArgs.join(', ')})`
    },
  },
}

const inputPath = path.resolve(import.meta.dir, '../asyncapi.json')
const sdcInputPath = path.resolve(import.meta.dir, '../sdc.json')
const backendPath = path.resolve(import.meta.dir, '../../backend')

// Load documents globally
const content = await Bun.file(inputPath).text()
const document = JSON.parse(content)

const sdcContent = await Bun.file(sdcInputPath).text()
const sdcDocument = JSON.parse(sdcContent)

const getInferredType = async (pattern: string): Promise<string> => {
  const tempFile = path.resolve(
    import.meta.dir,
    `temp_type_${Math.random().toString(36).slice(2)}.ts`,
  )
  // Simplify pattern for type inference to avoid "excessively deep" errors
  const simplifiedPattern = pattern.replace(/\[1-9\]/g, '\\d').replace(/\[0-9\]/g, '\\d')

  // Escape backslashes for the TS file string literal
  const escapedPattern = simplifiedPattern.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  const content = `import { regex } from 'arkregex'; const r = regex('${escapedPattern}'); type T = typeof r; const x: never = {} as T;`
  await Bun.write(tempFile, content)

  try {
    // We use bun x tsc and expect it to fail with the type information in the error message
    const { stdout, stderr } = Bun.spawnSync([
      'bun',
      'x',
      'tsc',
      tempFile,
      '--noEmit',
      '--esModuleInterop',
      '--skipLibCheck',
      '--target',
      'esnext',
      '--moduleResolution',
      'bundler',
      '--module',
      'esnext',
    ])

    // Bun.spawnSync doesn't throw on non-zero exit code by default,
    // it returns a result object with the status and outputs.
    // The tsc command will exit with code 1 due to the type mismatch (T as never).
    const output = stdout.toString() + stderr.toString()

    // Look for the Regex type in the error message. It usually looks like:
    // Type 'Regex<"P${number}${number}", {}>' is not assignable to type 'never'.
    const match = output.match(/Regex<["'`](.*?)["'`],/)
    if (match) {
      return `\`${match[1]}\``
    }
    return 'string'
  } catch (_) {
    // Fallback if spawnSync itself fails (unlikely)
    return 'string'
  } finally {
    const file = Bun.file(tempFile)
    if (await file.exists()) {
      await fs.promises.unlink(tempFile)
    }
  }
}

const generatePythonCode = async () => {
  const pythonGenerator = new PythonGenerator({ presets: [CUSTOM_PYDANTIC_PRESET] })
  const models = await pythonGenerator.generate(document)
  const modelNames = models.map((m) => m.modelName).filter((name) => name && name.trim() !== '')
  const backendOutputDir = path.resolve(backendPath, 'src/curator/asyncapi')

  if (fs.existsSync(backendOutputDir)) {
    fs.rmSync(backendOutputDir, { recursive: true, force: true })
  }
  fs.mkdirSync(backendOutputDir, { recursive: true })

  for (const model of models) {
    if (!model.modelName || model.modelName.trim() === '') {
      continue
    }
    let code = model.result
    // Workaround for Modelina's Pydantic preset issue where unwrap_additional_properties
    // assumes input is always a dict or model instance. When validating Unions containing
    // primitives, this validator receives the primitive value, causing an AttributeError
    // on .model_dump(). We catch this to allow Pydantic to handle the type mismatch naturally.
    code = code.replace(
      /if not isinstance\(data, dict\):\s+data = data\.model_dump\(\)/g,
      'if not isinstance(data, dict):\n            try:\n                data = data.model_dump()\n            except AttributeError:\n                return data',
    )

    // Fix double quoting issue for const fields
    code = code.replace(/default=''(.*?)''/g, "default='$1'")

    const imports = new Set(model.dependencies || [])

    // Find model dependencies
    const referencedModels = modelNames.filter(
      (name) => name !== model.modelName && new RegExp(`\\b${name}\\b`).test(code),
    )

    const modelImports = referencedModels.map((name) => `from .${name} import ${name}`)

    const fileContent = [
      '# Auto-generated by @asyncapi/modelina',
      '# DO NOT EDIT MANUALLY',
      '',
      ...Array.from(imports),
      ...modelImports,
      '',
      code,
    ].join('\n')

    await Bun.write(path.join(backendOutputDir, `${model.modelName}.py`), fileContent)
  }

  // Generate __init__.py
  const initContent = [
    '# Auto-generated by @asyncapi/modelina',
    '# DO NOT EDIT MANUALLY',
    '',
    ...modelNames.map((name) => `from .${name} import ${name}`),
    '',
    '__all__ = [',
    ...modelNames.map((name) => `    "${name}",`),
    ']',
    '',
    // We don't need to rebuild explicitly if we use imports, but to be safe for recursive refs:
    '# Rebuild models to resolve forward references',
    'from pydantic import BaseModel',
    'for name, cls in list(globals().items()):',
    '    if isinstance(cls, type) and issubclass(cls, BaseModel) and cls is not BaseModel:',
    '        try:',
    '            cls.model_rebuild()',
    '        except Exception:',
    '            pass',
  ].join('\n')

  await Bun.write(path.join(backendOutputDir, '__init__.py'), initContent)
  console.log(`Generated Python models to ${backendOutputDir}`)
}

const generateTypescriptCode = async () => {
  const tsGenerator = new TypeScriptGenerator({
    modelType: 'interface',
    mapType: 'record',
    rawPropertyNames: true,
    processorOptions: {
      interpreter: {
        ignoreAdditionalProperties: true,
      },
    },
    constraints: {
      enumKey: typeScriptDefaultEnumKeyConstraints({
        NO_SPECIAL_CHAR: (context) => {
          return context.replace(/-/g, '_')
        },
        NO_RESERVED_KEYWORDS: (context) => {
          return context
        },
      }),
    },
  })

  const tsModels = (await tsGenerator.generate(document)).filter((m) => m.modelName !== 'WsChannel')
  const sdcModels = (
    await tsGenerator.generate({
      ...sdcDocument,
      channels: {
        sdc: {
          address: 'sdc',
          messages: Object.fromEntries(
            Object.keys(sdcDocument.components.schemas).map((name) => [
              name,
              { payload: { $ref: `#/components/schemas/${name}` } },
            ]),
          ),
        },
      },
      operations: {
        allSdcSchemas: {
          action: 'send',
          channel: {
            $ref: '#/channels/sdc',
          },
        },
      },
    })
  ).filter((m) => m.modelName !== 'Sdc')

  const inferredTypes: Record<string, string> = {}
  for (const m of sdcModels) {
    if (m.model.originalInput.pattern) {
      const type = await getInferredType(m.model.originalInput.pattern)
      inferredTypes[m.modelName] = type
    }
  }

  let tsContent = [
    `// Generated by @asyncapi/modelina
// Do not edit manually`,
    '',
    ...tsModels.map((m) => m.result),
    ...sdcModels.map((m) => m.result),
  ].join('\n\n')

  // Construct ClientMessage and ServerMessage unions
  // Client Messages (ReceiveClientMessages)
  const clientMessagesRefs = document.operations.ReceiveClientMessages.messages || []
  const clientMessageTypes = clientMessagesRefs.map((m: { $ref: string }) => {
    const name = m.$ref.split('/').pop()
    return `${name}`
  })
  const clientMessageUnion = `export type ClientMessage = \n  | ${clientMessageTypes.join('\n  | ')}`

  // Server Messages (SendServerMessages)
  const serverMessagesRefs = document.operations.SendServerMessages.messages || []
  const serverMessageTypes = serverMessagesRefs.map((m: { $ref: string }) => {
    const name = m.$ref.split('/').pop()
    return `${name}`
  })
  const serverMessageUnion = `export type ServerMessage = \n  | ${serverMessageTypes.join('\n  | ')}`

  tsContent += `\n\n${clientMessageUnion}\n\n${serverMessageUnion}\n`
  tsContent += `\nexport type StructuredError = DuplicateError | GenericError\n`

  // Fix reserved keywords and add exports
  tsContent = tsContent
    .replace(/^interface (\w+) {/gm, 'export type $1 = {')
    .replace(/^(type|enum)/gm, 'export $1')

  // Apply inferred types
  for (const [modelName, type] of Object.entries(inferredTypes)) {
    const regex = new RegExp(`export type ${modelName} = string`, 'g')
    tsContent = tsContent.replace(regex, `export type ${modelName} = ${type}`)
  }

  const frontendPath = path.resolve(import.meta.dir, '../src/types')
  const tsOutputFile = path.resolve(frontendPath, 'asyncapi.ts')

  await Bun.write(tsOutputFile, tsContent)
  console.log(`Generated TypeScript models to ${tsOutputFile}`)
}

generatePythonCode().then(() => {
  Bun.spawnSync(['poetry', 'run', 'ruff', 'format'], {
    cwd: backendPath,
  })
  Bun.spawnSync(['poetry', 'run', 'ruff', 'check', '--fix'], {
    cwd: backendPath,
  })
  console.log('Formatted Python code with ruff linter')
  console.log('Formatted Python code with ruff formatter')
  Bun.spawnSync(['poetry', 'run', 'black', '.'], {
    cwd: backendPath,
  })
  console.log('Formatted Python code with black')
  Bun.spawnSync(['poetry', 'run', 'isort', '.'], {
    cwd: backendPath,
  })
  console.log('Formatted Python code with isort')
})

generateTypescriptCode().then(() => {
  Bun.spawnSync(['bun', 'format'], {
    cwd: path.resolve(import.meta.dir, '../'),
  })
  console.log('Formatted TypeScript code with bun format')
})
