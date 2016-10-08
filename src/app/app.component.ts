/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';

import { AppState } from './app.service';
import {Router} from "@angular/router";
import {FirebaseFactory} from "./firebase.factory";

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './layout/app.style.css', './layout/app.style.css'
  ],
  template: `
        <div class="siteHeader"><h1>{{name}}</h1>
        <nav>
            <ul><li><a [routerLink]="['/recipes/category/middag']">Middag</a>
                    <ul><li><a [routerLink]="['/recipes/category/middag&fisk']">Fisk</a></li>
                        <li><a [routerLink]="['/recipes/category/middag&kjoett']">Kjøtt</a></li>
                        <li><a [routerLink]="['/recipes/category/middag&vegetar']">Vegetar</a></li>
                    </ul>
                </li>
                <li><a [routerLink]="['/recipes/category/snacks']">Snacks</a></li>
                <li><a [routerLink]="['/beverages']">Vin</a></li>
                <li class="moreOptions"><a href="#">&#x2295;</a>
                    <ul><li><a [routerLink]="['./recipes/new']">Ny&nbsp;oppskrift</a></li>
                        <li><a [routerLink]="['/beverages/new']">Ny vin</a></li>
                        <li><a [routerLink]="['/recipes']">Alle oppskrifter</a></li>
                        <li *ngIf="user" class="loggUt"><a (click)="logOut()">Logg ut</a></li>
                    </ul>
                </li>
                <li></li>
                <li class ="loggInn">
                    <input *ngIf="!user" #box type="text" size="12" placeholder="Passord her..." 
                        (keyup.enter)="logIn(box.value)" (blur)="logIn(box.value)"/>
                </li>
            </ul>
        </nav>
        User: {{user}}
          <button (click)="setUserTrond()">SetUserTrond</button>
          <button (click)="setUserNull()">SetUserNull</button>
        </div>
        <router-outlet></router-outlet>
  `
})
export class App {
  name = 'Mat, drikke og kos';
  user = null;

  constructor(public appState: AppState, public router:Router) {
    
  }

  ngOnInit() {
    console.log('Initial App State', this.appState.state);

    var thisComp = this;
    FirebaseFactory.onAuth(function(user) {
      if (user) {
        thisComp.appState.userSubject.next(user.email);
        thisComp.user = user.email;
      }
      else {
        thisComp.appState.userSubject.next(null);
        thisComp.user = null;
      }
    });
  }

  logIn(password) {
    FirebaseFactory.logIn(password);
  }

  logOut() {
    FirebaseFactory.logOut();
  }

  setUserTrond() {
    this.appState.userSubject.next("Trond");
  }
  setUserNull() {
    this.appState.userSubject.next(null);
  }

  static dateToString(date) {
    if (date == null) return null;

    return "" + (date.getYear() + 1900) +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2);
  };

}

