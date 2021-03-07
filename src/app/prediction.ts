export enum PredictionState {
  NotLoaded = 0,
  Loaded = 1
}

export class Prediction {
    constructor(
      public attributes: {
        departure_time: string,
      }
    ) {  }
}

export class PredictionWrapper {
  constructor(
    public state: PredictionState = PredictionState.NotLoaded,
    public prediction?: Prediction
  ) {}
}
