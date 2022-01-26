import { IGame } from './../../models/games.model';
import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, shareReplay, startWith, Subject, tap } from 'rxjs';
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
  public selectedGameTypeGamesPages$: Observable<IGame[][]>;
  public activeGamesPage$: Observable<IGame[] | null>;
  public searchControl: FormControl;
  public activeGamePageIndex = 0;

  private gamesMap$: Observable<Map<number, IGame>>;
  private activeGameTypeSubject: Subject<number>;
  private activeGamePageIndexSubject: Subject<number>;
  private readonly NUMBER_OF_ROWS = 6;
  private readonly NUMBER_OF_COLUMNS = 4;
  private readonly TOTAL_VISIBLE_ELEMENTS = this.NUMBER_OF_ROWS * this.NUMBER_OF_COLUMNS;

  constructor(gamesService: GamesService) {
    this.activeGameTypeSubject = new Subject();
    this.activeGamePageIndexSubject = new BehaviorSubject(0);

    this.searchControl = new FormControl("");

    this.gamesMap$ = gamesService.getGames$().pipe(
      map(games => new Map(games.Games.map(game => [game.GameID, game]))),
      shareReplay()
    );

    this.gameTypes$ = gamesService.getGames$().pipe(
      map(games => games.GameTypes.sort((a, b) => (a.Order > b.Order) ? 1 : -1)),
      shareReplay()
    );

    this.selectedGameTypeGamesPages$ = combineLatest([
      this.gamesMap$,
      this.gameTypes$,
      this.activeGameTypeSubject.asObservable(),
      (this.searchControl.valueChanges as Observable<string>).pipe(
        startWith("")
      )
    ]).pipe(
      map(([gamesMap, gameTypes, gameTypeId, searchValue]) => {
        const games = gameTypes
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
          || [];
        console.log(searchValue, games);

        const gamePages: IGame[][] = [];
        let gamePage: IGame[] = [];

        games.forEach(game => {
          gamePage.push(game);

          if (gamePage.length === this.TOTAL_VISIBLE_ELEMENTS) {
            gamePages.push(gamePage);
            gamePage = [];
          }
        })

        if (gamePage.length) {
          gamePages.push(gamePage);
        }

        return gamePages;
      }),
      tap(() => this.updateActivePage(0)),
      shareReplay()
    )

    this.activeGamesPage$ = combineLatest([
      this.selectedGameTypeGamesPages$,
      this.activeGamePageIndexSubject.asObservable()
    ]).pipe(map(
      ([pages, pageIndex]) => pages && pages.length ? pages[pageIndex] : null
    ))
  }

  public showMovies(gameTypeId: number): void {
    this.activeGameTypeSubject.next(gameTypeId);
  }

  public updateActivePage(pageIndex: number) {
    this.activeGamePageIndexSubject.next(pageIndex);
  }
}
