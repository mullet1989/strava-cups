import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Athlete } from '../entity/user.entity';
import { InsertResult, Repository } from 'typeorm';

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

  insert(athlete: Athlete): Promise<InsertResult> {
    return this.athleteRepository.insert(athlete);
  }

}