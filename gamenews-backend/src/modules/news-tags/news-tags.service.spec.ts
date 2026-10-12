import { Test, TestingModule } from '@nestjs/testing';
import { NewsTagsService } from './news-tags.service.js';

describe('NewsTagsService', () => {
  let service: NewsTagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewsTagsService],
    }).compile();

    service = module.get<NewsTagsService>(NewsTagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
