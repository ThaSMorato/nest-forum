import { Attachment } from '@/domain/forum/enterprise/entities/attachment'
import { Prisma } from '@prisma/client'

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
}
