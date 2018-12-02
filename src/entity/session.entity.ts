import { Entity, Column, Index, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Athlete } from './athlete.entity';

@Entity('session')
export class Session {

  constructor(
    anon: string,
    athlete: Athlete) {
    this.anon = anon;
    this.athlete = athlete;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Athlete)
  @JoinColumn({ referencedColumnName: 'athlete_id', name: 'athlete_id' })
  athlete: Athlete;

  @Column()
  @Index({ unique: true })
  anon: string;

  @Column({ default: () => 'now()' })
  create_datetime: Date;

  // access_token expires 6 hours after creation
  @Column({ default: () => 'now() + interval \'6 hours\'' })
  expires_datetime: Date;

}
