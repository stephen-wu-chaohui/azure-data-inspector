import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppDataService {
  readonly apiURL = 'https://stephen-api.azurewebsites.net/api';
  readonly signalR = 'https://stephen-api.azurewebsites.net/BroadcastHub';
  // readonly apiURL = 'https://localhost:5001/api';
  // readonly signalR = 'https://localhost:5001/BroadcastHub';
}
