import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Athlete } from './user.entity';

@Entity('athlete_access_token')
export class AthleteAccessToken {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  access_token: string;

  @ManyToOne(type => Athlete)
  @JoinColumn({ referencedColumnName: 'athlete_id', name: 'athlete_id' })
  athlete: Athlete;

  @Column({ default: () => 'now()' })
  create_datetime: Date;

  // access_token expires 6 hours after creation
  @Column({ default: () => 'now() + interval \'6 hours\'' })
  expires_datetime: Date;

}
