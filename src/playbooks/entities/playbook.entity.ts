import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { PlaybookData } from './playbook-data.entity';
import { PlaybookParticipant } from './playbook-participant.entity';

@Entity('playbooks')
export class Playbook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  title: string;

  @Column({ type: 'uuid', name: 'owner_id', nullable: false })
  ownerId: string;

  @Column({ type: 'text', nullable: true })
  destination: string;

  @Column({ type: 'date', name: 'start_date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date', nullable: true })
  endDate: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // Relations
  @OneToMany(() => PlaybookData, playbookData => playbookData.playbook)
  playbookData: PlaybookData[];

  @OneToMany(() => PlaybookParticipant, participant => participant.playbook)
  participants: PlaybookParticipant[];
} 