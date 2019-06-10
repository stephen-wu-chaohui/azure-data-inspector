import { NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as moment from 'moment';

import { AppDataService } from './app-data.service';
import { PushingService } from './pushing.service';
import { Subject } from 'rxjs';

export interface SigData {
  id?: number;
  lastUpdated: number;	// unix time
  deleted: boolean;
  keywords: string;
}

export class SigDataService<T extends SigData> {
  data: T[] = [];
  lastUpdated = moment().subtract(1, 'year').unix();

  private serviceEndPoint = '';
  public mounted = new Subject<T[]>();
  public changed = new Subject<T>();

  constructor(
    private httpClient: HttpClient,
    private appConfig: AppDataService,
    private ngZone: NgZone,
    private pushingService: PushingService,
    private dataName: string,
    private withPushing = false
  ) {
    this.dataName = dataName;
    this.serviceEndPoint = `${this.appConfig.apiURL}/${dataName}`;
  }

  start() {
    this.httpClient.get<T[]>(this.serviceEndPoint).subscribe(
      data => this.ngZone.run(() => {
        this.data.length = 0;
        this.data.push(...data);
        if (this.withPushing) {
          this.enablePushing();
        }
        this.mounted.next(data);
      })
    );
  }

  refresh() {
    const atm = moment().unix();
    this.httpClient.get<T[]>(this.serviceEndPoint, {
      params: { lastUpdatedFrom: this.lastUpdated.toString() },
    }).subscribe(
      updates => this.ngZone.run(() => {
        updates.forEach(it => {
          const original = this.data.find(v => v.id === it.id);
          if (!original) {
            if (!it.deleted) {
              this.data.push(it);
            }
          } else if (it.deleted) {
            const index = this.data.findIndex(v => v.id === it.id);
            if (index >= 0) {
              this.data.splice(index, 1);
            }
          } else if (it.lastUpdated > original.lastUpdated) {
            Object.keys(it).map(k => original[k] = it[k]);
          }
        });
        this.lastUpdated = atm;
      })
    );
  }

  upsert(data: T, callback: (resp: T) => any = (() => {})) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    if (data.id) {
      this.httpClient.put<T>(`${this.serviceEndPoint}/${data.id}`, data, httpOptions)
        .subscribe(callback);
    } else {
      this.httpClient.post<T>(this.serviceEndPoint, data, httpOptions)
        .subscribe(resp => {
          data.id = resp.id;
          callback(resp);
        });
    }
  }

  delete(dataId: number) {
    this.httpClient.delete(`${this.serviceEndPoint}/${dataId}`)
      .subscribe();
  }

  private enablePushing() {
    this.pushingService.addListener(this.dataName, (verb: string, item: T) => {
      return this.ngZone.run(() => {
        let index = 0;
        switch (verb.toLowerCase()) {
          case 'put':
          case 'patch':
            const original = this.data.find(v => v.id === item.id);
            if (original) {
              Object.keys(item).map(k => original[k] = item[k]);
            }
            this.changed.next(original);
            break;
          case 'post':
            this.data.push(item);
            this.changed.next(item);
            break;
          case 'delete':
            index = this.data.findIndex(v => v.id === item.id);
            item.deleted = true;
            if (index >= 0) {
              this.data.splice(index, 1);
            }
            this.changed.next(item);
            break;
        }
      });
    });
  }
}
