import {S3, config} from 'aws-sdk'
import {info} from '@actions/core'

type AWSConfig = {
  accessKeyId: string
  secretAccessKey: string
  region: string
}

export const initAWS = (input: AWSConfig): void => {
  config.update({
    ...input
  })
}

const S3Instance = new S3()

export const getS3Object = async (
  path: string,
  Bucket: string
): Promise<void> => {
  return new Promise((res, rej) => {
    info(`getting data from ${Bucket} with path ${path}`)
    S3Instance.getObject({Bucket, Key: path}, err => {
      if (err) {
        return rej(err)
      }
      return res()
    })
  })
}

export const pushS3Object = async (
  path: string,
  Bucket: string,
  data: string
): Promise<void> => {
  return new Promise((res, rej) => {
    info(`pushing data into bucker ${Bucket} with path ${path}`)
    S3Instance.putObject({Bucket, Key: `${path}.json`, Body: data}, err => {
      if (err) {
        return rej(err)
      }
      return res()
    })
  })
}

export const isFileExists = async (
  bucket: string,
  path: string
): Promise<boolean> => {
  return new Promise(res => {
    getS3Object(path, bucket)
      .then(() => {
        return res(true)
      })
      .catch(() => {
        return res(false)
      })
  })
}
