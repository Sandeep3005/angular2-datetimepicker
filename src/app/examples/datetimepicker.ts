import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  template: `
            <angular2-date-picker [(ngModel)]="date" [settings]="settings" [timezone]="timezoneVal"></angular2-date-picker>
  `
})
export class DateTimePickerExample implements OnInit {
  date: Date = new Date();
  timezoneVal = "GMT+03:30";
  settings = {
    bigBanner: true,
    timePicker: true,
    format: 'dd-MM-yyyy hh:mm a',
    defaultOpen: false,
    closeOnSelect: false,
    minDate: this.changeDateAsPerTimeZone(),
    preserveTimeValue: true,
    incrementByMinutes: 0,
    clockHour: 12,
  }
  constructor() {

  }
  ngOnInit() {
    this.date = this.changeDateAsPerTimeZone();
  }

  changeDateAsPerTimeZone() {
    let offset: any = this.timezoneVal.replace(":3", ".5").replace(":00", "").substring(3);
    let minDate: any = new Date(new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, "" );
    return new Date(minDate);
  }
}
