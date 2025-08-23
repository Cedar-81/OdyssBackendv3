import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncGateway } from './sync.gateway';
import { PlaybooksModule } from 'src/playbooks/playbooks.module';
import { PlaybookDocsStore } from 'src/playbooks/playbook-docs.store';
import { AiModule } from 'src/ai/ai.module';

@Module({
    imports: [PlaybooksModule, AiModule],
    providers: [SyncService, SyncGateway, PlaybookDocsStore],
    exports: [SyncService],
})
export class CollabModule {

}
