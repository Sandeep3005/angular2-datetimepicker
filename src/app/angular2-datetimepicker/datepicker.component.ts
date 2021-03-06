import { Component, OnInit, forwardRef, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DateRange } from './model';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Settings } from './interface';
import * as moment from 'moment';

export const DATEPICKER_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatePicker),
  multi: true
};

@Component({
  selector: 'angular2-date-picker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss', './rangepicker.scss'],
  providers: [DATEPICKER_CONTROL_VALUE_ACCESSOR]
})

export class DatePicker implements OnInit, ControlValueAccessor {

  @Input()
  settings: Settings;

  @Output()
  onDateSelect: EventEmitter<Date> = new EventEmitter<Date>();

  @Input()
  timezone: string;

  selectedDate: String;
  date: Date;
  dateRange: DateRange = new DateRange();
  popover: Boolean = false;

  clickedToChangeYear:boolean = false;
  cal_days_in_month: Array<any> = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  timeViewDate: Date = new Date(this.date);
  hourValue: number = 0;
  toHourValue: number = 0;
  minValue: number = 0;
  toMinValue: number = 0;
  timeViewMeridian: string = "";
  toTimeViewMeridian: string = "";
  timeView: boolean = false;
  yearView: Boolean = false;
  yearsList: Array<any> = [];
  monthDays: Array<any> = [];
  toMonthDays: Array<any> = [];
  monthsView: boolean = false;
  today: Date = new Date();
  leftDate: Date = new Date();
  rightDate: Date = new Date();
  arrowSetting = {
    hideBack: false
  }

  defaultSettings: Settings = {
    defaultOpen: false,
    bigBanner: true,
    timePicker: false,
    format: 'dd-MMM-yyyy hh:mm a',
    cal_days_labels: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    cal_full_days_lables: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    cal_months_labels: ['January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August', 'September',
      'October', 'November', 'December'],
    cal_months_labels_short: ['JAN', 'FEB', 'MAR', 'APR',
      'MAY', 'JUN', 'JUL', 'AUG', 'SEP',
      'OCT', 'NOV', 'DEC'],
    closeOnSelect: false,
    rangepicker: false
  }
  constructor() {

  }
  ngOnInit() {
    this.settings = Object.assign(this.defaultSettings, this.settings);
    if (this.settings.defaultOpen) {
      this.popover = true;
    }
  }
  private onTouchedCallback: () => {};
  private onChangeCallback: (_: any) => {};
  writeValue(value: any) {
    if (value !== undefined && value !== null) {
      if (!this.settings.rangepicker) {
        this.initDate(value);
        this.monthDays = this.generateDays(this.date);
      }
      else {
        this.initDateRange(value);
        if (this.dateRange.startDate.getMonth() === this.dateRange.endDate.getMonth() && this.dateRange.startDate.getFullYear() === this.dateRange.endDate.getFullYear()) {
          this.leftDate = new Date(this.dateRange.startDate);
          var tempDate = new Date(this.dateRange.startDate);
          tempDate.setMonth(tempDate.getMonth() + 1);
          tempDate.setDate(1);
          this.rightDate = new Date(tempDate);
          this.monthDays = this.generateDays(this.leftDate);
          this.toMonthDays = this.generateDays(this.rightDate);
        }
        else {
          this.leftDate = new Date(this.dateRange.startDate);
          this.rightDate = new Date(this.dateRange.endDate);
          this.monthDays = this.generateDays(this.leftDate);
          this.toMonthDays = this.generateDays(this.rightDate);
        }
      }

    }
    else {
      this.date = this.getCurrentDateWithTimezone();
    }
  }
  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
  initDate(val: string) {
    this.date = new Date(val);
    if (this.date.getHours() <= 11) {
      this.hourValue = this.date.getHours();
      this.timeViewMeridian = "AM";
    }
    else {
      this.hourValue = this.date.getHours() - 12;
      this.timeViewMeridian = "PM";
    }
    if (this.date.getHours() == 0 || this.date.getHours() == 12) {
      this.hourValue = 12;
    }
    this.minValue = this.date.getMinutes();
  }
  initDateRange(val: DateRange) {
    this.dateRange.startDate = new Date(val.startDate);
    this.dateRange.endDate = new Date(val.endDate);
    if (this.dateRange.startDate.getHours() <= 11) {
      this.hourValue = this.dateRange.startDate.getHours();
      this.timeViewMeridian = "AM";
    }
    else {
      this.hourValue = this.dateRange.startDate.getHours() - 12;
      this.timeViewMeridian = "PM";
    }
    if (this.dateRange.startDate.getHours() == 0 || this.dateRange.startDate.getHours() == 12) {
      this.hourValue = 12;
    }
    this.minValue = this.dateRange.startDate.getMinutes();

    if (this.dateRange.endDate.getHours() <= 11) {
      this.toHourValue = this.dateRange.endDate.getHours();
      this.toTimeViewMeridian = "AM";
    }
    else {
      this.toHourValue = this.dateRange.endDate.getHours() - 12;
      this.toTimeViewMeridian = "PM";
    }
    if (this.dateRange.endDate.getHours() == 0 || this.dateRange.endDate.getHours() == 12) {
      this.toHourValue = 12;
    }
    this.toMinValue = this.dateRange.endDate.getMinutes();

  }
  generateDays(date: Date) {
    var year = date.getFullYear(),
      month = date.getMonth(),
      current_day = date.getDate(),
      today = new Date();
    var firstDay = new Date(year, month, 1);
    var startingDay = firstDay.getDay();
    var monthLength = this.getMonthLength(month, year);
    var day = 1;
    var dateArr = [];
    var dateRow = [];
    // this loop is for is weeks (rows)
    for (var i = 0; i < 9; i++) {
      // this loop is for weekdays (cells)
      dateRow = [];
      for (var j = 0; j <= 6; j++) {
        var dateCell = null;
        if (day <= monthLength && (i > 0 || j >= startingDay)) {
          dateCell = day;
          if (day == current_day) {
            // dateCell.classList.add('selected-day');
          }
          if (day == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear()) {
            // dateCell.classList.add('today');
          }
          day++;
        }
        dateRow.push({ day: dateCell, date: new Date((month + 1) + '/' + dateCell + '/' + date.getFullYear()) });
      }
      // stop making rows if we've run out of days
      if (day > monthLength) {
        dateArr.push(dateRow);
        break;
      } else {
        dateArr.push(dateRow);
      }
    }
    return dateArr;
  }
  generateYearList(param: string) {
    this.clickedToChangeYear = true;
    var startYear = null;
    var currentYear = null;
    if (param == "next") {
      startYear = this.yearsList[8] + 1;
      currentYear = this.date.getFullYear();
    }
    else if (param == "prev") {
      startYear = this.yearsList[0] - 9;
      currentYear = this.date.getFullYear();
    }
    else {
      currentYear = this.date.getFullYear();
      startYear = currentYear - 4;
      this.yearView = !this.yearView;
      this.monthsView = false;
    }
    for (var k = 0; k < 9; k++) {
      this.yearsList[k] = startYear + k;
    }
  }
  getMonthLength(month: number, year: number) {
    var monthLength = this.cal_days_in_month[month];

    // compensate for leap year
    if (month == 1) { // February only!
      if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
        monthLength = 29;
      }
    }
    return monthLength;
  }
  toggleMonthView() {
    this.yearView = false;
    this.monthsView = !this.monthsView;
  }
  toggleMeridian(val: string) {
    this.timeViewMeridian = val;
    if (this.isBehindFromCurrentTime()) this.setCurrectTime(val);
  }
  setTimeView() {
    if (this.timeViewMeridian == "AM") {
      if (this.hourValue == 12) {
        this.date.setHours(0);
      }
      else {
        this.date.setHours(this.hourValue);
      }
      this.date.setMinutes(this.minValue);
    }
    else {
      if (this.hourValue == 12) {
        this.date.setHours(this.hourValue);
      }
      else {
        this.date.setHours(this.hourValue + 12);
      }
      this.date.setMinutes(this.minValue);
    }
    this.date = new Date(this.date);
    this.timeView = !this.timeView;
  }

  /***
   * (ssd > endDay -> startDay = endDay -> step = 1 ) && (sed > startDay -> 2)
   * (ssd < endDay -> startDay = ssd - step =1) && (sed < startDay -> 2 )
   * 
   */

  rangeSelected: number = 0;
  setDay(evt: any, type: string) {
    if (evt.target.innerHTML) {
      var selectedDay = new Date(evt.target.getAttribute('data-label'));
      if (this.isFirstDayOfCalendar(selectedDay)) return;
      if (type == 'range') {
        if (this.rangeSelected == 0) {
          this.setStartDate(selectedDay);
        }
        else if (this.rangeSelected == 1) {
          this.setEndDate(selectedDay);
        }
      }
      else {
        const { preserveTimeValue, incrementByMinutes } = this.defaultSettings;
        if (preserveTimeValue) {
          let selectedMoment = moment(`${moment(selectedDay).format('MM DD YYYY')} ${this.hourValue}: ${this.minValue} ${this.timeViewMeridian}`, 'MM DD YYYY hh: mm a');
          let dateToSet = new Date(selectedDay);
          dateToSet.setHours(+selectedMoment.format('HH'));
          dateToSet.setMinutes(+selectedMoment.format('mm'));
          this.date = dateToSet;
        } else {
          this.date = new Date(selectedDay);
        }

        let selectedMoment = moment(`${moment(selectedDay).format('MM DD YYYY')} ${this.hourValue}: ${this.minValue} ${this.timeViewMeridian}`, 'MM DD YYYY hh: mm a');
        let diff = selectedMoment.diff(moment(this.getCurrentDateWithTimezone()), 'minutes');
        if (diff <= 0 ) {
          let today = this.getCurrentDateWithTimezone();
          let currentMinutes = today.getMinutes();
          if (incrementByMinutes) today.setMinutes(currentMinutes + incrementByMinutes);
          this.date = new Date(today);
        }

        this.onChangeCallback(this.date.toString());
      }
      if (this.settings.closeOnSelect) {
        this.popover = false;
        this.onDateSelect.emit(this.date);
      }

      this.timeView = true;

      this.hourValue = +moment(this.date).format("hh");
      this.minValue = +moment(this.date).format("mm");
      this.timeViewMeridian = moment(this.date).format("A");
    }
  }
  setStartDate(selectedDate: Date) {
    if (selectedDate < this.dateRange.endDate) {
      this.dateRange.startDate = new Date(selectedDate);
    }
    else if (selectedDate > this.dateRange.endDate) {
      this.dateRange.startDate = new Date(selectedDate);
      this.dateRange.endDate = new Date(selectedDate);
    }
    this.rangeSelected = 1;
  }
  setEndDate(selectedDate: Date) {
    if (selectedDate > this.dateRange.startDate && (this.dateRange.startDate != this.dateRange.endDate)) {
      this.dateRange.endDate = new Date(selectedDate);
    }
    else if (selectedDate > this.dateRange.startDate && (this.dateRange.startDate == this.dateRange.endDate)) {
      this.dateRange.endDate = new Date(selectedDate);
    }
    else if (selectedDate < this.dateRange.startDate && (this.dateRange.startDate != this.dateRange.endDate)) {
      this.dateRange.startDate = new Date(selectedDate);
      this.dateRange.endDate = new Date(selectedDate);
    }
    else if (selectedDate < this.dateRange.startDate && (this.dateRange.startDate == this.dateRange.endDate)) {
      this.dateRange.startDate = new Date(selectedDate);
      this.dateRange.endDate = new Date(selectedDate);
    }
    else if (selectedDate.getTime() == this.dateRange.startDate.getTime()) {
      this.dateRange.startDate = new Date(selectedDate);
      this.dateRange.endDate = new Date(selectedDate);
    }
    this.rangeSelected = 0;
  }
  highlightRange(date: Date) {
    return (date > this.dateRange.startDate && date < this.dateRange.endDate);
  }
  setYear(evt: any) {
    evt.stopPropagation();
    var selectedYear = parseInt(evt.target.getAttribute('id'));
    if (isNaN(selectedYear)) return;
    this.date = new Date(this.date.setFullYear(selectedYear));
    let isBackDate  = this.isBackDateViaMinutes({ date: this.date });
    this.date = !isBackDate ? new Date(this.date) : this.getCurrentDateWithTimezone();

    this.yearView = !this.yearView;
    this.monthDays = this.generateDays(this.date);
  }
  setMonth(evt: any) {
    if (evt.target.getAttribute('id')) {
      var selectedMonth = this.settings.cal_months_labels_short.indexOf(evt.target.getAttribute('id'));
      this.date = new Date(this.date.setMonth(selectedMonth));
      this.monthsView = !this.monthsView;
      this.monthDays = this.generateDays(this.date);
    }
  }
  prevMonth(e: any) {
    e.stopPropagation();
    var self = this;
    let originalDate = this.date;
    if (this.date.getMonth() == 0) {
      originalDate.setMonth(11);
      originalDate.setFullYear(this.date.getFullYear() - 1);
    } else {
      var prevmonthLength = this.getMonthLength(this.date.getMonth() - 1, this.date.getFullYear());
      var currentDate = this.date.getDate();
      if (currentDate > prevmonthLength) {
        originalDate.setDate(prevmonthLength);
      }
      originalDate.setMonth(originalDate.getMonth() - 1);
    }
    let isBackDate  = this.isBackDateViaMinutes({ date: originalDate });
    this.date = !isBackDate ? new Date(originalDate) : this.getCurrentDateWithTimezone();
    this.monthDays = this.generateDays(this.date);
  }
  nextMonth(e?: any) {
    if (e) e.stopPropagation();
    var self = this;
    if (this.date.getMonth() == 11) {
      this.date.setMonth(0);
      this.date.setFullYear(this.date.getFullYear() + 1);
    } else {
      var nextmonthLength = this.getMonthLength(this.date.getMonth() + 1, this.date.getFullYear());
      var currentDate = this.date.getDate();
      if (currentDate > nextmonthLength) {
        this.date.setDate(nextmonthLength);
      }
      this.date.setMonth(this.date.getMonth() + 1);
      //this.arrowSetting.hideBack = false;

    }
    this.date = new Date(this.date);
    this.monthDays = this.generateDays(this.date);
  }
  onChange(evt: any) {
    console.log(evt);
  }
  incHour() {
    if (this.hourValue < 12) {
      this.hourValue += 1;
    }
    this.changeInputHour();
  }
  decHour() {
    if (this.hourValue > 1) {
      this.hourValue -= 1;
    }
    this.changeInputHour();
  }
  incMinutes() {
    if (this.minValue < 59) {
      this.minValue += 1;
    }
    this.changeInputMinute();
  }
  decMinutes() {
    if (this.minValue > 0) {
      this.minValue -= 1;
      console.log(this.minValue);
    }
    this.changeInputMinute();
  }
  done() {
    console.log('done: ');
    this.onChangeCallback(this.date.toString());
    this.popover = false;
    this.onDateSelect.emit(this.date);
  }
  togglePopover() {
    if (this.popover) {
      this.closepopover();
    }
    else {
      this.popover = true;
    }
  }
  closepopover() {
    if (this.clickedToChangeYear) {
      this.clickedToChangeYear = false;
      return;
    }
    this.rangeSelected = 0;
    this.popover = false;
  }
  composeDate(date: Date) {
    return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
  }
  getCurrentWeek() {
    var curr_date = new Date();

    var day = curr_date.getDay();

    var diff = curr_date.getDate() - day + (day == 0 ? -6 : 1); // 0 for sunday

    var week_start_tstmp = curr_date.setDate(diff);

    var week_start = new Date(week_start_tstmp);


    var week_end = new Date(week_start_tstmp);  // first day of week 

    week_end = new Date(week_end.setDate(week_end.getDate() + 6));


    var date = week_start + ' to ' + week_end;    // date range for current week
    console.log(date);
    if (week_start.getMonth() === week_end.getMonth()) {
      this.monthDays = this.generateDays(week_start);
      var tempDate = new Date(week_end);
      tempDate.setMonth(tempDate.getMonth() + 1);
      tempDate.setDate(1);
      this.toMonthDays = this.generateDays(tempDate);
    }
    else {
      this.monthDays = this.generateDays(week_start);
      this.toMonthDays = this.generateDays(week_end);
    }

    this.setStartDate(week_start);
    this.setEndDate(week_end);
  }

  isBackDate(day) {
    const { minDate } = this.settings;
    const minDateMoment = moment(minDate);
    const lowerLimitDate = moment(day.date);
    return (minDateMoment.diff(lowerLimitDate, "days") > 0) ? true : false;
  }


  isBackDateViaMinutes(day) {
    const { minDate } = this.settings;
    const minDateMoment = moment(minDate);
    const lowerLimitDate = moment(day.date);
    return (minDateMoment.diff(lowerLimitDate, "minutes") > 0) ? true : false;
  }

  isBackYear(year) {
    const { minDate } = this.settings;
    return (year < minDate.getFullYear()) ? true: false;
  }

  isBackMonth(month) {
    let { minDate } = this.settings;
    minDate = minDate ? minDate : new Date(0);
    const yearSelected = this.date.getFullYear();
    let monthCondition = this.defaultSettings.cal_months_labels_short.indexOf(month) < minDate.getMonth();
    let yearCondition = yearSelected <= minDate.getFullYear();
    return (monthCondition && yearCondition) ? true: false;
  }

  isFirstDayOfCalendar(date) {
    const firstDay = {
      day: 1,
      month: 0,
      year: 1970
    }
    let selectedDate = new Date(date);
    return (firstDay.day == selectedDate.getDate() && firstDay.month == selectedDate.getMonth() && firstDay.year == selectedDate.getFullYear()) ? true : false;
  }


  changeInputHour() {
    const { clockHour } = this.settings;
    if (this.hourValue < 0) return this.setCurrectTime();
    let is12HFormat = clockHour  === 12 ? true : false;
    if (is12HFormat && (this.hourValue > 12)) return this.setCurrectTime();
    if (this.isBehindFromCurrentTime()) this.setCurrectTime();
  }

  changeInputMinute() {
    if ((this.minValue > 59) || (this.minValue < 0)) {
      this.minValue = +moment(this.getCurrentDateWithTimezone()).format("mm");
    }
    if (this.isBehindFromCurrentTime()) this.setCurrectTime();
  }

  isBehindFromCurrentTime() {
    let dateSelected = moment(this.date).format('DD-MM-YYYY');
    let selectedMoment = moment(`${dateSelected} ${this.hourValue}: ${this.minValue} ${this.timeViewMeridian}`, 'DD-MM-YYYY hh: mm a')
    let currMoment = moment(this.getCurrentDateWithTimezone());
    let behindFromCurrentTime = currMoment.diff(selectedMoment, "seconds");
    return (behindFromCurrentTime >  0) ? true : false;
  }

  setCurrectTime(meridianValue?: string) {
    const { incrementByMinutes } = this.settings;
    let today = this.getCurrentDateWithTimezone();
    let currentMinutes = today.getMinutes();
    if (incrementByMinutes) today.setMinutes(currentMinutes + incrementByMinutes);
    this.hourValue = +moment(today).format("hh");
    this.minValue = +moment(today).format("mm");
    if (meridianValue) this.timeViewMeridian = meridianValue == 'AM' ? 'PM' : 'AM'
  }

  getCurrentDateWithTimezone() {
    let offset: any = this.timezone.replace(":3", ".5").replace(":00", "").substring(3);
    let currDate: any = new Date(new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, "" );
    return new Date(currDate);
  }
}