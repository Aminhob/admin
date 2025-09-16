import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { License } from './License';

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  BIANNUAL = 'biannual',
  ANNUAL = 'annual',
  ONE_TIME = 'one_time',
}

@Entity('license_plans')
export class LicensePlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: BillingCycle, default: BillingCycle.MONTHLY })
  billingCycle: BillingCycle;

  @Column({ type: 'integer', default: 1 })
  durationMonths: number;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  features: Record<string, any>;

  @Column({ type: 'integer', default: 1 })
  maxDevices: number;

  @Column({ type: 'boolean', default: false })
  isTrial: boolean;

  @Column({ type: 'integer', nullable: true })
  trialDays: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  agentCommissionRate: number;

  @OneToMany(() => License, (license) => license.plan)
  licenses: License[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
