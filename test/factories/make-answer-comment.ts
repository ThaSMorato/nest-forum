import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  AnswerComment,
  AnswerCommentProps,
} from '@/domain/forum/enterprise/entities/answer-comment'
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author'
import { PrismaAnswerCommentMapper } from '@/infra/database/prisma/mappers/prisma-answer-comment.mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

export function makeAnswerComment(
  override: Partial<AnswerCommentProps> = {},
  id?: UniqueEntityID,
) {
  const answerComment = AnswerComment.create(
    {
      authorId: new UniqueEntityID(),
      content: faker.lorem.text(),
      answerId: new UniqueEntityID(),
      ...override,
    },
    id,
  )

  return answerComment
}

export function makeAnswerCommentWithAuthor(
  override: Partial<CommentWithAuthor> = {},
) {
  const answerComment = CommentWithAuthor.create({
    authorId: new UniqueEntityID(),
    content: faker.lorem.text(),
    author: faker.person.fullName(),
    commentId: new UniqueEntityID(),
    createdAt: new Date(),
    ...override,
  })

  return answerComment
}

@Injectable()
export class AnswerCommentFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAnswerComment(
    override: Partial<AnswerCommentProps> = {},
    id?: UniqueEntityID,
  ): Promise<AnswerComment> {
    const answercomment = makeAnswerComment(override, id)

    await this.prisma.comment.create({
      data: PrismaAnswerCommentMapper.toPrisma(answercomment),
    })

    return answercomment
  }
}
