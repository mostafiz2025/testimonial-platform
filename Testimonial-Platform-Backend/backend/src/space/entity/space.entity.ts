import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { TestimonialEntity } from '../../testimonial/entity/testimonial.entity';

export enum WallTheme {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum WallLayout {
  MASONRY = 'masonry',
  GRID = 'grid',
}

/** A "Space" = one project / product that collects testimonials (same idea as Testimonial.to) */
@Entity('spaces')
export class SpaceEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'character varying', length: 100 })
  name!: string;

  @Column({ type: 'character varying', length: 60, unique: true })
  slug!: string;

  @Column({ type: 'character varying', length: 255, nullable: true })
  logo!: string | null;

  // ---------- collection page ----------
  @Column({ type: 'character varying', length: 200 })
  header_title!: string;

  @Column({ type: 'text' })
  custom_message!: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  questions!: string[];

  @Column({ default: true })
  collect_text!: boolean;

  @Column({ default: true })
  collect_video!: boolean;

  @Column({ default: true })
  collect_star_rating!: boolean;

  @Column({ default: true })
  collect_email!: boolean;

  @Column({ default: true })
  collect_company!: boolean;

  @Column({ default: true })
  collect_job_title!: boolean;

  @Column({ default: true })
  collect_photo!: boolean;

  @Column({ type: 'character varying', length: 200, default: 'Thank you!' })
  thank_you_title!: string;

  @Column({
    type: 'text',
    default: 'Thanks so much for your testimonial! It means a lot to us.',
  })
  thank_you_message!: string;

  @Column({ type: 'character varying', length: 9, default: '#6366f1' })
  button_color!: string;

  @Column({ default: true })
  is_active!: boolean;

  // ---------- wall of love ----------
  @Column({ type: 'enum', enum: WallTheme, default: WallTheme.LIGHT })
  wall_theme!: WallTheme;

  @Column({ type: 'enum', enum: WallLayout, default: WallLayout.MASONRY })
  wall_layout!: WallLayout;

  @Column({ default: true })
  wall_show_rating!: boolean;

  @Column({ default: true })
  wall_show_date!: boolean;

  @Column({ default: true })
  wall_show_branding!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @Column({ name: 'owner_id' })
  owner_id!: number;

  @ManyToOne(() => UserEntity, (user) => user.spaces, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: UserEntity;

  @OneToMany(() => TestimonialEntity, (t) => t.space)
  testimonials!: TestimonialEntity[];
}
