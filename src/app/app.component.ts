import { Component, OnInit } from '@angular/core';
import {
  Router,
  RouterModule,
  RouterOutlet,
  NavigationEnd,
} from '@angular/router';
import { NavbarComponent } from './Components/navbar/navbar.component';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Penny-Pilot';
  currentRoute: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event.urlAfterRedirects)
      )
      .subscribe((url: string) => { this.currentRoute = url; });
  }

  isNotOnSignIn(): boolean {
    return ![
      '/login',
      '/forgot-password',
      '/verify-email',
      '/register',
    ].includes(this.currentRoute);
  }
}
