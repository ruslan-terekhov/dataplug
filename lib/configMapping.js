const _ = require('lodash')

/**
 * Configuration mapping
 */
class ConfigMapping {
  /**
   * @constructor
   * @param {ConfigMapping|Object} [other=undefined] Other mapping to clone
   */
  constructor (other = undefined) {
    if (other) {
      for (let selector in other) {
        this[selector] = other[selector]
      }
    }
  }

  /**
   * Returns copy of this mapping, extended using specified modifier
   *
   * @param {ConfigMapping~Modifier} modifier An modifier functor
   * @return {ConfigMapping} Copy of this mapping
   */
  extended (modifier) {
    return modifier(new ConfigMapping(this))
  }

  /**
   * Remaps a parameter matched to specified selector using specified mapper
   *
   * @param {string} selector Parameter selector, supports regexp
   * @param {ConfigMapping~Mapper} mapper Mapper function
   * @return {ConfigMapping} This instance (for chaining purposes)
   */
  remap (selector, mapper) {
    if (this[selector]) {
      throw new Error(`'${selector}' selector already mapped`)
    }
    if (!_.isFunction(mapper)) {
      throw new Error('Mapper is not a function')
    }

    this[selector] = mapper

    return this
  }

  /**
   * Renames a parameter
   *
   * @param {string} selector Parameter selector, supports regexp
   * @param {string} newName New name for mathing parameter
   * @return {ConfigMapping} This instance (for chaining purposes)
   */
  rename (selector, newName) {
    return this.remap(selector, (value) => {
      if (!value) {
        return
      }
      let mapped = {}
      mapped[newName] = value
      return mapped
    })
  }

  /**
   * Uses parameter as-is
   *
   * @param {string} selector Parameter selector, supports regexp
   * @return {ConfigMapping} This instance (for chaining purposes)
   */
  asIs (selector) {
    return this.remap(selector, (value, currentName) => {
      if (!value) {
        return
      }
      let mapped = {}
      mapped[currentName] = value
      return mapped
    })
  }

  /**
   * Applies mappings to given values
   *
   * @param {Object} values Values to map
   * @return {Object} Mapped values
   */
  apply (values) {
    let mappedValues = {}

    for (let selector in this) {
      for (let parameter in values) {
        const mapper = this[selector]
        const value = values[parameter]

        if (!parameter.match(selector)) {
          continue
        }

        const mappedValue = mapper(value, parameter, values)
        if (!mappedValue) {
          continue
        }

        mappedValues = Object.assign({}, mappedValues, mappedValue)
      }
    }

    return mappedValues
  }
}

/**
 * Maps parameter
 *
 * @callback ConfigMapping~Mapper
 * @param {Object} value Parameter value
 * @param {string} name Parameter name
 * @param {Object} params Parameter values
 * @return {Object} Object with mapped parameter
 */

/**
 * Modifies given ConfigMapper instance
 *
 * @callback ConfigMapper~Modifier
 * @param {ConfigMapper} mapper Instance to modify
 * @returns {ConfigMapper} Modified instance
 */

module.exports = ConfigMapping