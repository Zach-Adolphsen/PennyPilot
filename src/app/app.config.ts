import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { routes } from './app.routes';

const firebaseConfig = {
  apiKey: 'AIzaSyDJtLkCGW7G9pjQ6Db87MeiC0vTGBfZtmo',
  authDomain: 'pennypilot-70751.firebaseapp.com',
  projectId: 'pennypilot-70751',
  storageBucket: 'pennypilot-70751.firebasestorage.app',
  messagingSenderId: '442614312413',
  appId: '1:442614312413:web:2075d3992e599337b01a34',
  measurementId: 'G-6G66SF10MS',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ],
};
