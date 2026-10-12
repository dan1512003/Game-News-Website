import { Test, TestingModule } from '@nestjs/testing';
import { NewsTagsController } from './news-tags.controller.js';

describe('NewsTagsController', () => {
  let controller: NewsTagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsTagsController],
    }).compile();

    controller = module.get<NewsTagsController>(NewsTagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
