// sync.service.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PlaybookDocsStore } from 'src/playbooks/playbook-docs.store';
import { PlaybookService } from 'src/playbooks/playbooks.service';

@Injectable()
export class SyncService {
  constructor(
    private readonly playbookService: PlaybookService,
    private readonly docsStore: PlaybookDocsStore
  ) {}

  @Cron('*/10 * * * *') // every 2 minutes
  async flushDocsToDB() {
    for (const [playbookId, ydoc] of this.docsStore.docs.entries()) {
      await this.playbookService.savePlaybook(playbookId, ydoc);
    }
  }
}
