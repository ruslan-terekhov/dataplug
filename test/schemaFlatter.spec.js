/* eslint-env node, mocha */
require('chai')
  .should()
const Ajv = require('ajv')
const { SchemaFlatter } = require('../lib')

describe('SchemaFlatter', () => {
  describe('#constructor()', () => {
  })

  describe('#flatten()', () => {
    it('flattens basic schema', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          booleanProperty: {
            type: 'boolean'
          },
          integerProperty: {
            type: 'integer'
          },
          stringProperty: {
            type: 'string'
          },
          enumProperty: {
            enum: ['option1', 'option2']
          },
          objectProperty: {
            type: 'object'
          }
        }
      }
      new SchemaFlatter().flatten(jsonSchema, 'collection')
        .should.have.property('collection').that.is.deep.equal({
          fields: {
            booleanProperty: {
              type: 'boolean'
            },
            enumProperty: {
              enum: [
                'option1',
                'option2'
              ],
              type: 'enum'
            },
            integerProperty: {
              type: 'integer'
            },
            stringProperty: {
              type: 'string'
            },
            objectProperty: {
              type: 'json'
            }
          },
          origin: '#'
        })
    })

    it('flattens basic schema with defaults', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          booleanProperty: {
            type: 'boolean',
            default: false
          },
          integerProperty: {
            type: 'integer',
            default: 0
          },
          stringProperty: {
            type: 'string',
            default: 'value'
          },
          enumProperty: {
            enum: ['option1', 'option2'],
            default: 'option1'
          },
          objectProperty: {
            type: 'object',
            default: {}
          }
        }
      }
      new SchemaFlatter().flatten(jsonSchema, 'collection')
        .should.have.property('collection').that.is.deep.equal({
          fields: {
            booleanProperty: {
              type: 'boolean',
              default: false
            },
            enumProperty: {
              enum: [
                'option1',
                'option2'
              ],
              type: 'enum',
              default: 'option1'
            },
            integerProperty: {
              type: 'integer',
              default: 0
            },
            stringProperty: {
              type: 'string',
              default: 'value'
            },
            objectProperty: {
              type: 'json',
              default: {}
            }
          },
          origin: '#'
        })
    })

    it('flattens basic schema with nullables', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          booleanProperty: {
            type: ['boolean', 'null']
          },
          integerProperty: {
            type: ['integer', 'null']
          },
          stringProperty: {
            type: ['string', 'null']
          },
          enumProperty: {
            enum: ['option1', 'option2', null]
          },
          objectProperty: {
            type: ['object', 'null']
          }
        }
      }
      new SchemaFlatter().flatten(jsonSchema, 'collection')
        .should.have.property('collection').that.is.deep.equal({
          fields: {
            booleanProperty: {
              type: 'boolean',
              nullable: true
            },
            enumProperty: {
              enum: [
                'option1',
                'option2'
              ],
              type: 'enum',
              nullable: true
            },
            integerProperty: {
              type: 'integer',
              nullable: true
            },
            stringProperty: {
              type: 'string',
              nullable: true
            },
            objectProperty: {
              type: 'json',
              nullable: true
            }
          },
          origin: '#'
        })
    })

    it('flattens schema with basic array', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          array: {
            type: 'array',
            items: {
              type: 'integer'
            }
          }
        },
        required: ['id']
      }
      new SchemaFlatter().flatten(jsonSchema, 'collection')
        .should.be.deep.equal({
          collection: {
            fields: {
              id: {
                identity: true,
                type: 'integer'
              }
            },
            origin: '#',
            relatedEntities: [
              'collection/array[@]'
            ]
          },
          'collection/array[@]': {
            fields: {
              '$collection~id': {
                identity: true,
                reference: {
                  depth: 1,
                  entity: 'collection',
                  field: 'id'
                },
                relation: {
                  entity: 'collection',
                  field: 'id'
                },
                type: 'integer'
              },
              $value: {
                identity: true,
                type: 'integer'
              }
            },
            origin: '#/properties/array/items',
            customSchema: {
              properties: {
                $value: {
                  type: 'integer'
                }
              },
              required: [
                '$value'
              ],
              type: 'object'
            }
          }
        })
    })

    it('flattens schema with basic array via ref', () => {
      const jsonSchema = {
        type: 'object',
        definitions: {
          item: {
            type: 'integer'
          }
        },
        properties: {
          id: {
            type: 'integer'
          },
          array: {
            type: 'array',
            items: {
              $ref: '#/definitions/item'
            }
          }
        },
        required: ['id']
      }
      new SchemaFlatter().flatten(jsonSchema, 'collection')
        .should.be.deep.equal({
          'collection': {
            'fields': {
              'id': {
                'identity': true,
                'type': 'integer'
              }
            },
            'origin': '#',
            'relatedEntities': [
              'collection/item'
            ]
          },
          'collection/item': {
            'fields': {
              '$collection~id': {
                'identity': true,
                reference: {
                  depth: 1,
                  entity: 'collection',
                  field: 'id'
                },
                relation: {
                  entity: 'collection',
                  field: 'id'
                },
                'type': 'integer'
              },
              '$value': {
                'identity': true,
                'type': 'integer'
              }
            },
            'origin': '#/definitions/item',
            'customSchema': {
              'properties': {
                '$value': {
                  'type': 'integer'
                }
              },
              'required': [
                '$value'
              ],
              'type': 'object'
            }
          }
        })
    })

    it('flattens schema with complex array', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          array: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                value: {
                  type: 'string'
                }
              }
            }
          }
        },
        required: ['id']
      }
      new SchemaFlatter().flatten(jsonSchema, 'collection')
        .should.be.deep.equal({
          'collection': {
            'fields': {
              'id': {
                'identity': true,
                'type': 'integer'
              }
            },
            'origin': '#',
            'relatedEntities': [
              'collection/array[@]'
            ]
          },
          'collection/array[@]': {
            'fields': {
              '$collection~id': {
                'identity': true,
                reference: {
                  depth: 1,
                  entity: 'collection',
                  field: 'id'
                },
                relation: {
                  entity: 'collection',
                  field: 'id'
                },
                'type': 'integer'
              },
              'value': {
                'type': 'string'
              }
            },
            'origin': '#/properties/array/items'
          }
        })
    })

    it('flattens schema with complex array via $ref', () => {
      const jsonSchema = {
        type: 'object',
        definitions: {
          item: {
            type: 'object',
            properties: {
              value: {
                type: 'string'
              }
            }
          }
        },
        properties: {
          id: {
            type: 'integer'
          },
          array: {
            type: 'array',
            items: {
              $ref: '#/definitions/item'
            }
          }
        },
        required: ['id']
      }
      new SchemaFlatter().flatten(jsonSchema, 'collection')
        .should.be.deep.equal({
          'collection': {
            'fields': {
              'id': {
                'identity': true,
                'type': 'integer'
              }
            },
            'origin': '#',
            'relatedEntities': [
              'collection/item'
            ]
          },
          'collection/item': {
            'fields': {
              '$collection~id': {
                'identity': true,
                reference: {
                  depth: 1,
                  entity: 'collection',
                  field: 'id'
                },
                relation: {
                  entity: 'collection',
                  field: 'id'
                },
                'type': 'integer'
              },
              'value': {
                'type': 'string'
              }
            },
            'origin': '#/definitions/item'
          }
        })
    })

    it('throws when flattens schema with tuple-aray', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          simpleProperty: {
            type: 'integer'
          },
          array: {
            type: 'array',
            items: [{
              type: 'integer'
            }, {
              type: 'string'
            }]
          }
        },
        required: ['simpleProperty']
      };
      (() => new SchemaFlatter().flatten(jsonSchema, 'collection'))
        .should.throw(/tuple array/)
    })

    it('throws when flattens complex schema without IDs', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          simpleProperty: {
            type: 'integer'
          },
          complexObject: {
            type: 'object',
            properties: {
              otherSimpleProperty: {
                type: 'integer'
              }
            }
          }
        }
      };
      (() => new SchemaFlatter().flatten(jsonSchema, 'collection'))
        .should.throw(/not identifiable/)
    })

    it('flattens complex schema', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          simpleProperty: {
            type: 'integer'
          },
          complexObject: {
            type: 'object',
            properties: {
              otherSimpleProperty: {
                type: 'integer'
              }
            }
          }
        },
        required: ['simpleProperty']
      }
      new SchemaFlatter().flatten(jsonSchema, 'collection')
        .should.be.deep.equal({
          'collection': {
            fields: {
              simpleProperty: {
                identity: true,
                type: 'integer'
              }
            },
            relatedEntities: [
              'collection/complexObject'
            ],
            origin: '#'
          },
          'collection/complexObject': {
            fields: {
              '$collection~simpleProperty': {
                identity: true,
                type: 'integer',
                reference: {
                  entity: 'collection',
                  field: 'simpleProperty',
                  depth: 1
                },
                relation: {
                  entity: 'collection',
                  field: 'simpleProperty'
                }
              },
              otherSimpleProperty: {
                type: 'integer'
              }
            },
            origin: '#/properties/complexObject'
          }
        })
    })

    it('flattens complex schema with default additionalProperties', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          simpleProperty: {
            type: 'integer'
          },
          complexObject: {
            type: 'object',
            additionalProperties: true
          }
        },
        required: ['simpleProperty']
      }
      new SchemaFlatter().flatten(jsonSchema, 'collection')
        .should.be.deep.equal({
          collection: {
            fields: {
              simpleProperty: {
                identity: true,
                type: 'integer'
              }
            },
            origin: '#',
            relatedEntities: [
              'collection/complexObject'
            ]
          },
          'collection/complexObject': {
            fields: {
              '$collection~simpleProperty': {
                identity: true,
                reference: {
                  depth: 1,
                  entity: 'collection',
                  field: 'simpleProperty'
                },
                relation: {
                  entity: 'collection',
                  field: 'simpleProperty'
                },
                type: 'integer'
              }
            },
            origin: '#/properties/complexObject',
            relatedEntities: [
              'collection/complexObject[@0]'
            ]
          },
          'collection/complexObject[@0]': {
            customSchema: {
              properties: {
                $property: {
                  type: 'string'
                },
                $value: {
                  type: ['object', 'null']
                }
              },
              required: ['$property', '$value'],
              type: 'object'
            },
            fields: {
              '$collection~simpleProperty': {
                identity: true,
                reference: {
                  depth: 2,
                  entity: 'collection',
                  field: 'simpleProperty'
                },
                relation: {
                  entity: 'collection/complexObject',
                  field: '$collection~simpleProperty'
                },
                type: 'integer'
              },
              $property: {
                identity: true,
                type: 'string'
              },
              $value: {
                identity: true,
                nullable: true,
                type: 'json'
              }
            },
            origin: '#/properties/complexObject/additionalProperties'
          }
        })
    })

    it('flattens complex schema with basic custom additionalProperties', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          simpleProperty: {
            type: 'integer'
          },
          complexObject: {
            type: 'object',
            additionalProperties: {
              type: 'integer'
            }
          }
        },
        required: ['simpleProperty']
      }
      new SchemaFlatter().flatten(jsonSchema, 'collection')
        .should.be.deep.equal({
          collection: {
            fields: {
              simpleProperty: {
                identity: true,
                type: 'integer'
              }
            },
            origin: '#',
            relatedEntities: [
              'collection/complexObject'
            ]
          },
          'collection/complexObject': {
            fields: {
              '$collection~simpleProperty': {
                identity: true,
                reference: {
                  depth: 1,
                  entity: 'collection',
                  field: 'simpleProperty'
                },
                relation: {
                  entity: 'collection',
                  field: 'simpleProperty'
                },
                type: 'integer'
              }
            },
            origin: '#/properties/complexObject',
            relatedEntities: [
              'collection/complexObject[@0]'
            ]
          },
          'collection/complexObject[@0]': {
            customSchema: {
              properties: {
                $property: {
                  type: 'string'
                },
                $value: {
                  type: 'integer'
                }
              },
              required: ['$property', '$value'],
              type: 'object'
            },
            fields: {
              '$collection~simpleProperty': {
                identity: true,
                reference: {
                  depth: 2,
                  entity: 'collection',
                  field: 'simpleProperty'
                },
                relation: {
                  entity: 'collection/complexObject',
                  field: '$collection~simpleProperty'
                },
                type: 'integer'
              },
              $property: {
                identity: true,
                type: 'string'
              },
              $value: {
                identity: true,
                type: 'integer'
              }
            },
            origin: '#/properties/complexObject/additionalProperties'
          }
        })
    })

    it('flattens complex schema with complex custom additionalProperties', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          simpleProperty: {
            type: 'integer'
          },
          complexObject: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              properties: {
                otherValue: {
                  type: 'integer'
                }
              }
            }
          }
        },
        required: ['simpleProperty']
      }
      new SchemaFlatter().flatten(jsonSchema, 'collection')
        .should.be.deep.equal({
          collection: {
            fields: {
              simpleProperty: {
                identity: true,
                type: 'integer'
              }
            },
            origin: '#',
            relatedEntities: [
              'collection/complexObject'
            ]
          },
          'collection/complexObject': {
            fields: {
              '$collection~simpleProperty': {
                identity: true,
                reference: {
                  depth: 1,
                  entity: 'collection',
                  field: 'simpleProperty'
                },
                relation: {
                  entity: 'collection',
                  field: 'simpleProperty'
                },
                type: 'integer'
              }
            },
            origin: '#/properties/complexObject',
            relatedEntities: [
              'collection/complexObject[@0]'
            ]
          },
          'collection/complexObject[@0]': {
            customSchema: {
              properties: {
                $property: {
                  type: 'string'
                },
                otherValue: {
                  type: 'integer'
                }
              },
              required: ['$property'],
              type: 'object'
            },
            fields: {
              '$collection~simpleProperty': {
                identity: true,
                reference: {
                  depth: 2,
                  entity: 'collection',
                  field: 'simpleProperty'
                },
                relation: {
                  entity: 'collection/complexObject',
                  field: '$collection~simpleProperty'
                },
                type: 'integer'
              },
              $property: {
                identity: true,
                type: 'string'
              },
              otherValue: {
                type: 'integer'
              }
            },
            origin: '#/properties/complexObject/additionalProperties'
          }
        })
    })

    it('flattens complex schema with basic custom patternProperties', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          simpleProperty: {
            type: 'integer'
          },
          complexObject: {
            type: 'object',
            patternProperties: {
              '^.*$': {
                type: 'integer'
              }
            }
          }
        },
        required: ['simpleProperty']
      }
      new SchemaFlatter().flatten(jsonSchema, 'collection')
        .should.be.deep.equal({
          collection: {
            fields: {
              simpleProperty: {
                identity: true,
                type: 'integer'
              }
            },
            origin: '#',
            relatedEntities: [
              'collection/complexObject'
            ]
          },
          'collection/complexObject': {
            fields: {
              '$collection~simpleProperty': {
                identity: true,
                reference: {
                  depth: 1,
                  entity: 'collection',
                  field: 'simpleProperty'
                },
                relation: {
                  entity: 'collection',
                  field: 'simpleProperty'
                },
                type: 'integer'
              }
            },
            origin: '#/properties/complexObject',
            relatedEntities: [
              'collection/complexObject[@0]'
            ]
          },
          'collection/complexObject[@0]': {
            customSchema: {
              properties: {
                $property: {
                  type: 'string'
                },
                $value: {
                  type: 'integer'
                }
              },
              required: ['$property', '$value'],
              type: 'object'
            },
            fields: {
              '$collection~simpleProperty': {
                identity: true,
                reference: {
                  depth: 2,
                  entity: 'collection',
                  field: 'simpleProperty'
                },
                relation: {
                  entity: 'collection/complexObject',
                  field: '$collection~simpleProperty'
                },
                type: 'integer'
              },
              $property: {
                identity: true,
                type: 'string'
              },
              $value: {
                identity: true,
                type: 'integer'
              }
            },
            origin: '#/properties/complexObject/patternProperties/^.*$'
          }
        })
    })

    it('flattens complex schema with complex custom patternProperties', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          simpleProperty: {
            type: 'integer'
          },
          complexObject: {
            type: 'object',
            patternProperties: {
              '^.*$': {
                type: 'object',
                properties: {
                  otherValue: {
                    type: 'integer'
                  }
                }
              }
            }
          }
        },
        required: ['simpleProperty']
      }
      new SchemaFlatter().flatten(jsonSchema, 'collection')
        .should.be.deep.equal({
          collection: {
            fields: {
              simpleProperty: {
                identity: true,
                type: 'integer'
              }
            },
            origin: '#',
            relatedEntities: [
              'collection/complexObject'
            ]
          },
          'collection/complexObject': {
            fields: {
              '$collection~simpleProperty': {
                identity: true,
                reference: {
                  depth: 1,
                  entity: 'collection',
                  field: 'simpleProperty'
                },
                relation: {
                  entity: 'collection',
                  field: 'simpleProperty'
                },
                type: 'integer'
              }
            },
            origin: '#/properties/complexObject',
            relatedEntities: [
              'collection/complexObject[@0]'
            ]
          },
          'collection/complexObject[@0]': {
            customSchema: {
              properties: {
                $property: {
                  type: 'string'
                },
                otherValue: {
                  type: 'integer'
                }
              },
              required: ['$property'],
              type: 'object'
            },
            fields: {
              '$collection~simpleProperty': {
                identity: true,
                reference: {
                  depth: 2,
                  entity: 'collection',
                  field: 'simpleProperty'
                },
                relation: {
                  entity: 'collection/complexObject',
                  field: '$collection~simpleProperty'
                },
                type: 'integer'
              },
              $property: {
                identity: true,
                type: 'string'
              },
              otherValue: {
                type: 'integer'
              }
            },
            origin: '#/properties/complexObject/patternProperties/^.*$'
          }
        })
    })

    // TODO: support tree-like schemas via many-to-many relations, which are not supported at the moment
    // using an entity and a relation entity
    it('throws on flattening tree-like schema', () => {
      const jsonSchema = {
        type: 'object',
        definitions: {
          node: {
            type: 'object',
            properties: {
              id: {
                type: 'integer'
              },
              children: {
                type: 'array',
                items: {
                  $ref: '#/definitions/node'
                }
              }
            },
            required: ['id']
          }
        },
        properties: {
          treeId: {
            type: 'integer'
          },
          root: {
            $ref: '#/definitions/node'
          }
        },
        required: ['treeId']
      };
      (() => new SchemaFlatter().flatten(jsonSchema, 'collection'))
        .should.throw(/relation to itself/)
    })
    // it('flattens tree-like schema', () => {
    //   const jsonSchema = {
    //     type: 'object',
    //     definitions: {
    //       node: {
    //         type: 'object',
    //         properties: {
    //           id: {
    //             type: 'integer'
    //           },
    //           children: {
    //             type: 'array',
    //             items: {
    //               $ref: '#/definitions/node'
    //             }
    //           }
    //         },
    //         required: ['id']
    //       }
    //     },
    //     properties: {
    //       treeId: {
    //         type: 'integer'
    //       },
    //       root: {
    //         $ref: '#/definitions/node'
    //       }
    //     },
    //     required: ['treeId']
    //   }
    //   new SchemaFlatter().flatten(jsonSchema, 'collection')
    //     .should.be.deep.equal({
    //       'collection': {
    //         fields: {
    //           treeId: {
    //             identity: true,
    //             type: 'integer'
    //           }
    //         },
    //         relatedEntities: [
    //           'collection/collection/node'
    //         ]
    //       },
    //       'collection/node': {
    //         fields: {
    //           '$FID:id$collection/node': { // this?
    //             identity: true,
    //             referencedEntity: 'collection/node',
    //             referencedEntityField: 'id',
    //             type: 'integer'
    //           },
    //           id: {
    //             identity: true,
    //             type: 'integer'
    //           }
    //         },
    //         relatedEntities: [
    //           'collection/node',
    //           'collection'
    //         ]
    //       }
    //     })
    // })
  })

  describe('#toJsonSchema()', () => {
    it('converts simple entity to JSON schema', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          booleanProperty: {
            type: 'boolean'
          },
          integerProperty: {
            type: 'integer'
          },
          stringProperty: {
            type: 'string'
          },
          enumProperty: {
            enum: ['option1', 'option2']
          },
          objectProperty: {
            type: 'object'
          }
        }
      }
      const flattenedSchema = new SchemaFlatter().flatten(jsonSchema, 'collection')
      const flattenedJsonSchema = SchemaFlatter.toJsonSchema(flattenedSchema)
      new Ajv().compile(flattenedJsonSchema)
      flattenedJsonSchema
        .should.be.deep.equal({
          'definitions': {
            'collection': {
              type: 'object',
              'properties': {
                'booleanProperty': {
                  'type': ['boolean']
                },
                'enumProperty': {
                  'enum': [
                    'option1',
                    'option2'
                  ]
                },
                'integerProperty': {
                  'type': ['integer']
                },
                'objectProperty': {
                  'type': ['object']
                },
                'stringProperty': {
                  'type': ['string']
                }
              }
            }
          },
          'properties': {
            'collection': {
              'items': {
                '$ref': '#/definitions/collection'
              },
              'type': 'array'
            }
          },
          'type': 'object'
        })
    })

    it('works on complex schema and data', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          simpleProperty: {
            type: 'integer'
          },
          complexObject: {
            type: 'object',
            properties: {
              otherSimpleProperty: {
                type: 'integer'
              }
            }
          }
        },
        required: ['simpleProperty']
      }
      const flattenedSchema = new SchemaFlatter().flatten(jsonSchema, 'collection')
      const flattenedJsonSchema = SchemaFlatter.toJsonSchema(flattenedSchema)
      new Ajv().compile(flattenedJsonSchema)
      flattenedJsonSchema
        .should.be.deep.equal({
          definitions: {
            collection: {
              properties: {
                simpleProperty: {
                  type: ['integer']
                }
              },
              required: [
                'simpleProperty'
              ],
              type: 'object'
            },
            'collection/complexObject': {
              properties: {
                '$collection~simpleProperty': {
                  type: ['integer']
                },
                otherSimpleProperty: {
                  type: ['integer']
                }
              },
              required: [
                '$collection~simpleProperty'
              ],
              type: 'object'
            }
          },
          properties: {
            collection: {
              items: {
                $ref: '#/definitions/collection'
              },
              type: 'array'
            },
            'collection/complexObject': {
              items: {
                $ref: '#/definitions/collection~1complexObject'
              },
              type: 'array'
            }
          },
          type: 'object'
        })
    })
  })
})
