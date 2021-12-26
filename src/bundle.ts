import {isFileExists, pushS3Object} from './s3'
import {statSync} from 'fs'
import { info } from '@actions/core'

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
    const fileSize = statSync("config.files.path").size / (1024 * 1024)
    const currentConfig: BundleConfig = {
      files: {path: config.files.path, size: fileSize}
    }
    result = [...result, currentConfig]
  }

  // check with previous branch if any
  // const isTargetFileExists = await isFileExists();
  // if (!isTargetFileExists) {
  //   // now check the difference if any
  //   info('checking')
  // }

  await pushS3Object({
    Bucket: input.bucket,
    Key: input.path,
    Body: JSON.stringify(result)
  })
}
