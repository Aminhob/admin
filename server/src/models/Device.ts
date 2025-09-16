import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { License } from './License';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  deviceId: string;

  @Column({ type: 'varchar', length: 100 })
  platform: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  osVersion: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  appVersion: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  licenseId: string | null;

  @ManyToOne(() => License, (license) => null, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'licenseId' })
  license: License | null;

  @Column({ type: 'timestamp', nullable: true })
  lastActiveAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
