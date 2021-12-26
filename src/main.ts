import {getInput, setFailed} from '@actions/core'
import {readFileSync} from 'fs'
import {BundleConfig, checkBundle} from './bundle'
import {initAWS} from './s3'

async function run(): Promise<void> {
  try {
    const branchName = getInput('branch_name')
    const bucketName = getInput('bucket_name')
    const region = getInput('bucket_name')
    const accessKeyId = getInput('AWS_ACCESS_KEY_ID')
    const secretAccessKey = getInput('AWS_SECRET_ACCESS_KEY')
    const configPath = getInput('CONFIG_PATH')

    initAWS({
      region,
      accessKeyId,
      secretAccessKey
    })

    const config: BundleConfig[] = JSON.parse(
      readFileSync(configPath, {encoding: 'utf-8'})
    )
    await checkBundle({bucket: bucketName, path: branchName}, config)
  } catch (error) {
    setFailed(error.message)
  }
}

run()
