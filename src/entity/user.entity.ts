import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm';
import { AthleteAccessToken } from './user.accesstoken.entity';

@Entity('athlete')
export class Athlete {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({
    unique: true,
  })
  athlete_id: number;

  @OneToMany(type => AthleteAccessToken, token => token.athlete, { eager: true, cascade: true })
  access_tokens: AthleteAccessToken[];

  @Column({ default: () => 'now()' })
  create_datetime: Date;

}
