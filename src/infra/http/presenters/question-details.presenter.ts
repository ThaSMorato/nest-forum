import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details'
import { AttachmentPresenter } from './attachment.presenter'

export class QuestionDetailsPresenter {
  static toHTTP({
    attachments,
    author,
    authorId,
    content,
    questionId,
    title,
    slug,
    bestAnswerId,
    createdAt,
    updatedAt,
  }: QuestionDetails) {
    return {
      questionId: String(questionId),
      title,
      slug: slug.value,
      content,
      bestAnswerId: bestAnswerId ? String(bestAnswerId) : null,
      authorId: String(authorId),
      author,
      attachments: attachments.map(AttachmentPresenter.toHTTP),
      createdAt,
      updatedAt,
    }
  }
}
