import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique, JoinColumn } from 'typeorm';
import { AthleteAccessToken } from './athlete.accesstoken.entity';
import { Session } from './session.entity';
import { Activity } from './activity.entity';
import * as _ from 'lodash';

@Entity('athlete')
export class Athlete {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  athlete_id: number;

  @OneToMany(type => Session, session => session.athlete)
  sessions: Session[];

  @OneToMany(type => AthleteAccessToken, token => token.athlete, { eager: true, cascade: true })
  access_tokens: AthleteAccessToken[];

  @OneToMany(type => Activity, activity => activity.athlete)
  activities: Activity[];

  @Column({ default: () => 'now()' })
  create_datetime: Date;

  get latest_token(): AthleteAccessToken {
    return _.maxBy(this.access_tokens, 'create_datetime');
  }

}
