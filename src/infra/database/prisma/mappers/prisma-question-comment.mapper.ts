import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { QuestionComment } from '@/domain/forum/enterprise/entities/question-comment'
import { Comment as PrismaQuestionComment, Prisma } from '@prisma/client'

export class PrismaQuestionCommentMapper {
  static toDomain({
    id,
    content,
    authorId,
    createdAt,
    updatedAt,
    questionId,
  }: PrismaQuestionComment): QuestionComment {
    if (!questionId) {
      throw new Error('Invalid comment type')
    }

    return QuestionComment.create(
      {
        content,
        createdAt,
        questionId: new UniqueEntityID(questionId),
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
    questionId,
  }: QuestionComment): Prisma.CommentUncheckedCreateInput {
    return {
      content,
      questionId: String(questionId),
      createdAt,
      updatedAt,
      id: String(id),
      authorId: String(authorId),
    }
  }
}
