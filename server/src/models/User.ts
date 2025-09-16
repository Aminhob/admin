import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { License } from './License';
import { Transaction } from './Transaction';
import { Device } from './Device';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  AGENT = 'agent',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  agentId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @OneToMany(() => License, (license) => license.user)
  licenses: License[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Device, (device) => device.user)
  devices: Device[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // For agents only
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commissionRate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCommission: number;
}
