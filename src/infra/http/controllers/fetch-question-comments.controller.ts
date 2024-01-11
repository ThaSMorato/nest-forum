import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { z } from 'zod'
import { FetchQuestionCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-question-comments'
import { CommentPresenter } from '../presenters/comment.presenter'

const fetchQuestionCommentsQuerySchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(
  fetchQuestionCommentsQuerySchema,
)

type FetchQuestionCommentsQuerySchema = z.infer<
  typeof fetchQuestionCommentsQuerySchema
>

@Controller('/questions/:questionId/comments')
export class FetchQuestionCommentsController {
  constructor(private fetchQuestionComments: FetchQuestionCommentsUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query('page', queryValidationPipe) page: FetchQuestionCommentsQuerySchema,
    @Param('questionId') questionId: string,
  ) {
    const result = await this.fetchQuestionComments.execute({
      page,
      questionId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const { questionComments } = result.value

    return {
      comments: questionComments.map(CommentPresenter.toHTTP),
    }
  }
}
