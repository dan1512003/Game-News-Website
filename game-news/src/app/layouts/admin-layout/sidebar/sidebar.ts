import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
   activeMenu = 'dashboard';

  setActive(menu: string, event: Event) {
    event.preventDefault();
    this.activeMenu = menu;
  }
}
