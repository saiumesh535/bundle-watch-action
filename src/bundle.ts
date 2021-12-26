import { isFileExists, pushS3Object } from './s3';
const app = require('json-to-markdown-table');
import { statSync } from 'fs'
import { info } from '@actions/core'

type CheckBundle = {
  bucket: string;
  path: string;
  targetBranch: string;
}

export type BundleConfig = {
  path: string
  size: number
}

export const checkBundle = async (
  input: CheckBundle,
  bundleConfig: BundleConfig[]
): Promise<string> => {
  // first try to see if previous file exists
  let result: BundleConfig[] = []

  // calculate all the bundle size
  for (const config of bundleConfig) {
    const fileSize = statSync(config.path).size / (1024 * 1024)
    const currentConfig: BundleConfig = {
      path: config.path, size: fileSize
    }
    result = [...result, currentConfig]
  }

  // check with target branch if any
  if (input.targetBranch) {
    const isTargetFileExists = await isFileExists({ Bucket: input.bucket, Key: input.targetBranch });
    if (!isTargetFileExists) {
      // now check the difference if any
      info("target branch not found for comparison");
    }
    // now compare with target branch
  }

  await pushS3Object({
    Bucket: input.bucket,
    Key: input.path,
    Body: JSON.stringify(result)
  })

  return app(result, ['path', 'size']);
}
