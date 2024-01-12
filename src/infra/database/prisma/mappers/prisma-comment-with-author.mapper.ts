import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author'
import { Comment as PrismaComment, User as PrismaUser } from '@prisma/client'

type PrismaCommentWithAuthor = PrismaComment & {
  author: PrismaUser
}

export class PrismaCommentMapper {
  static toDomain({
    id,
    content,
    authorId,
    createdAt,
    updatedAt,
    author: { name },
  }: PrismaCommentWithAuthor): CommentWithAuthor {
    return CommentWithAuthor.create({
      content,
      createdAt,
      updatedAt,
      authorId: new UniqueEntityID(authorId),
      commentId: new UniqueEntityID(id),
      author: name,
    })
  }
}
