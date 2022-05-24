import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Booking } from '../interfaces/booking';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private bookingData: Booking[];
  public myData: BehaviorSubject<Booking[]> = new BehaviorSubject<Booking[]>([]);

  constructor(private dataService: DataService) {
    this.getAllBooking().then((res) => {
      this.dataService.onChange$.pipe().subscribe((change) => {
        if (change.id.startsWith('book')) {
          this.handleChange(change);
          this.myData.next(this.bookingData);
        }
      });
    });
  }

  /**
   * I am getting all booking data from database.
   * @returns booking data
   */
  getAllBooking(): Promise<Booking[]> {
    if (this.bookingData) {
      this.myData.next(this.bookingData);

      return Promise.resolve(this.bookingData);
    } else {
      return new Promise((resolve) => {
        this.dataService.db
          .allDocs({
            include_docs: true,
            startkey: 'book',
            endkey: 'book\ufff0',
          })
          .then((result: any) => {
            this.bookingData = [];
            const docs = result.rows.map((row: any) => {
              this.bookingData.push(row.doc);
            });
            resolve(this.bookingData);
            this.myData.next(this.bookingData);
          })
          .catch((error: any) => {
            console.log(error);
          });
      });
    }
  }

  /**
   * Creates or updates new booking into database.
   * @param data object of booking to change.
   * @returns `Promise<boolean | string>` containg `true` if success other wise `false` or error desc.
   */
  createOrUpdateBooking(data: Booking): Promise<boolean | string> {
    return new Promise<boolean | string>((resolve) => {
      this.dataService.db
        .put(data)
        .then((res: any) => {
          if (res.ok === true) {
            resolve(true);
          } else {
            console.log('Something went Wrong!');
          }
        })
        .catch((err: any) => {
          console.log(err);
          resolve(err);
        });
    });
  }

  /**
   * Returns true if Booking successfully removed, and error otherwise.
   * @param data booking object to remove
   */
  removeBooking(data: Booking): Promise<boolean | string> {
    return new Promise<boolean | string>((resolve) => {
      this.dataService.db
        .remove(data)
        .then((res: any) => {
          console.log(res);
          resolve(true);
        })
        .catch((err: any) => {
          console.log(err);
          resolve(err);
        });
    });
  }

  /**
   * handles document change over time. Just listen for change event to database object and pass `change` object as parameter
   * @param change changed document(s) object.
   */
  private handleChange(change: any) {
    let changedDoc: any = null;
    let changedIndex: number = -1;

    this.bookingData.forEach((doc, index) => {
      if (doc._id === change.id) {
        changedDoc = doc;
        changedIndex = index;
      }
    });

    // A document was deleted
    if (change.deleted) {
      this.bookingData.splice(changedIndex, 1);
    } else {
      // A document was updated
      if (changedDoc) {
        this.bookingData[changedIndex] = change.doc;
      }

      // A document was added
      else {
        this.bookingData.push(change.doc);
      }
    }
  }
}
