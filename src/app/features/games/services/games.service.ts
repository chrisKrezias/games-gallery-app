import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, from, Observable, shareReplay, switchMap } from 'rxjs';
import { IGames } from '../models/games.model';

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  constructor(private http: HttpClient) { }

  public getGames$(): Observable<IGames> {
    return combineLatest([
      from(this.getLabelId()),
      from(this.getLanguageId()),
    ]).pipe(
      switchMap(
        ([labelId, languageId]) => {
          return this.http.get(`https://silentgamesapi.progressplay.net/Services/ClientHelper.svc/GetGames?CountryId=221&IsMobile=false&LabelId=${labelId}&LanguageId=${languageId}&PlayerId=0`) as Observable<IGames>;
        }
      ),
      shareReplay()
    )
  }

  private async getLabelId(): Promise<number> {
    return 68;
  }

  private async getLanguageId(): Promise<number> {
    return 254;
  }
}
