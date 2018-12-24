import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as cookie from 'cookie-parser';
import { registerHelpers } from './hbs.helpers';

const enforce = require('express-sslify');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // register handlebars helpers
  registerHelpers();

  app.setViewEngine('hbs');
  app.use(cookie('secretstring'));

  if (process.env.NODE_ENV === 'production') {
    app.use(enforce.HTTPS({ trustProtoHeader: true }));
  }


  await app.listen(process.env.PORT || 3000);
}

bootstrap();
