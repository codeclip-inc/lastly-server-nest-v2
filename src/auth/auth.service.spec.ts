import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from './auth.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

// axios 모킹
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// dateUtils 모킹
jest.mock('src/utils/dateUtils', () => ({
  getKoreanDate: jest.fn(),
  combineDateAndTime: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let configService: ConfigService;
  let prismaService: PrismaService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockPrismaService = {
    authHistory: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('서비스가 정의되어야 한다', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationCode', () => {
    const phoneNumber = '010-1234-5678';
    const mockCode = '123456';
    const mockToday = '2024-01-01';
    const mockStartTime = '2024-01-01 00:00:00';
    const mockEndTime = '2024-01-01 23:59:59';

    beforeEach(() => {
      // Math.random 모킹
      jest.spyOn(Math, 'random').mockReturnValue(0.123456);
      jest.spyOn(Math, 'floor').mockReturnValue(123456);

      // dateUtils 모킹
      const { getKoreanDate, combineDateAndTime } = require('src/utils/dateUtils');
      getKoreanDate.mockReturnValue(mockToday);
      combineDateAndTime
        .mockReturnValueOnce(mockStartTime)
        .mockReturnValueOnce(mockEndTime);
    });

    it('개발 환경에서 인증 코드를 성공적으로 전송해야 한다', async () => {
      // 준비
      const mockHistory = [];
      const mockUser = null;
      const mockAxiosResponse = { data: { result_code: '1' } };

      mockConfigService.get
        .mockReturnValueOnce('develop') // NODE_ENV
        .mockReturnValueOnce('test-aligo-key'); // ALIGO_KEY

      mockPrismaService.authHistory.findMany.mockResolvedValue(mockHistory);
      mockPrismaService.authHistory.create.mockResolvedValue({});
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockedAxios.post.mockResolvedValue(mockAxiosResponse);

      // 실행
      const result = await service.sendVerificationCode(phoneNumber);

      // 검증
      expect(result).toEqual({ isUser: false });
      expect(mockPrismaService.authHistory.findMany).toHaveBeenCalledWith({
        where: {
          phoneNumber,
          createDate: {
            gte: mockStartTime,
            lte: mockEndTime,
          }
        }
      });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://apis.aligo.in/send/',
        {
          key: 'test-aligo-key',
          user_id: 'codeclip',
          sender: '031-376-2399',
          receiver: phoneNumber,
          msg: '[LastLy]\n인증번호는 123456 입니다.'
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      expect(mockPrismaService.authHistory.create).toHaveBeenCalledWith({
        data: {
          phoneNumber,
          code: mockCode,
          createDate: mockToday,
        }
      });
    });

    it('기존 사용자에게 인증 코드를 전송할 때 isUser가 true를 반환해야 한다', async () => {
      // 준비
      const mockHistory = [];
      const mockUser = { id: 1, phone: phoneNumber, name: 'Test User' };
      const mockAxiosResponse = { data: { result_code: '1' } };

      mockConfigService.get
        .mockReturnValueOnce('develop')
        .mockReturnValueOnce('test-aligo-key');

      mockPrismaService.authHistory.findMany.mockResolvedValue(mockHistory);
      mockPrismaService.authHistory.create.mockResolvedValue({});
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockedAxios.post.mockResolvedValue(mockAxiosResponse);

      // 실행
      const result = await service.sendVerificationCode(phoneNumber);

      // 검증
      expect(result).toEqual({ isUser: true });
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          phone: phoneNumber,
        }
      });
    });

    it('프로덕션 환경에서 하루 10번 이상 요청 시 BadRequestException을 발생시켜야 한다', async () => {
      // 준비
      const mockHistory = Array(10).fill({}); // 10개의 히스토리

      mockConfigService.get.mockReturnValue('production');
      mockPrismaService.authHistory.findMany.mockResolvedValue(mockHistory);

      // 실행 & 검증
      await expect(service.sendVerificationCode(phoneNumber))
        .rejects
        .toThrow(BadRequestException);
      await expect(service.sendVerificationCode(phoneNumber))
        .rejects
        .toThrow('하루에 10번 이상 인증 코드를 요청할 수 없습니다.');
    });

    it('개발 환경에서는 하루 10번 이상 요청해도 허용해야 한다', async () => {
      // 준비
      const mockHistory = Array(15).fill({}); // 15개의 히스토리
      const mockAxiosResponse = { data: { result_code: '1' } };

      mockConfigService.get
        .mockReturnValueOnce('develop')
        .mockReturnValueOnce('test-aligo-key');

      mockPrismaService.authHistory.findMany.mockResolvedValue(mockHistory);
      mockPrismaService.authHistory.create.mockResolvedValue({});
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockedAxios.post.mockResolvedValue(mockAxiosResponse);

      // 실행
      const result = await service.sendVerificationCode(phoneNumber);

      // 검증
      expect(result).toEqual({ isUser: false });
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('SMS API 호출 실패 시 InternalServerErrorException을 발생시켜야 한다', async () => {
      // 준비
      const mockHistory = [];

      mockConfigService.get
        .mockReturnValueOnce('develop')
        .mockReturnValueOnce('test-aligo-key');

      mockPrismaService.authHistory.findMany.mockResolvedValue(mockHistory);
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      // 실행 & 검증
      await expect(service.sendVerificationCode(phoneNumber))
        .rejects
        .toThrow(InternalServerErrorException);
      await expect(service.sendVerificationCode(phoneNumber))
        .rejects
        .toThrow('인증 코드 전송에 실패했습니다.');
    });

    it('인증 코드가 6자리 숫자로 생성되어야 한다', async () => {
      // 준비
      const mockHistory = [];
      const mockAxiosResponse = { data: { result_code: '1' } };

      // Math.random을 여러 번 호출하여 다양한 코드 생성 테스트
      const randomSpy = jest.spyOn(Math, 'random');
      const floorSpy = jest.spyOn(Math, 'floor');

      mockConfigService.get
        .mockReturnValueOnce('develop')
        .mockReturnValueOnce('test-aligo-key');

      mockPrismaService.authHistory.findMany.mockResolvedValue(mockHistory);
      mockPrismaService.authHistory.create.mockResolvedValue({});
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockedAxios.post.mockResolvedValue(mockAxiosResponse);

      // 실행
      await service.sendVerificationCode(phoneNumber);

      // 검증
      expect(randomSpy).toHaveBeenCalled();
      expect(floorSpy).toHaveBeenCalledWith(100000 + 0.123456 * 900000);
      
      // 생성된 코드가 6자리 숫자인지 확인
      const createdCode = mockPrismaService.authHistory.create.mock.calls[0][0].data.code;
      expect(createdCode).toMatch(/^\d{6}$/);
    });

    it('인증 히스토리가 올바른 데이터로 생성되어야 한다', async () => {
      // 준비
      const mockHistory = [];
      const mockAxiosResponse = { data: { result_code: '1' } };

      mockConfigService.get
        .mockReturnValueOnce('develop')
        .mockReturnValueOnce('test-aligo-key');

      mockPrismaService.authHistory.findMany.mockResolvedValue(mockHistory);
      mockPrismaService.authHistory.create.mockResolvedValue({});
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockedAxios.post.mockResolvedValue(mockAxiosResponse);

      // 실행
      await service.sendVerificationCode(phoneNumber);

      // 검증
      expect(mockPrismaService.authHistory.create).toHaveBeenCalledWith({
        data: {
          phoneNumber,
          code: mockCode,
          createDate: mockToday,
        }
      });
    });
  });

  describe('환경 설정', () => {
    it('NODE_ENV가 develop일 때 IS_DEV가 true여야 한다', () => {
      // 준비
      mockConfigService.get.mockReturnValue('develop');

      // 실행
      const service = new AuthService(configService, prismaService);

      // 검증
      expect(service['IS_DEV']).toBe(true);
    });

    it('NODE_ENV가 production일 때 IS_DEV가 false여야 한다', () => {
      // 준비
      mockConfigService.get.mockReturnValue('production');

      // 실행
      const service = new AuthService(configService, prismaService);

      // 검증
      expect(service['IS_DEV']).toBe(false);
    });

    it('NODE_ENV가 undefined일 때 IS_DEV가 false여야 한다', () => {
      // 준비
      mockConfigService.get.mockReturnValue(undefined);

      // 실행
      const service = new AuthService(configService, prismaService);

      // 검증
      expect(service['IS_DEV']).toBe(false);
    });
  });
});
