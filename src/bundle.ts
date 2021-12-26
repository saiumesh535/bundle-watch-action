import {isFileExists, pushS3Object, info} from './s3'
import {statSync} from 'fs'

type CheckBundle = {
  bucket: string;
  path: string;
  targetBranch: string;
}

export type BundleConfig = {
  files: {
    path: string
    size: number
  }
}

export const checkBundle = async (
  input: CheckBundle,
  bundleConfig: BundleConfig[]
): Promise<void> => {
  // first try to see if previous file exists
  let result: BundleConfig[] = []

  // calculate all the bundle size
  for (const config of bundleConfig) {
    const fileSize = statSync(config.files.path).size / (1024 * 1024)
    const currentConfig: BundleConfig = {
      files: {path: config.files.path, size: fileSize}
    }
    result = [...result, currentConfig]
  }

  // check with previous branch if any
  const isTargetFileExists = await isFileExists(input.bucket, input.targetBranch);
  if (!isTargetFileExists) {
    // now check the difference if any
    info('checkinggg')
  }

  await pushS3Object(input.path, input.bucket, JSON.stringify(result))
}
