import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  db: any; // main database
  private remoteDb: any; // remote endpoint to database

  onChange$: Subject<any> = new Subject<any>();

  constructor() {
    this.init();
  }

  init() {
    this.remoteDb = 'https://digitron:digitron#321@couchdb.celret.com/digitron-test';

    const options = {
      live: true,
      retry: true,
      back_off_function: function (delay: number) {
        if (delay === 0) {
          return 1000;
        }
        return delay * 3;
      },
    };

    this.db = new PouchDB('digitron-test', {
      auto_compaction: true,
    });

    this.db.sync(this.remoteDb, {
      ...options,
    });

    this.db.setMaxListeners(20);
    this.db
      .on('error', function (err: any) {
        console.log(err);
      })
      .on('complete', function (info: any) {
        console.log('Database Sync complete.');
      })
      .on('paused', function (err: any) {
        console.log('Database Sync up-to-date.');
      });

    this.db.changes({ live: true, since: 'now', include_docs: true }).on('change', (change: any) => {
      this.onChange$.next(change);
    });
    this.db.viewCleanup();

    return;
  }
}
