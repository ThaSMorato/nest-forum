import { InMemoryStudentsRepository } from '$/repositories/in-memory/in-memory-students-repository'
import { RegisterStudentUseCase } from '@/domain/forum/application/use-cases/register-student'
import { FakeHasher } from '../cryptography/fake-hasher'

let sut: RegisterStudentUseCase
let inMemoryRepository: InMemoryStudentsRepository
let fakeHasher: FakeHasher

describe('Create Student Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      fakeHasher = new FakeHasher()
      inMemoryRepository = new InMemoryStudentsRepository()
      sut = new RegisterStudentUseCase(inMemoryRepository, fakeHasher)
    })

    it('should be able to register a new student', async () => {
      const spyCreate = vi.spyOn(inMemoryRepository, 'create')
      const spyHash = vi.spyOn(fakeHasher, 'hash')

      const response = await sut.execute({
        email: 'jhon@doe.com',
        name: 'Jhon Doe',
        password: '1234567',
      })

      expect(response.isRight()).toBeTruthy()

      expect(response.value).toEqual({
        student: expect.objectContaining({
          email: 'jhon@doe.com',
          name: 'Jhon Doe',
        }),
      })

      expect(spyCreate).toBeCalled()
      expect(spyHash).toBeCalled()

      expect(inMemoryRepository.items.length).toEqual(1)
    })

    it('should hash student password on registration', async () => {
      const response = await sut.execute({
        email: 'jhon@doe.com',
        name: 'Jhon Doe',
        password: '1234567',
      })

      const hashedPassword = await fakeHasher.hash('1234567')

      expect(response.isRight()).toBeTruthy()
      expect(response.value).toEqual({
        student: expect.objectContaining({
          password: hashedPassword,
        }),
      })
    })
  })
})
