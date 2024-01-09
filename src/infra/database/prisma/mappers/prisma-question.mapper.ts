import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Question } from '@/domain/forum/enterprise/entities/question'
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug'
import { Question as PrismaQuestion, Prisma } from '@prisma/client'

export class PrismaQuestionMapper {
  static toDomain({
    id,
    title,
    content,
    authorId,
    createdAt,
    slug,
    updatedAt,
    bestAnswerId,
  }: PrismaQuestion): Question {
    return Question.create(
      {
        title,
        content,
        createdAt,
        updatedAt,
        slug: Slug.create(slug),
        authorId: new UniqueEntityID(authorId),
        bestAnswerId: bestAnswerId ? new UniqueEntityID(bestAnswerId) : null,
      },
      new UniqueEntityID(id),
    )
  }

  static toPrisma({
    id,
    authorId,
    bestAnswerId,
    content,
    createdAt,
    slug,
    title,
    updatedAt,
  }: Question): Prisma.QuestionUncheckedCreateInput {
    return {
      content,
      createdAt,
      title,
      updatedAt,
      slug: slug.value,
      id: String(id),
      authorId: String(authorId),
      bestAnswerId: bestAnswerId ? String(bestAnswerId) : null,
    }
  }
}
