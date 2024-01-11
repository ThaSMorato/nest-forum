import { InMemoryAttachmentsRepository } from '$/repositories/in-memory/in-memory-attachments-repository'
import { UploadAndCreateAttachmentUseCase } from '@/domain/forum/application/use-cases/upload-and-create-attachment'
import { FakeUploader } from '../storage/fake-uploader'
import { InvalidAttachmentTypeError } from '@/domain/forum/application/use-cases/error/invalid-attachment-type-error'

let sut: UploadAndCreateAttachmentUseCase
let inMemoryRepository: InMemoryAttachmentsRepository
let fakeUploader: FakeUploader

describe('Create Attachment Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      fakeUploader = new FakeUploader()
      inMemoryRepository = new InMemoryAttachmentsRepository()
      sut = new UploadAndCreateAttachmentUseCase(
        inMemoryRepository,
        fakeUploader,
      )
    })

    it('should be able to upload and create an attachment', async () => {
      const spyCreate = vi.spyOn(inMemoryRepository, 'create')
      const spyAttach = vi.spyOn(fakeUploader, 'upload')

      const response = await sut.execute({
        fileName: 'profile.png',
        fileType: 'image/png',
        body: Buffer.from(''),
      })

      expect(response.isRight()).toBeTruthy()
      expect(spyCreate).toBeCalled()
      expect(spyAttach).toBeCalled()
      expect(response.value).toEqual({
        attachment: expect.objectContaining({
          title: 'profile.png',
          url: expect.stringContaining('profile.png'),
        }),
      })
      expect(inMemoryRepository.items.length).toEqual(1)
      expect(fakeUploader.uploads).toHaveLength(1)
      expect(fakeUploader.uploads[0]).toEqual(
        expect.objectContaining({
          fileName: 'profile.png',
          url: expect.stringContaining('profile.png'),
        }),
      )
    })

    it('should not be able to upload an attacment with wrong file type', async () => {
      const spyCreate = vi.spyOn(inMemoryRepository, 'create')
      const spyAttach = vi.spyOn(fakeUploader, 'upload')

      const response = await sut.execute({
        fileName: 'profile.mp3',
        fileType: 'audio/mpeg',
        body: Buffer.from(''),
      })

      expect(response.isLeft()).toBeTruthy()
      expect(spyCreate).not.toBeCalled()
      expect(spyAttach).not.toBeCalled()
      expect(response.value).toBeInstanceOf(InvalidAttachmentTypeError)
    })
  })
})
