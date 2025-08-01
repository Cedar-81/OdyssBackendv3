import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Playbook } from './playbook.entity';

@Entity('playbookdata')
export class PlaybookData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'playbook_id', nullable: false })
  playbookId: string;

  @Column({ type: 'jsonb', nullable: false })
  data: any;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Playbook, playbook => playbook.playbookData)
  @JoinColumn({ name: 'playbook_id' })
  playbook: Playbook;
} 