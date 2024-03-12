import { ConfigModule, ConfigType } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import environmentConfig from './environment.config';

describe('jwtConfig', () => {
  let config: ConfigType<typeof environmentConfig>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(environmentConfig)],
    }).compile();

    config = module.get<ConfigType<typeof environmentConfig>>(environmentConfig.KEY);
  });

  it('should be defined', () => {
    expect(environmentConfig).toBeDefined();
  });

  // it('should contains expiresIn and secret key', async () => {
  //   expect(config.NODE_ENV).toBe('dev');
  //   expect(config.secretKey).toBe('rzxlszyykpbgqcflzxsqcysyhljt');
  // });
});
