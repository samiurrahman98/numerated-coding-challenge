export class Stop {
    constructor(
      public id: string = '',
      public attributes: {
        name: string,
        address: string,
      }
    ) {  }
}
