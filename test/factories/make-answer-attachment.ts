import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  AnswerAttachment,
  AnswerAttachmentProps,
} from '@/domain/forum/enterprise/entities/answer-attachment'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

export function makeAnswerAttachment(
  override: Partial<AnswerAttachmentProps> = {},
  id?: UniqueEntityID,
) {
  const answerAttachment = AnswerAttachment.create(
    {
      answerId: new UniqueEntityID(),
      attachmentId: new UniqueEntityID(),
      ...override,
    },
    id,
  )

  return answerAttachment
}

@Injectable()
export class AnswerAttachmentFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAnswerAttachment(
    override: Partial<AnswerAttachmentProps> = {},
    id?: UniqueEntityID,
  ): Promise<AnswerAttachment> {
    const attachment = makeAnswerAttachment(override, id)

    await this.prisma.attachment.update({
      where: {
        id: String(attachment.attachmentId),
      },
      data: {
        answerId: String(attachment.answerId),
      },
    })

    return attachment
  }
}
