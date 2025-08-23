// playbook-docs.store.ts
import { Injectable } from '@nestjs/common';
import * as Y from 'yjs';

@Injectable()
export class PlaybookDocsStore {
  public docs: Map<string, Y.Doc> = new Map();
}
