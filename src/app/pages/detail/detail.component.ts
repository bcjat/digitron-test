import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Booking } from '../../interfaces/booking';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ISlot } from '../home/home.component';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
})
export class DetailComponent implements OnInit {
  state$!: Observable<any>;
  currentBooking!: Booking;
  timeSlot!: ISlot;

  frmBook: FormGroup;
  submitAttempt: boolean = false;

  constructor(private router: Router, fb: FormBuilder, private bookingService: BookingService) {
    let param = this.router.getCurrentNavigation()!.extras.state;
    this.timeSlot = param!['slot'];
    this.currentBooking = param!['bookData'];

    this.frmBook = fb.group({
      firstName: [this.timeSlot.booked ? this.currentBooking.firstName : '', Validators.required],
      lastName: [this.timeSlot.booked ? this.currentBooking.lastName : '', Validators.required],
      phone: [this.timeSlot.booked ? this.currentBooking.phone : '', Validators.pattern('[4-9]{1}[0-9]{9}')],
      timeSlot: [this.timeSlot.booked ? this.currentBooking.timeSlot : this.timeSlot.time],
    });
  }

  ngOnInit(): void {}

  save() {
    this.submitAttempt = true;
    let data: Booking = {
      ...this.frmBook.value,
      _id: this.timeSlot.booked ? this.currentBooking._id : 'book-' + this.timeSlot.time.replace(/\s/g, ''),
    };
    if (this.timeSlot.booked) data._rev = this.currentBooking._rev;

    this.bookingService.createOrUpdateBooking(data).then((res) => {
      console.log(res);
      this.router.navigateByUrl('/home');
    });
  }

  reset() {
    this.router.navigateByUrl('/home');
  }

  removeBooking() {
    this.bookingService.removeBooking(this.currentBooking).then((res) => {
      console.log(res);
      this.router.navigateByUrl('/home');
    });
  }
}
