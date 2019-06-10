import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@aspnet/signalr';
import { AppDataService } from './app-data.service';
import { SigData } from './sig-data.service';

@Injectable({
  providedIn: 'root'
})
export class PushingService {
  private hub: HubConnection;
  hubWorking = false;

  constructor(private appConfig: AppDataService) {
    this.hub = new HubConnectionBuilder()
      .withUrl(this.appConfig.signalR)
      .configureLogging(LogLevel.Information)
      .build();

    this.hub.start().then(() => {
      this.hubWorking = true;
      this.hub.onclose(() => {
        this.hubWorking = false;
        this.hub.start().then(() => this.hubWorking = true );
      });
    }).catch(error => {
      console.log('Failed to start hub', error);
      this.hubWorking = false;
    });
  }

  addListener(dataName: string, listener: (verb: string, data: SigData) => any) {
    this.hub.on(dataName, listener);
  }

}
