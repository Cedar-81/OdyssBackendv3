import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AiService } from 'src/ai/ai.service';
import { CreatePlaybookDto } from 'src/playbooks/dto/create-playbook.dto';
import { createPlaybookDocFromDto } from 'src/playbooks/interfaces/playbook-helper.interface';
import { PlaybookDocsStore } from 'src/playbooks/playbook-docs.store';
import { PlaybookService } from 'src/playbooks/playbooks.service';
import * as Y from 'yjs';

@WebSocketGateway({
  cors: { origin: '*' }, // Adjust as needed
})
export class SyncGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private readonly playbookService: PlaybookService, private readonly docsStore: PlaybookDocsStore, private readonly odyssAIService: AiService) {}

    @WebSocketServer()
    server: Server;

    //handle load Playbook
    @SubscribeMessage('load-playbook')
    async handleLoadPlaybook(
        @MessageBody() body: { room: string; user_id: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.join(body.room);

        if (!this.docsStore.docs.has(body.room)) {
            const playbook = await this.playbookService.loadPlaybook(body.room, client.data.userId);
            const ydoc = new Y.Doc();

            // Load state from DB
            const update = new Uint8Array(playbook.fileData);
            Y.applyUpdate(ydoc, update);

            this.docsStore.docs.set(body.room, ydoc);
        }

        // Send current state to this client
        const currentDoc = this.docsStore.docs.get(body.room);
        if (!currentDoc) {
            throw new Error(`No doc found for room ${body.room}`);
        }
        const state = Y.encodeStateAsUpdate(currentDoc);
        client.emit('init-playbook', state);
    }

    // handle incoming changes
    @SubscribeMessage('update-playbook')
    async handleUpdatePlaybook(
        @MessageBody() body: { room: string; update: CreatePlaybookDto },
        @ConnectedSocket() client: Socket,
    ) {
        const ydoc = this.docsStore.docs.get(body.room);
        if (!ydoc) {
            throw new Error(`No doc found for room ${body.room}`);
        }

        // 1. Capture "before" snapshot
        const beforeUpdate = ydoc.getMap().toJSON();

        // 2. Apply incoming changes
        const updateDoc = createPlaybookDocFromDto(body.update);
        const update = Y.encodeStateAsUpdate(updateDoc);
        Y.applyUpdate(ydoc, update);

        // 3. Capture "after" snapshot
        const afterUpdate = ydoc.getMap().toJSON();


        // 4. Broadcast to other clients
        client.to(body.room).emit('update-playbook', update);

        // 5. Trigger AI update immediately
        try {
            // const aiResponse = await this.odyssAIService.generateFromPlaybookDiff(
            // body.room, // assuming room == playbookId
            // beforeUpdate,
            // afterUpdate,
            // );

            // // Send back AI result to just the updater
            // client.emit('playbook-update-aiResponse', aiResponse);

        } catch (error) {
            console.error('Error in AI update:', error);
            client.emit('playbook-update-error', {
            message: 'Failed to process update',
            });
        }
    }



    //handle delete Playbook
    @SubscribeMessage('delete-playbook')
    handleDeletePlaybook(
        @MessageBody() room: string,
        @ConnectedSocket() client: Socket,
    ) {

    }

    handleConnection(client: Socket, @MessageBody() room: string) {
        console.log('user connected');

        client.join(room);
        console.log(`${client.id} joined room ${room}`);
    }

    handleDisconnect(client: Socket) {
        console.log('user disconnected');

        client.rooms.forEach((room) => {
            if (room !== client.id) {
                const roomSize = this.server.sockets.adapter.rooms.get(room)?.size || 0;
                if (roomSize <= 1) { // last user leaving
                    const ydoc = this.docsStore.docs.get(room);
                    if (ydoc) {
                        this.playbookService.savePlaybook(room, ydoc);
                        this.docsStore.docs.delete(room);
                    }
                }
                client.leave(room);
                console.log(`${client.id} left room ${room}`);
            }
        });
    }

}
