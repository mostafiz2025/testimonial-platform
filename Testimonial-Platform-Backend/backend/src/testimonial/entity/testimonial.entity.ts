import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SpaceEntity } from '../../space/entity/space.entity';

export enum TestimonialType {
  TEXT = 'text',
  VIDEO = 'video',
}

export enum TestimonialSource {
  COLLECTED = 'collected',
  IMPORTED = 'imported',
}

@Entity('testimonials')
@Index(['space_id', 'created_at'])
export class TestimonialEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: TestimonialType, default: TestimonialType.TEXT })
  type!: TestimonialType;

  @Column({ type: 'character varying', length: 100 })
  name!: string;

  @Column({ type: 'character varying', length: 150, nullable: true })
  email!: string | null;

  @Column({ type: 'character varying', length: 150, nullable: true })
  job_title!: string | null;

  @Column({ type: 'character varying', length: 150, nullable: true })
  company!: string | null;

  /** relative path inside ./uploads, e.g. "photos/123.jpg" */
  @Column({ type: 'character varying', length: 255, nullable: true })
  photo!: string | null;

  /** relative path inside ./uploads, e.g. "videos/123.webm" */
  @Column({ type: 'character varying', length: 255, nullable: true })
  video!: string | null;

  @Column({ type: 'smallint', nullable: true })
  rating!: number | null;

  @Column({ type: 'text', nullable: true })
  message!: string | null;

  @Column({ default: true })
  consent!: boolean;

  @Column({
    type: 'enum',
    enum: TestimonialSource,
    default: TestimonialSource.COLLECTED,
  })
  source!: TestimonialSource;

  /** "hearted" testimonials are the ones shown on the Wall of Love */
  @Column({ default: false })
  is_liked!: boolean;

  @Column({ default: false })
  is_archived!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @Column({ name: 'space_id' })
  space_id!: number;

  @ManyToOne(() => SpaceEntity, (space) => space.testimonials, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'space_id' })
  space!: SpaceEntity;
}
