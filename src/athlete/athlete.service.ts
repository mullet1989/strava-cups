import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Athlete } from '../entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AthleteService {
  constructor(
    @InjectRepository(Athlete)
    private readonly athleteRepository: Repository<Athlete>,
  ) {

  }

  getAll(): Promise<Athlete[]> {
    return this.athleteRepository.find();
  }

  getOne(id: number): Promise<Athlete> {
    return this.athleteRepository.findOne({ athlete_id: id });
  }

  insert(athlete: Athlete): Promise<Athlete> {
    return this.athleteRepository.save(athlete);
  }

}