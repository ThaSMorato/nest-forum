import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author'

export class CommentWithAuthorPresenter {
  static toHTTP({
    createdAt,
    updatedAt,
    content,
    author,
    authorId,
    commentId,
  }: CommentWithAuthor) {
    return {
      commentId: String(commentId),
      authorId: String(authorId),
      authorName: author,
      content,
      createdAt,
      updatedAt,
    }
  }
}
