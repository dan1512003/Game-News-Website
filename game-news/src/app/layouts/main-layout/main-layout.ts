import { Component } from '@angular/core';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { RouterOutlet } from '@angular/router';
@Component({
  imports: [Header,RouterOutlet,Footer],
  selector: 'app-main-layout',
  styleUrl: './main-layout.css',
  templateUrl: './main-layout.html',
})
export class MainLayout {}
