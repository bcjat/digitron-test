import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Booking } from '../../interfaces/booking';
import { BookingService } from '../../services/booking.service';

export interface ISlot {
  time: string;
  booked: boolean;
}
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  bookings: Booking[];
  timeSlot: ISlot[] = [
    { time: '09:00 AM', booked: false },
    { time: '10:00 AM', booked: false },
    { time: '11:00 AM', booked: false },
    { time: '12:00 PM', booked: false },
    { time: '01:00 PM', booked: false },
    { time: '02:00 PM', booked: false },
    { time: '03:00 PM', booked: false },
    { time: '04:00 PM', booked: false },
    { time: '05:00 PM', booked: false },
  ];
  subscription: any;

  constructor(private bookingSer: BookingService, private router: Router) {
    this.bookings = [];
    this.subscription = this.bookingSer.myData.subscribe((res) => {
      this.bookings = res;
      console.log(this.bookings);
      this.timeSlot.forEach((el) => {
        el.booked = false;
      });
      this.bookings.forEach((ele) => {
        this.timeSlot.map((val) => {
          if (val.time == ele.timeSlot) val.booked = true;
        });
      });
    });
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscription.unsubscribe();
  }

  bookSlot(slotData: ISlot) {
    let dataFound: Booking | undefined = undefined;
    if (slotData.booked) {
      this.bookings.forEach((el) => {
        if (el.timeSlot == slotData.time) {
          dataFound = el;
        }
      });
    }
    setTimeout(() => {
      this.router.navigateByUrl('/detail', { state: { slot: slotData, bookData: dataFound } });
    }, 140);
  }
}
