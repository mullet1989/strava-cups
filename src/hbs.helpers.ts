const hbs = require('hbs');
import * as moment from 'moment';


export const registerHelpers = () => {

  hbs.registerHelper('format_date', (date: Date) => {
    return moment(date).format('dddd, MMMM Do YYYY, HH:mm');
  });

  hbs.registerHelper('format_distance', (distance: number): string => {
    return Math.round(distance / 1000) + " kms";
  });
};
