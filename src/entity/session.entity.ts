import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Athlete } from './athlete.entity';

@Entity('session')
export class Session {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Athlete, { eager: true, cascade: true })
  @JoinColumn({ referencedColumnName: 'athlete_id', name: 'athlete_id' })
  athlete: Athlete;

  @Column()
  @Index({ unique: true })
  anon: string;

  @Column({ default: () => 'now()' })
  create_datetime: Date;

  // access_token expires 6 hours after creation
  @Column()
  expires_datetime: Date;

}
