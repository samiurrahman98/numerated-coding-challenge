// can have multiple filters in a request targeting different resources (ex: filter route patterns by route and stop)
export class Filter {
    resource = ''; // single word targeting the resource to filter by (ex: filter stops by route -- resource for filter would be route)
    values = ''; // comma separated list with spaces stripped
}

export class Fields {
    resource = ''; // name containing the fields of interest (ex: fields on route -- resource for fields would be route)
    values = ''; // comma separated list with spaces stripped
}

export class RequestWrapper {
    private resource: string;
    private filters: Filter[];
    private fields: Fields;
    private sortParam: string;
    private limit: number;

    constructor(resource: string) {
        this.resource = resource;
        this.filters = [];
    }

    // getters

    getResource(): string { return this.resource; }
    getFilters(): Filter[] { return this.filters; }
    getFields(): Fields { return this.fields; }
    getSortParam(): string { return this.sortParam; }
    getLimit(): number { return this.limit; }

    // setters

    addFilter(resource: string, values: string): void {
        const filter: Filter = {
            resource: this.stripWhiteSpace(resource),
            values: this.stripWhiteSpace(values)
        };
        this.filters.push(filter);
    }

    specifyFields(resource: string, values: string): void {
        this.fields = {
            resource: this.stripWhiteSpace(resource),
            values: this.stripWhiteSpace(values)
        };
    }

    // assumes ascending by default, prefix field with "-" for descending
    specifySortParam(field: string): void {
        this.sortParam = this.stripWhiteSpace(field);
    }

    specifyLimit(limit: number): void {
        this.limit = limit;
    }

    private stripWhiteSpace(val: string): string {
        return val.replace(/\s/g, '');
    }
}
