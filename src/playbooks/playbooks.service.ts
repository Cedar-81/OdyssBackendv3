import { Injectable } from "@nestjs/common";
import { CreatePlaybookDto } from './dto/create-playbook.dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { createPlaybookDocFromDto, decodeFileDataToYDoc, yDocToJSON } from './interfaces/playbook-helper.interface';
import * as Y from 'yjs';


@Injectable()
export class PlaybookService {
    constructor(private readonly supabaseService: SupabaseService) {}

    async createPlaybook(userId: string, playbookData: CreatePlaybookDto) {
        try {
            console.log('🔧 PlaybookService.createPlaybook called with:');
            console.log('  userId:', userId);
            console.log('  playbookData:', JSON.stringify(playbookData, null, 2));
            
            const client = this.supabaseService.getClient()
            const ydoc = createPlaybookDocFromDto(playbookData); 
            const initialState = Buffer.from(Y.encodeStateAsUpdate(ydoc));
            
            console.log('  YDoc created, initialState length:', initialState.length, playbookData.playbookId);
            
            const insertData = {
                id: playbookData.playbookId,
                owner_id: userId,
                file_data: initialState
            };
            // console.log('  Inserting data:', JSON.stringify(insertData, null, 2));

            const { data, error } = await client.from("playbooksv2").insert(insertData).select("id").single()

            console.log('  Supabase response:');
            console.log('    data:', data);
            console.log('    error:', error);

            if (error) {
                console.error('  Supabase error:', error);
                throw new Error(`Error creating playbook: ${error.message}`);
            }

            if (!data || !data.id) {
                console.error('  No data returned from Supabase');
                throw new Error('No data returned from Supabase insert operation');
            }

            console.log('  ✅ Playbook created successfully with ID:', data.id);
            // Return the new playbook ID so client can join its room
            return { playbookId: data.id };
            
        } catch (error) {
            console.error('  ❌ Error in createPlaybook:', error);
            throw error;
        }
    }

    async loadPlaybook(playbookId: string, userId: string) {
        const client = this.supabaseService.getClient();

        // Fetch the playbook from DB
        const { data, error } = await client
            .from("playbooksv2")
            .select("id, owner_id, file_data")
            .eq("id", playbookId)
            .single();

        if (error) {
            throw new Error(`Error loading playbook: ${error.message}`);
        }

        // Access control — only owner or collaborators can open
        if (data.owner_id !== userId) {
            throw new Error("Access denied");
        }

        const decodedFileDataToYdoc = decodeFileDataToYDoc(data.file_data)
        const decodedYdocToJson = yDocToJSON(decodedFileDataToYdoc)
        console.log('decodedJson: ', decodedYdocToJson)
        
        return {
            playbookId: data.id,
            ownerId: data.owner_id,
            fileData: data.file_data, // this is the encoded Yjs state
            fileDataJson: decodedYdocToJson
        };
    }

    async savePlaybook(playbookId: string, ydoc: Y.Doc) {
        const client = this.supabaseService.getClient();

        // Encode the Y.Doc state to a binary format
        const update = Buffer.from(Y.encodeStateAsUpdate(ydoc));

        const { error } = await client
            .from("playbooksv2")
            .update({ file_data: update })
            .eq("id", playbookId);

        if (error) {
            throw new Error(`Error saving playbook: ${error.message}`);
        }
    }

}
