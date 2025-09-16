import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { LicensePlan } from './LicensePlan';

export enum LicenseStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  PENDING = 'pending',
}

@Entity('licenses')
export class License {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  licenseKey: string;

  @Column({ type: 'enum', enum: LicenseStatus, default: LicenseStatus.PENDING })
  status: LicenseStatus;

  @Column({ type: 'timestamp', nullable: true })
  activationDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  expirationDate: Date;

  @Column({ type: 'boolean', default: false })
  isTrial: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 100 })
  planId: string;

  @ManyToOne(() => LicensePlan, (plan) => plan.licenses)
  @JoinColumn({ name: 'planId' })
  plan: LicensePlan;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, (user) => user.licenses, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @Column({ type: 'uuid', nullable: true })
  assignedById: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedById' })
  assignedBy: User | null;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isActive(): boolean {
    const now = new Date();
    return (
      this.status === LicenseStatus.ACTIVE &&
      this.expirationDate &&
      this.expirationDate > now
    );
  }
}
