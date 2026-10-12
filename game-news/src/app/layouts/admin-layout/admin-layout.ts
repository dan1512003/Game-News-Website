import { Component } from '@angular/core';
import { Header } from './header/header';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';


@Component({
  imports: [Header,RouterOutlet,Sidebar],
  selector: 'app-admin-layout',
  styleUrl: './admin-layout.css',
  templateUrl: './admin-layout.html',
})
export class AdminLayout {}
