import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Attachment } from '@/domain/forum/enterprise/entities/attachment'
import { Prisma, Attachment as PrismaAttachment } from '@prisma/client'

export class PrismaAttachmentMapper {
  static toPrisma({
    title,
    id,
    url,
  }: Attachment): Prisma.AttachmentUncheckedCreateInput {
    return {
      title,
      url,
      id: String(id),
    }
  }

  static toDomain({ id, title, url }: PrismaAttachment): Attachment {
    return Attachment.create(
      {
        title,
        url,
      },
      new UniqueEntityID(id),
    )
  }
}
