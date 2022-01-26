import { IGame, IGames } from './../../models/games.model';
import { Component } from '@angular/core';
import { combineLatest, map, Observable, shareReplay, startWith, Subject, tap } from 'rxjs';
import { IGameTypes } from '../../models/games.model';
import { GamesService } from '../../services/games.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent {
  public gameTypes$: Observable<IGameTypes[]>;
  public selectedGameTypeGames$: Observable<IGame[]>;
  public searchControl: FormControl;

  private gamesMap$: Observable<Map<number, IGame>>;
  private activeGameTypeSubject: Subject<number>;

  constructor(gamesService: GamesService) {
    this.activeGameTypeSubject = new Subject();

    this.searchControl = new FormControl("");

    this.gamesMap$ = gamesService.getGames$().pipe(
      map(games => new Map(games.Games.map(game => [game.GameID, game]))),
      tap(res => console.log(res)),
      shareReplay()
    );

    this.gameTypes$ = gamesService.getGames$().pipe(
      map(games => games.GameTypes.sort((a, b) => (a.Order > b.Order) ? 1 : -1)),
      tap(res => console.log(res)),
      shareReplay()
    );

    this.selectedGameTypeGames$ = combineLatest([
      this.gamesMap$,
      this.gameTypes$,
      this.activeGameTypeSubject.asObservable(),
      (this.searchControl.valueChanges as Observable<string>).pipe(
        startWith("")
      )
    ]).pipe(
      map(([gamesMap, gameTypes, gameTypeId, searchValue]) =>
        gameTypes
          .find(gameType => gameType.ID === gameTypeId)
          ?.Games
          .reduce((acc, gameId) => {

            if (gamesMap.has(gameId)) {
              const game = gamesMap.get(gameId);

              if (game) {

                if (searchValue) {
                  game.GameName.toLowerCase().startsWith(searchValue.toLowerCase()) && acc.push(game);
                } else {
                  acc.push(game)
                }

              }
            }

            return acc;

          }, [] as IGame[])
          .sort((a, b) => (a.GameOrder > b.GameOrder) ? 1 : -1)
        || []
      ),
      tap(res => console.log(res))
    )
  }

  public showMovies(gameTypeId: number): void {
    this.activeGameTypeSubject.next(gameTypeId);
  }
}
