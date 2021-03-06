export class Direction {
    constructor(
      public attributes: {
        directionId: string
      }
    ) {  }
}

export class DirectionWrapper {
  constructor(
    public label: string = '',
    public directionObject?: Direction
  ) { }
}

export class DirectionWrapperBuilt {
  constructor(
    public built: boolean = false,
    public directionWrappers?: DirectionWrapper[]
  ) {}
}
