import { OnAnswerCreated } from '@/domain/notification/application/subscribers/on-answer-created'
// import { OnNewAnswerComment } from '@/domain/notification/application/subscribers/on-new-answer-comment'
// import { OnNewQuestionComment } from '@/domain/notification/application/subscribers/on-new-question-comment'
import { OnQuestionBestAnswerChosen } from '@/domain/notification/application/subscribers/on-question-best-answer-chosen'
import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification'
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [DatabaseModule],
  providers: [
    OnAnswerCreated,
    OnQuestionBestAnswerChosen,
    // OnNewAnswerComment,
    // OnNewQuestionComment,
    SendNotificationUseCase,
  ],
})
export class EventsModule {}
