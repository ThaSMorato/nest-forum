import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details'
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug'
import {
  Question as PrismaQuestion,
  User as PrismaUser,
  Attachment as PrismaAttachment,
} from '@prisma/client'
import { PrismaAttachmentMapper } from './prisma-attachment.mapper'

type PrismaQuestionDetails = PrismaQuestion & {
  author: PrismaUser
  attachments: PrismaAttachment[]
}

export class PrismaQuestionDetailsMapper {
  static toDomain({
    id,
    content,
    authorId,
    createdAt,
    updatedAt,
    author: { name },
    attachments,
    slug,
    title,
    bestAnswerId,
  }: PrismaQuestionDetails): QuestionDetails {
    return QuestionDetails.create({
      questionId: new UniqueEntityID(id),
      slug: Slug.create(slug),
      title,
      content,
      authorId: new UniqueEntityID(authorId),
      author: name,
      attachments: attachments.map(PrismaAttachmentMapper.toDomain),
      bestAnswerId: bestAnswerId ? new UniqueEntityID(bestAnswerId) : null,
      createdAt,
      updatedAt,
    })
  }
}
