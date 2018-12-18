import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Athlete } from './athlete.entity';

@Entity('athlete_access_token')
export class AthleteAccessToken {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  access_token: string;

  @Column()
  refresh_token: string;

  @ManyToOne(type => Athlete)
  @JoinColumn({ referencedColumnName: 'athlete_id', name: 'athlete_id' })
  athlete: Athlete;

  @Column()
  create_datetime: Date;

  // access_token expires 6 hours after creation
  @Column()
  expires_datetime: Date;


  get isExpired() {
    return this.expires_datetime < new Date();
  }

}
