import {Model, model, property} from '@loopback/repository';

@model()
export class Categories extends Model {
    @property({
      type: 'array',
      itemType: 'string',
    })
    languages?: string[];

    @property({
      type: 'array',
      itemType: 'string',
    })
    chainids?: string[];

    @property({
      type: 'array',
      itemType: 'string',
    })
    tags?: string[];
}
