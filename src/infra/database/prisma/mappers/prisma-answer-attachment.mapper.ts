import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AnswerAttachment } from '@/domain/forum/enterprise/entities/answer-attachment'
import { Prisma, Attachment as PrismaAnswerAttachment } from '@prisma/client'

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

  static toPrismaUpdateMany(
    attachments: AnswerAttachment[],
  ): Prisma.AttachmentUpdateManyArgs {
    const attachmentsId = attachments
      .map((attachment) => attachment.attachmentId)
      .map(String)
    const answerId = String(attachments[0].answerId)

    return {
      where: {
        id: {
          in: attachmentsId,
        },
      },
      data: {
        answerId,
      },
    }
  }
}
