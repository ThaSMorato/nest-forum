import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AnswerAttachment } from '@/domain/forum/enterprise/entities/answer-attachment'
import { Attachment as PrismaAnswerAttachment } from '@prisma/client'

export class PrismaAnswerAttachmentMapper {
  static toDomain({ id, answerId }: PrismaAnswerAttachment): AnswerAttachment {
    if (!answerId) {
      throw new Error('Invalid attachment type')
    }

    return AnswerAttachment.create(
      {
        answerId: new UniqueEntityID(answerId),
        attachmentId: new UniqueEntityID(id),
      },
      new UniqueEntityID(id),
    )
  }
}
