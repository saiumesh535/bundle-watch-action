import { getS3Object, isFileExists, pushS3Object } from './s3';
const app = require('json-to-markdown-table');
import { statSync } from 'fs'
import { info } from '@actions/core'

type CheckBundle = {
  bucket: string;
  path: string;
  targetBranch: string;
}

export type BundleConfig = {
  name: string;
  path: string
  size: string;
  change?: string;
  sizeNumber?: number;
  targetBranchName?: string;
}

export const checkBundle = async (
  input: CheckBundle,
  bundleConfig: BundleConfig[]
): Promise<string> => {
  // first try to see if previous file exists
  let result: BundleConfig[] = [];
  let targetBranchData: BundleConfig[] = [];

  // check with target branch if any
  if (input.targetBranch) {
    const isTargetFileExists = await isFileExists({ Bucket: input.bucket, Key: input.targetBranch });
    if (!isTargetFileExists) {
      // now check the difference if any
      info("target branch not found for comparison");
    } else {
      targetBranchData = await getS3Object({
        Bucket: input.bucket,
        Key: input.targetBranch
      });
    }
  }

  // calculate all the bundle size
  for (const config of bundleConfig) {
    const fileSize = (statSync(config.path).size / (1024)).toFixed(2);
    const currentConfig: BundleConfig = {
      ...config,
      size: `${fileSize} KB`,
      sizeNumber: Number(fileSize),
    }
    result = [...result, currentConfig]
  }

  let resultWithDiff: BundleConfig[] = [];

  // update result with change when there's data in targetBranch
  // convert this function with map later
  if (targetBranchData?.length > 0) {
    for (const cur of result) {
      const fromTarget = targetBranchData.find((t) => t.name === cur.name);
      if (fromTarget && cur.sizeNumber && fromTarget.sizeNumber) {
        const sizeDif: string = `${((cur.sizeNumber / fromTarget.sizeNumber) * 100) - 100}`;
        cur.change = sizeDif;
      }
      resultWithDiff = [...resultWithDiff, { ...cur }];
    }
  }

  await pushS3Object({
    Bucket: input.bucket,
    Key: input.path,
    Body: JSON.stringify(result)
  })

  if (targetBranchData?.length > 0) {
    return app(resultWithDiff, ['name', 'path', 'size', `Diff with ${input.targetBranch}`]);
  }
  return app(result, ['name', 'path', 'size'])

}
