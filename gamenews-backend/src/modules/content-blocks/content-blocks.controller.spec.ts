import { Test, TestingModule } from '@nestjs/testing';
import { ContentBlocksController } from './content-blocks.controller.js';

describe('ContentBlocksController', () => {
  let controller: ContentBlocksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentBlocksController],
    }).compile();

    controller = module.get<ContentBlocksController>(ContentBlocksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
