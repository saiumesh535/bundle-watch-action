import { S3, config } from 'aws-sdk'
import { info } from '@actions/core';

type AWSConfig = {
  region: string
}

type S3Base = {
  Bucket: string;
  Key: string;
}

type S3BaseData = S3Base & {
  Body: string;
}

export const initAWS = (input: AWSConfig): void => {
  config.update({
    ...input
  })
}

const S3Instance = new S3()

export const getS3Object = async <T = []>({ Bucket, Key }: S3Base): Promise<T | []> => {
  return new Promise((res, rej) => {
    info(`getting data from ${Bucket} with path ${Key}`)
    S3Instance.getObject({ Bucket, Key }, (err, data) => {
      if (err) {
        return rej(err)
      }
      if (data?.Body) {
        return res(JSON.parse(data.Body?.toString()))
      } else {
        return res([]);
      }
    })
  })
}

export const pushS3Object = async (
  { Bucket, Key, Body }: S3BaseData
): Promise<void> => {
  return new Promise((res, rej) => {
    info(`pushing data into bucker ${Bucket} with path ${Key}`)
    S3Instance.putObject({ Bucket, Key, Body }, err => {
      if (err) {
        return rej(err)
      }
      return res()
    })
  })
}

export const isFileExists = async (
  input: S3Base
): Promise<boolean> => {
  return new Promise(res => {
    getS3Object({ ...input })
      .then(() => {
        return res(true)
      })
      .catch(() => {
        return res(false)
      })
  })
}
