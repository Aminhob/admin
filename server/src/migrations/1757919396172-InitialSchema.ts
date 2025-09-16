import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class InitialSchema1757919396172 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.createTable(new Table({
            name: 'users',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid',
                },
                { name: 'email', type: 'varchar', isUnique: true },
                { name: 'password', type: 'varchar' },
                { name: 'firstName', type: 'varchar', isNullable: true },
                { name: 'lastName', type: 'varchar', isNullable: true },
                { 
                    name: 'role', 
                    type: 'enum',
                    enum: ['super_admin', 'agent', 'user'],
                    default: '"user"' 
                },
                { name: 'phoneNumber', type: 'varchar', isNullable: true },
                { name: 'isActive', type: 'boolean', default: true },
                { name: 'agentId', type: 'uuid', isNullable: true },
                { name: 'commissionRate', type: 'decimal', precision: 10, scale: 2, default: 0 },
                { name: 'totalCommission', type: 'decimal', precision: 12, scale: 2, default: 0 },
                { name: 'lastLogin', type: 'timestamp', isNullable: true },
                { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
            ],
        }), true);

        // Create license_plans table
        await queryRunner.createTable(new Table({
            name: 'license_plans',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid',
                },
                { name: 'name', type: 'varchar', isUnique: true },
                { name: 'description', type: 'text', isNullable: true },
                { name: 'price', type: 'decimal', precision: 10, scale: 2 },
                { 
                    name: 'billingCycle', 
                    type: 'enum',
                    enum: ['monthly', 'quarterly', 'biannual', 'annual', 'one_time'],
                    default: '"monthly"' 
                },
                { name: 'durationMonths', type: 'integer', default: 1 },
                { name: 'isActive', type: 'boolean', default: true },
                { name: 'features', type: 'jsonb', isNullable: true },
                { name: 'maxDevices', type: 'integer', default: 1 },
                { name: 'isTrial', type: 'boolean', default: false },
                { name: 'trialDays', type: 'integer', isNullable: true },
                { name: 'agentCommissionRate', type: 'decimal', precision: 5, scale: 2, default: 0 },
                { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
            ],
        }), true);

        // Create licenses table
        await queryRunner.createTable(new Table({
            name: 'licenses',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid',
                },
                { name: 'licenseKey', type: 'varchar', isUnique: true },
                { 
                    name: 'status', 
                    type: 'enum',
                    enum: ['active', 'expired', 'revoked', 'pending'],
                    default: '"pending"' 
                },
                { name: 'activationDate', type: 'timestamp', isNullable: true },
                { name: 'expirationDate', type: 'timestamp', isNullable: true },
                { name: 'isTrial', type: 'boolean', default: false },
                { name: 'metadata', type: 'jsonb', isNullable: true },
                { name: 'notes', type: 'text', isNullable: true },
                { name: 'planId', type: 'uuid' },
                { name: 'userId', type: 'uuid', isNullable: true },
                { name: 'assignedById', type: 'uuid', isNullable: true },
                { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
            ],
        }), true);

        // Create transactions table
        await queryRunner.createTable(new Table({
            name: 'transactions',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid',
                },
                { 
                    name: 'type', 
                    type: 'enum',
                    enum: ['license_purchase', 'license_renewal', 'commission_payout', 'refund'],
                },
                { 
                    name: 'status', 
                    type: 'enum',
                    enum: ['pending', 'completed', 'failed', 'refunded'],
                    default: '"pending"' 
                },
                { name: 'amount', type: 'decimal', precision: 12, scale: 2 },
                { name: 'currency', type: 'varchar', length: '3', default: '"USD"' },
                { name: 'description', type: 'text', isNullable: true },
                { name: 'metadata', type: 'jsonb', isNullable: true },
                { name: 'licenseId', type: 'uuid', isNullable: true },
                { name: 'userId', type: 'uuid' },
                { name: 'agentId', type: 'uuid', isNullable: true },
                { name: 'commissionAmount', type: 'decimal', precision: 10, scale: 2, isNullable: true },
                { name: 'commissionRate', type: 'decimal', precision: 5, scale: 2, isNullable: true },
                { name: 'commissionPaid', type: 'boolean', default: false },
                { name: 'commissionPaidAt', type: 'timestamp', isNullable: true },
                { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
            ],
        }), true);

        // Create devices table
        await queryRunner.createTable(new Table({
            name: 'devices',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid',
                },
                { name: 'name', type: 'varchar' },
                { name: 'deviceId', type: 'varchar', isUnique: true },
                { name: 'platform', type: 'varchar', length: '100' },
                { name: 'osVersion', type: 'varchar', length: '100', isNullable: true },
                { name: 'appVersion', type: 'varchar', length: '100', isNullable: true },
                { name: 'metadata', type: 'jsonb', isNullable: true },
                { name: 'userId', type: 'uuid' },
                { name: 'licenseId', type: 'uuid', isNullable: true },
                { name: 'lastActiveAt', type: 'timestamp', isNullable: true },
                { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
            ],
        }), true);

        // Add foreign key constraints
        await queryRunner.createForeignKeys('licenses', [
            new TableForeignKey({
                columnNames: ['planId'],
                referencedTableName: 'license_plans',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
            new TableForeignKey({
                columnNames: ['userId'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
            new TableForeignKey({
                columnNames: ['assignedById'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        ]);

        await queryRunner.createForeignKeys('transactions', [
            new TableForeignKey({
                columnNames: ['licenseId'],
                referencedTableName: 'licenses',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
            new TableForeignKey({
                columnNames: ['userId'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
            new TableForeignKey({
                columnNames: ['agentId'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        ]);

        await queryRunner.createForeignKeys('devices', [
            new TableForeignKey({
                columnNames: ['userId'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
            new TableForeignKey({
                columnNames: ['licenseId'],
                referencedTableName: 'licenses',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        ]);

        // Add self-referential foreign key for agent relationship
        await queryRunner.createForeignKey('users', new TableForeignKey({
            columnNames: ['agentId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        const userTable = await queryRunner.getTable('users');
        const licenseTable = await queryRunner.getTable('licenses');
        const transactionTable = await queryRunner.getTable('transactions');
        const deviceTable = await queryRunner.getTable('devices');

        if (userTable) {
            const agentFk = userTable.foreignKeys.find(fk => fk.columnNames.indexOf('agentId') !== -1);
            if (agentFk) {
                await queryRunner.dropForeignKey('users', agentFk);
            }
        }

        if (licenseTable) {
            const licenseFks = licenseTable.foreignKeys;
            for (const fk of licenseFks) {
                await queryRunner.dropForeignKey('licenses', fk);
            }
        }

        if (transactionTable) {
            const transactionFks = transactionTable.foreignKeys;
            for (const fk of transactionFks) {
                await queryRunner.dropForeignKey('transactions', fk);
            }
        }

        if (deviceTable) {
            const deviceFks = deviceTable.foreignKeys;
            for (const fk of deviceFks) {
                await queryRunner.dropForeignKey('devices', fk);
            }
        }

        // Drop tables in reverse order
        await queryRunner.dropTable('devices');
        await queryRunner.dropTable('transactions');
        await queryRunner.dropTable('licenses');
        await queryRunner.dropTable('license_plans');
        await queryRunner.dropTable('users');
    }
}
