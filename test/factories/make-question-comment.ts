import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  QuestionComment,
  QuestionCommentProps,
} from '@/domain/forum/enterprise/entities/question-comment'
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author'
import { PrismaQuestionCommentMapper } from '@/infra/database/prisma/mappers/prisma-question-comment.mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

export function makeQuestionComment(
  override: Partial<QuestionCommentProps> = {},
  id?: UniqueEntityID,
) {
  const questionComment = QuestionComment.create(
    {
      authorId: new UniqueEntityID(),
      content: faker.lorem.text(),
      questionId: new UniqueEntityID(),
      ...override,
    },
    id,
  )

  return questionComment
}

export function makeQuestionCommentWithAuthor(
  override: Partial<CommentWithAuthor> = {},
) {
  const questionComment = CommentWithAuthor.create({
    authorId: new UniqueEntityID(),
    content: faker.lorem.text(),
    author: faker.person.fullName(),
    commentId: new UniqueEntityID(),
    createdAt: new Date(),
    ...override,
  })

  return questionComment
}

@Injectable()
export class QuestionCommentFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaQuestionComment(
    override: Partial<QuestionCommentProps> = {},
    id?: UniqueEntityID,
  ): Promise<QuestionComment> {
    const questioncomment = makeQuestionComment(override, id)

    await this.prisma.comment.create({
      data: PrismaQuestionCommentMapper.toPrisma(questioncomment),
    })

    return questioncomment
  }
}
