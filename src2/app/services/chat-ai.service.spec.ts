import { TestBed } from '@angular/core/testing';

import { ChatAiService } from './chat-ai.service';

describe('ChatAiService', () => {
  let service: ChatAiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatAiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
