import { Injectable, MiddlewareFunction, NestMiddleware } from '@nestjs/common';

@Injectable()
export class TrackingMiddleware implements NestMiddleware {

  resolve(...args: any[]): MiddlewareFunction | Promise<MiddlewareFunction> {
    return ((req, res, next) => {
      let anon = req.cookies.a;
      if (!anon) {
        res.cookie('a', this.guid(), { maxAge: 900000, httpOnly: true });
      } else {
        // nothing to do!
      }
      next();
    });
  }

  private guid(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

}