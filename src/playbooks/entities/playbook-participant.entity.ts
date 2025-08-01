import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Playbook } from './playbook.entity';

@Entity('playbookparticipants')
export class PlaybookParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'playbook_id', nullable: false })
  playbookId: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: false })
  userId: string;

  @Column({ type: 'text', nullable: false })
  role: string;

  @CreateDateColumn({ name: 'joined_at', type: 'timestamp' })
  joinedAt: Date;

  // Relations
  @ManyToOne(() => Playbook, playbook => playbook.participants)
  @JoinColumn({ name: 'playbook_id' })
  playbook: Playbook;
} 