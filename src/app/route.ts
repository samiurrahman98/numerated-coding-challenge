export class Route {
  constructor(
    public id: string = '',
    public attributes: {
      direction_names: string[],
      long_name: string
    }
  ) {  }
}
