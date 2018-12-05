import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as cookie from 'cookie-parser';
import * as moment from "moment"

const hbs = require('hbs');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  hbs.registerHelper('format_date', (date: Date) => {
    return moment(date).format("dddd, MMMM Do YYYY, HH:mm")
  });
  app.setViewEngine('hbs');
  app.use(cookie('secretstring'));

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
