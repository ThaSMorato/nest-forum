import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { QuestionAttachment } from '@/domain/forum/enterprise/entities/question-attachment'
import { Attachment as PrismaQuestionAttachment } from '@prisma/client'

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
}
