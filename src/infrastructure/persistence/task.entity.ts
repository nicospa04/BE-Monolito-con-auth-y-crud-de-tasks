import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskStatus } from '../../domain/task';
import { UserEntity } from './user.entity';

@Entity({ name: 'tasks' })
@Index(['ownerId', 'status'])
export class TaskEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', default: TaskStatus.TODO })
  status!: TaskStatus;

  @Column()
  ownerId!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner!: UserEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
