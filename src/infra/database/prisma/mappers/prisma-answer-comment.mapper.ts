import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment'
import { Comment as PrismaAnswerComment, Prisma } from '@prisma/client'

export class PrismaAnswerCommentMapper {
  static toDomain({
    id,
    content,
    authorId,
    createdAt,
    updatedAt,
    answerId,
  }: PrismaAnswerComment): AnswerComment {
    if (!answerId) {
      throw new Error('Invalid comment type')
    }

    return AnswerComment.create(
      {
        content,
        createdAt,
        answerId: new UniqueEntityID(answerId),
        updatedAt,
        authorId: new UniqueEntityID(authorId),
      },
      new UniqueEntityID(id),
    )
  }

  static toPrisma({
    id,
    authorId,
    content,
    createdAt,
    updatedAt,
    answerId,
  }: AnswerComment): Prisma.CommentUncheckedCreateInput {
    return {
      content,
      answerId: String(answerId),
      createdAt,
      updatedAt,
      id: String(id),
      authorId: String(authorId),
    }
  }
}
