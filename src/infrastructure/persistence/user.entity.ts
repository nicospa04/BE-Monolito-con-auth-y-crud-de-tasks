import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../domain/role';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'simple-json' })
  roles!: Role[];

  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash!: string | null;

  @Column({ type: 'datetime', nullable: true })
  refreshTokenExpiresAt!: Date | null;
}
