import { getInput, info, setFailed, setOutput } from '@actions/core'
import { readFileSync } from 'fs'
import { BundleConfig, checkBundle } from './bundle'
import { initAWS } from './s3'

async function run(): Promise<void> {
  try {
    let branchName = getInput('BRANCH_NAME')
    const bucketName = getInput('BUCKET_NAME')
    const region = getInput('REGION')
    const configPath = getInput('CONFIG_PATH')
    let targetBranch = getInput('TARGET_BRANCH')

    if (branchName && branchName.includes('/')) {
      branchName = branchName.replace(/\//g, '_')
    }

    if (targetBranch && targetBranch.includes('/')) {
      targetBranch = targetBranch.replace(/\//g, '_')
    }

    info(JSON.stringify({
      branchName,
      bucketName,
      region,
      configPath,
      targetBranch
    }))

    initAWS({
      region
    })

    const config: BundleConfig[] = JSON.parse(
      readFileSync(configPath, { encoding: 'utf-8' })
    )
    const md = await checkBundle({ bucket: `${bucketName}`, path: `${branchName}.json`, targetBranch }, config);
    setOutput('comment', md);
  } catch (error) {
    setFailed(error.message)
  }
}

run()
