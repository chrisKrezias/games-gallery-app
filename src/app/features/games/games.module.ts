import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GamesRoutingModule } from './games-routing.module';
import { GamesComponent } from './pages/games/games.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    GamesComponent
  ],
  imports: [
    CommonModule,
    GamesRoutingModule,
    ReactiveFormsModule,
  ]
})
export class GamesModule { }
