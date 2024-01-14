import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Notification } from '@/domain/notification/enterprise/entities/notification'
import { Notification as PrismaNotification, Prisma } from '@prisma/client'

export class PrismaNotificationMapper {
  static toDomain({
    id,
    title,
    content,
    createdAt,
    readAt,
    recipientId,
  }: PrismaNotification): Notification {
    return Notification.create(
      {
        title,
        content,
        createdAt,
        readAt,
        recipientId: new UniqueEntityID(recipientId),
      },
      new UniqueEntityID(id),
    )
  }

  static toPrisma({
    id,
    content,
    createdAt,
    title,
    readAt,
    recipientId,
  }: Notification): Prisma.NotificationUncheckedCreateInput {
    return {
      content,
      createdAt,
      title,
      readAt,
      id: String(id),
      recipientId: String(recipientId),
    }
  }
}
