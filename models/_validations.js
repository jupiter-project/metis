// Function is used to provide validation to attributes before being saved in the blockchain
// Attribute name is how the attribute is called in the front end for messaging purposes
// Attribute value is the actual value of the attribute
// Requirements is a hash that contains validation for attribute value
// If requirements determine attributeValue is not valid, errors boolean is set to true and
//  error message is pushed.
function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

module.exports = {
  validate_model: (attributeName, attributeValue, requirements) => {
    const errorMessages = [];
    let errors = false;

    // requirements.required => Set to true if attribute is mandatory
    if (requirements.required === true) {
      if (requirements.dataType === 'Boolean' && (attributeValue !== false && attributeValue !== true)) {
        errors = true;
        errorMessages.push(`${attributeName} needs to be true or false.`);
      } else if (requirements.dataType !== 'Boolean' && (attributeValue == null || attributeValue === '')) {
        errors = true;
        errorMessages.push(`${attributeName} is required.`);
      }
    }


    // requirements.dataType= => Indicates the datatype of attribute to determine validation type
    if (requirements.dataType !== 'Integer' && requirements.dataType !== 'String' && requirements.dataType !== 'Boolean'
        && requirements.dataType !== 'Email' && requirements.dataType !== 'Cryptocurrency'
        && requirements.dataType !== 'Text') {
      errors = true;
      errorMessages.push(`Incorrect data type for model ${attributeName}`);
    }

    if (requirements.dataType === 'Integer' || requirements.dataType === 'Cryptocurrency') {
      // If attributeValue is not a number, then error is raised automatically
      if (typeof attributeValue !== 'number') {
        errors = true;
        errorMessages.push(`${attributeName} must be a number`);
      }

      if (attributeValue < 0) {
        errors = true;
        errorMessages.push(`${attributeName} cannot be lower than zero.`);
      }


      // requirments.moreThan => Raises an error if integer is less than specified value
      if (requirements.moreThan) {
        if (typeof requirements.moreThan !== 'number') {
          errors = true;
          errorMessages.push(`moreThan argument for ${attributeName} needs to be a number`);
        }

        if (attributeValue < requirements.moreThan) {
          errors = true;
          errorMessages.push(`${attributeName} provided is less than ${requirements.moreThan}`);
        }
      }

      // requirements.lessThan => Raises error if integer is more than specified value
      if (requirements.lessThan) {
        if (typeof requirements.lessThan !== 'number') {
          errors = true;
          errorMessages.push(`lessThan argument for ${attributeName} needs to be a number`);
        }

        if (attributeValue >= requirements.lessThan) {
          errors = true;
          errorMessages.push(`${attributeName} provided is higher than ${(requirements.lessThan - 1)}`);
        }
      }
    }

    if (requirements.dataType === 'String' || requirements.dataType === 'Text') {
      // Error is raised if attribute an numerical value
      if (requirements.required && typeof attributeValue !== 'string') {
        errors = true;
        errorMessages.push(`${attributeName} needs to be a string.`);
      }

      // requirements.minLength => Error is raised if attribute is less than specified value
      if (requirements.minLength && typeof requirements.minLength === 'number') {
        // Since lengths are positive numbers, an error is raised if trying to set a negative
        // number as validation value
        if (requirements.minLength < 0) {
          errors = true;
          errorMessages.push(`${attributeName}'s minimum length cannot be less than zero."`);
        }

        // If length of attribute is lower than specified value, error is raised
        if (attributeValue.length < requirements.minLength) {
          errors = true;
          errorMessages.push(`${attributeName} needs to be ${requirements.minLength} or more`);
        }
      }

      // requirements.maxLength => Error is raised if attribute is more than specified value
      if (requirements.maxLength) {
        if (typeof requirements.maxLength !== 'number') {
          errors = true;
          errorMessages.push(`${attributeName} needs to be a positive integer.`);
        }
        // Since lengths are positive numbers, an error is raised if trying to set a negative
        // number as validation value
        if (requirements.maxLength < 0) {
          errors = true;
          errorMessages.push(`${attributeName}'s maximum character length cannot be less than zero.`);
        }

        // If length of string value is lesser than maximum assigned value, then error is raised
        if (attributeValue.length > requirements.maxLength) {
          errors = true;
          errorMessages.push(`${attributeName} needs to be ${requirements.maxLength} characters or less`);
        }
      }


      // For additional validation, minLength always will need to be lower than maxLength
      if (requirements.minLength
        && typeof requirements.minLength === 'number'
        && requirements.maxLength
        && typeof requirements.maxLength === 'number'
      ) {
        if (requirements.minLength < 0) {
          errors = true;
          errorMessages.push(`${attributeName}'s minimum length cannot be less than zero.`);
        }

        if (requirements.maxLength < 0) {
          errors = true;
          errorMessages.push(`${attributeName}'s maximum character length cannot be less than zero.`);
        }

        if (requirements.maxLength <= requirements.minLength) {
          errors = true;
          errorMessages.push(`${attributeName}'s maximum character length cannot be less or equal to minimum character length.`);
        }
      }
    }

    // For boolean validation, we only need to make sure that True, False or null are the values
    // of the attribute and nothing lese
    if (requirements.dataType === 'Boolean') {
      if (attributeValue !== true && attributeValue !== false && attributeValue != null) {
        errors = true;
        errorMessages.push(`${attributeName} needs to be true or false`);
      }
    }

    // For email validation, we use regular expression to make sure that input is an email format
    if (requirements.dataType === 'Email') {
      if (validateEmail(attributeValue) === false) {
        errors = true;
        errorMessages.push(`${attributeName} was not written in a valid email format.`);
      }
    }

    // After going through the validation process, error is returned as true or false and
    // the errorMessages array is returned as well if it exists

    return { error: errors, messages: errorMessages };
  },
};
