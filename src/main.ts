import { getInput, info, setFailed } from '@actions/core'
import { readFileSync } from 'fs'
import { BundleConfig, checkBundle } from './bundle'
import { initAWS } from './s3'

async function run(): Promise<void> {
  try {
    const branchName = getInput('BRANCH_NAME')
    const bucketName = getInput('BUCKET_NAME')
    const region = getInput('REGION')
    const accessKeyId = getInput('AWS_ACCESS_KEY_ID')
    const secretAccessKey = getInput('AWS_SECRET_ACCESS_KEY')
    const configPath = getInput('CONFIG_PATH')
    const targetBranch = getInput('TARGET_BRANCH')

    info(JSON.stringify({
      branchName,
      bucketName,
      region,
      accessKeyId,
      secretAccessKey,
      configPath,
      targetBranch
    }))

    initAWS({
      region,
      accessKeyId,
      secretAccessKey
    })

    const config: BundleConfig[] = JSON.parse(
      readFileSync(configPath, { encoding: 'utf-8' })
    )
    await checkBundle({ bucket: `${bucketName}}`, path: branchName, targetBranch }, config)
  } catch (error) {
    setFailed(error.message)
  }
}

run()
