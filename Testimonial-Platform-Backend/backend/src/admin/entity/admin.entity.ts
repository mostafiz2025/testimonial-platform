import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('admins')
export class AdminEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'character varying', length: 100 })
  name!: string;

  @Column({ type: 'character varying', length: 150, unique: true })
  email!: string;

  @Column({ type: 'character varying', length: 255, select: false })
  password!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
