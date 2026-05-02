import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: { sign: () => 'test-token' } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return user when credentials are valid', async () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      password: 'hashed',
      roles: [],
    };
    mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser('test@test.com', 'password');
    expect(result).toBeDefined();
    expect(result?.email).toBe('test@test.com');
  });

  it('should return null when user not found', async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue(null);
    const result = await service.validateUser('notfound@test.com', 'password');
    expect(result).toBeNull();
  });
});