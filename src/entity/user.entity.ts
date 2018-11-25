import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('athlete')
export class Athlete {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  access_token: string;

  @Column()
  athlete_id: number;

  @Column({ default: () => "now()"})
  create_datetime: Date;

}
