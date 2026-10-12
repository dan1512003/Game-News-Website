import { Test, TestingModule } from '@nestjs/testing';
import { ContentBlocksService } from './content-blocks.service.js';

describe('ContentBlocksService', () => {
  let service: ContentBlocksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentBlocksService],
    }).compile();

    service = module.get<ContentBlocksService>(ContentBlocksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
