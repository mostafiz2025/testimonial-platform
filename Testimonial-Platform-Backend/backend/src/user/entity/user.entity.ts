import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SpaceEntity } from '../../space/entity/space.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'character varying', length: 100 })
  name!: string;

  @Column({ type: 'character varying', length: 150, unique: true })
  email!: string;

  @Column({ type: 'character varying', length: 255, select: false })
  password!: string;

  @Column({ type: 'character varying', length: 150, nullable: true })
  company!: string | null;

  @Column({ type: 'character varying', length: 255, nullable: true })
  profile_image!: string | null;

  @Column({ default: false })
  is_banned!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @OneToMany(() => SpaceEntity, (space) => space.owner)
  spaces!: SpaceEntity[];
}
