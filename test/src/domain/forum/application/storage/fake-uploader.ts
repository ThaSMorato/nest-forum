import {
  UploadParams,
  Uploader,
} from '@/domain/forum/application/storage/uploader'
import { faker } from '@faker-js/faker'

interface Upload {
  fileName: string
  url: string
}

export class FakeUploader implements Uploader {
  public uploads: Upload[] = []

  private _url: string = faker.internet.url()

  async upload({ fileName }: UploadParams): Promise<{ url: string }> {
    const url = `${this._url}/${fileName}`

    this.uploads.push({
      fileName,
      url,
    })

    return { url }
  }
}
