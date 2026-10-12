import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
     activeMenu = 'dashboard';
  isSideNavOpen = false;
  setActive(menu: string, event: Event) {
    event.preventDefault();
    this.activeMenu = menu;
  }




toggleSideNav(): void {
    this.isSideNavOpen = !this.isSideNavOpen;
}
}
