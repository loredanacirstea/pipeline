import {Model, model, property} from '@loopback/repository';
import {DStorage} from './storage.model';

@model()
export class SourceObj extends Model {
    @property({
      type: 'string',
    })
    relative_path?: string;

    @property({
      type: 'string',
    })
    storage?: DStorage;

    @property({
      type: 'string',
    })
    source: string;
}

@model()
export class Source extends Model {
    @property({
      type: 'string',
    })
    flatsource?: string;

    @property({
      type: 'string',
    })
    sources?: SourceObj;
}

@model()
export class PClassSources extends Model {
    javascript: Source;
    python: Source;
}

export interface PFunctionSources {
    [key: string]: any;
}

// @model()
// export class PFunctionSources extends Model {
//     [key: string]: string;
// }
