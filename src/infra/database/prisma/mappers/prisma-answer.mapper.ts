import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Answer } from '@/domain/forum/enterprise/entities/answer'
import { Answer as PrismaAnswer, Prisma } from '@prisma/client'

export class PrismaAnswerMapper {
  static toDomain({
    id,
    content,
    authorId,
    createdAt,
    updatedAt,
    questionId,
  }: PrismaAnswer): Answer {
    return Answer.create(
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
  }: Answer): Prisma.AnswerUncheckedCreateInput {
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
