import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { Athlete } from './athlete.entity';

@Entity('activity')
export class Activity {

  @PrimaryColumn()
  @Index({ unique: true })
  id: number;

  @Column()
  name: string;

  @JoinColumn({ name: 'athlete_id', referencedColumnName: 'id' })
  @ManyToOne(type => Athlete, athlete => athlete.athlete_id)
  athlete: Athlete;

  @Column({ type: 'float' })
  distance: number;

  @Column()
  type: string;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column()
  achievement_count: number;

  @Column()
  kudos_count: number;

  @Column()
  comment_count: number;

  @Column()
  athlete_count: number;

  @Column({ type: 'float' })
  average_speed: number; // m/s

}