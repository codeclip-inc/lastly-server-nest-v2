import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAccessToken', () => {
    it('올바른 매개변수로 액세스 토큰을 생성해야 한다', () => {
      // 준비
      const userId = BigInt(123);
      const mockToken = 'mock.access.token';
      const mockSecret = 'access-secret';
      const mockExpiresIn = '15m';

      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return mockSecret;
        if (key === 'JWT_ACCESS_EXPIRES_IN') return mockExpiresIn;
        return undefined;
      });

      mockJwtService.sign.mockReturnValue(mockToken);

      // 실행
      const result = service.generateAccessToken(userId);

      // 검증
      expect(result).toBe(mockToken);
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: '123' },
        {
          secret: mockSecret,
          expiresIn: mockExpiresIn,
        }
      );
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_ACCESS_EXPIRES_IN');
    });

    it('bigint userId를 올바르게 처리해야 한다', () => {
      // 준비
      const userId = BigInt(999999999999999);
      const mockToken = 'mock.token';
      
      mockConfigService.get.mockReturnValue('secret');
      mockJwtService.sign.mockReturnValue(mockToken);

      // 실행
      const result = service.generateAccessToken(userId);

      // 검증
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: '999999999999999' },
        expect.any(Object)
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('generateRefreshToken', () => {
    it('올바른 매개변수로 리프레시 토큰을 생성해야 한다', () => {
      // 준비
      const userId = BigInt(456);
      const mockToken = 'mock.refresh.token';
      const mockSecret = 'refresh-secret';
      const mockExpiresIn = '7d';

      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'JWT_REFRESH_SECRET') return mockSecret;
        if (key === 'JWT_REFRESH_EXPIRES_IN') return mockExpiresIn;
        return undefined;
      });

      mockJwtService.sign.mockReturnValue(mockToken);

      // 실행
      const result = service.generateRefreshToken(userId);

      // 검증
      expect(result).toBe(mockToken);
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: '456' },
        {
          secret: mockSecret,
          expiresIn: mockExpiresIn,
        }
      );
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_REFRESH_EXPIRES_IN');
    });
  });

  describe('verifyAccessToken', () => {
    it('유효한 액세스 토큰을 성공적으로 검증해야 한다', () => {
      // 준비
      const mockToken = 'valid.access.token';
      const mockPayload = { sub: '123', role: 'user' };
      const mockSecret = 'access-secret';

      mockConfigService.get.mockReturnValue(mockSecret);
      mockJwtService.verify.mockReturnValue(mockPayload);

      // 실행
      const result = service.verifyAccessToken(mockToken);

      // 검증
      expect(result).toEqual(mockPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(mockToken, {
        secret: mockSecret,
      });
    });

    it('잘못된 액세스 토큰에 대해 null을 반환해야 한다', () => {
      // 준비
      const mockToken = 'invalid.access.token';
      const mockSecret = 'access-secret';

      mockConfigService.get.mockReturnValue(mockSecret);
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // 실행
      const result = service.verifyAccessToken(mockToken);

      // 검증
      expect(result).toBeNull();
      expect(mockJwtService.verify).toHaveBeenCalledWith(mockToken, {
        secret: mockSecret,
      });
    });

    it('JWT 검증에서 어떤 에러가 발생해도 null을 반환해야 한다', () => {
      // 준비
      const mockToken = 'error.token';
      const mockSecret = 'access-secret';

      mockConfigService.get.mockReturnValue(mockSecret);
      mockJwtService.verify.mockImplementation(() => {
        throw new TypeError('Any error type');
      });

      // 실행
      const result = service.verifyAccessToken(mockToken);

      // 검증
      expect(result).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('유효한 리프레시 토큰을 성공적으로 검증해야 한다', () => {
      // 준비
      const mockToken = 'valid.refresh.token';
      const mockPayload = { sub: '123', role: 'user' };
      const mockSecret = 'refresh-secret';

      mockConfigService.get.mockReturnValue(mockSecret);
      mockJwtService.verify.mockReturnValue(mockPayload);

      // 실행
      const result = service.verifyRefreshToken(mockToken);

      // 검증
      expect(result).toEqual(mockPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(mockToken, {
        secret: mockSecret,
      });
    });

    it('잘못된 리프레시 토큰에 대해 null을 반환해야 한다', () => {
      // 준비
      const mockToken = 'invalid.refresh.token';
      const mockSecret = 'refresh-secret';

      mockConfigService.get.mockReturnValue(mockSecret);
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // 실행
      const result = service.verifyRefreshToken(mockToken);

      // 검증
      expect(result).toBeNull();
    });
  });

  describe('decodeToken', () => {
    it('토큰을 성공적으로 디코딩해야 한다', () => {
      // 준비
      const mockToken = 'mock.token';
      const mockDecoded = { sub: '123', role: 'user' };

      mockJwtService.decode.mockReturnValue(mockDecoded);

      // 실행
      const result = service.decodeToken(mockToken);

      // 검증
      expect(result).toEqual(mockDecoded);
      expect(mockJwtService.decode).toHaveBeenCalledWith(mockToken);
    });

    it('null 디코딩 결과를 처리해야 한다', () => {
      // 준비
      const mockToken = 'mock.token';

      mockJwtService.decode.mockReturnValue(null);

      // 실행
      const result = service.decodeToken(mockToken);

      // 검증
      expect(result).toBeNull();
      expect(mockJwtService.decode).toHaveBeenCalledWith(mockToken);
    });
  });

  describe('configuration handling', () => {
    it('누락된 설정값을 우아하게 처리해야 한다', () => {
      // 준비
      const userId = BigInt(123);
      
      mockConfigService.get.mockReturnValue(undefined);

      // 실행 & 검증
      expect(() => service.generateAccessToken(userId)).not.toThrow();
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: '123' },
        {
          secret: undefined,
          expiresIn: undefined,
        }
      );
    });

    it('올바른 키로 설정 서비스를 호출해야 한다', () => {
      // 준비
      const userId = BigInt(123);
      
      mockConfigService.get.mockReturnValue('secret');
      mockJwtService.sign.mockReturnValue('token');

      // 실행
      service.generateAccessToken(userId);
      service.generateRefreshToken(userId);

      // 검증
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_ACCESS_EXPIRES_IN');
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_REFRESH_EXPIRES_IN');
    });
  });
});
