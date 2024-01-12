import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { QuestionAttachment } from '@/domain/forum/enterprise/entities/question-attachment'
import { Prisma, Attachment as PrismaQuestionAttachment } from '@prisma/client'

export class PrismaQuestionAttachmentMapper {
  static toDomain({
    id,
    questionId,
  }: PrismaQuestionAttachment): QuestionAttachment {
    if (!questionId) {
      throw new Error('Invalid attachment type')
    }

    return QuestionAttachment.create(
      {
        questionId: new UniqueEntityID(questionId),
        attachmentId: new UniqueEntityID(id),
      },
      new UniqueEntityID(id),
    )
  }

  static toPrismaUpdateMany(
    attachments: QuestionAttachment[],
  ): Prisma.AttachmentUpdateManyArgs {
    const attachmentsId = attachments
      .map((attachment) => attachment.attachmentId)
      .map(String)
    const questionId = String(attachments[0].questionId)

    return {
      where: {
        id: {
          in: attachmentsId,
        },
      },
      data: {
        questionId,
      },
    }
  }
}
