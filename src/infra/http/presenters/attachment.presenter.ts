import { Attachment } from '@/domain/forum/enterprise/entities/attachment'

export class AttachmentPresenter {
  static toHTTP({ id, url, title }: Attachment) {
    return {
      id: String(id),
      url,
      title,
    }
  }
}
