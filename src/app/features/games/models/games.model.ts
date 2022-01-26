export interface IGames {
    GameTypes: IGameTypes[];
    Games: IGame[];
}

export interface IGameTypes {
    Order: number;
    ID: number;
    Name: string;
    Games: number[];
}

export interface IGame {
    GameTypeID: number;
    ImageID: string;
    GameOrder: number;
    GameName: string;
    GameID: number;
}