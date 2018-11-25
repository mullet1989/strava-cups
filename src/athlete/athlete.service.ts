import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AthleteService {
  constructor(
    @InjectRepository(User)
    private readonly _user: Repository<User>,
  ) {

  }

  getAll(): Promise<User[]> {
    return this._user.find();
  }

}