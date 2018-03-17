//Function is used to provide validation to attributes before being saved in the blockchain
// Attribute name is how the attribute is called in the front end for messaging purposes
// Attribute value is the actual value of the attribute
// Requirements is a hash that contains validation for attribute value
// If requirements determine attribute_value is not valid, errors boolean is set to true and 
//  error message is pushed.
module.exports = {
    validate_model: function(attribute_name, attribute_value, requirements) {
        var errors = false;
        var error_messages = [];

        // requirements.required => Set to true if attribute is mandatory
        if (requirements.required == true) {
            if (requirements.dataType == 'Boolean' && (attribute_value != false && attribute_value != true)) {
                errors = true;
                error_messages.push(attribute_name + ' needs to be true or false.');
            } else if (requirements.dataType != 'Boolean' && (attribute_value == null || attribute_value == '')) {
                errors = true;
                error_messages.push(attribute_name + ' is required.');
            }
        }


        // requirements.dataType= => Indicates the datatype of attribute to determine validation type
        if (requirements.dataType != 'Integer' && requirements.dataType != 'String' && requirements.dataType != 'Boolean' &&
            requirements.dataType != 'Email' && requirements.dataType != 'Cryptocurrency' &&
            requirements.dataType != 'Text') {
            errors = true;
            error_messages.push('Incorrect data type for model ' + attribute_name);
        }

        if (requirements.dataType == 'Integer' || requirements.dataType == 'Cryptocurrency') {

            // If attribute_value is not a number, then error is raised automatically
            if (isNaN(attribute_value)) {
                errors = true;
                error_messages.push(attribute_name + ' must be a number');
            }

            if (attribute_value < 0) {
                errors = true;
                error_messages.push(attribute_name + ' cannot be lower than zero.')
            }


            // requirments.moreThan => Raises an error if integer is less than specified value
            if (requirements.moreThan != null && requirements.moreThan != '' && !isNaN(requirements.moreThan)) {
                if (attribute_value < requirements.moreThan) {
                    errors = true;
                    error_messages.push(attribute_name + ' provided is less than ' + requirements.moreThan);
                }
            }

            // requirements.lessThan => Raises error if integer is more than specified value
            if (requirements.lessThan != null && requirements.lessThan != '' && !isNaN(requirements.lessThan)) {
                if (attribute_value >= requirements.lessThan) {
                    errors = true;
                    error_messages.push(attribute_name + ' provided is higher than ' + (requirements.lessThan - 1));
                }
            }
        }

        if (requirements.dataType == 'String' || requirements.dataType == 'Text') {

            // Error is raised if attribute an numerical value. 
            if (requirements.required != null && !isNaN(attribute_value)) {
                errors = true;
                error_messages.push(attribute_name + ' needs to be a string.');
            }

            // requirements.minLength => Error is raised if attribute is less than specified value
            if (requirements.minLength != null && !isNaN(requirements.minLength)) {
                //Since lengths are positive numbers, an error is raised if trying to set a negative
                // number as validation value
                if (requirements.minLength < 0) {
                    errors = true;
                    error_messages.push(attribute_name + "'s minimum length cannot be less than zero.");
                }

                //If length of attribute is lower than specified value, error is raised
                if (attribute_value.length < requirements.minLength) {
                    errors = true;
                    error_messages.push(attribute_name + ' needs to be ' + requirements.minLength + ' or more');
                }
            }

            // requirements.maxLength => Error is raised if attribute is more than specified value
            if (requirements.maxLength != null) {
                if (isNaN(requirements.maxLength)) {
                    errors = true;
                    error_messages.push(attribute_name + " needs to be a positive integer.");
                }
                //Since lengths are positive numbers, an error is raised if trying to set a negative
                // number as validation value
                if (requirements.maxLength < 0) {
                    errors = true;
                    error_messages.push(attribute_name + "'s maximum character length cannot be less than zero.");
                }

                //If length of string value is less higher than maximum assigned value, then error is raised
                if (attribute_value.length > requirements.maxLength) {
                    errors = true;
                    error_messages.push(attribute_name + ' needs to be ' + requirements.maxLength + ' characters or less');
                }
            }


            //For additional validation, minLength always will need to be lower than maxLength

            if (requirements.minLength != null && !isNaN(requirements.minLength) && requirements.maxLength != null && !isNaN(requirements.maxLength)) {
                if (requirements.minLength < 0) {
                    errors = true;
                    error_messages.push(attribute_name + "'s minimum length cannot be less than zero.");
                }

                if (requirements.maxLength < 0) {
                    errors = true;
                    error_messages.push(attribute_name + "'s maximum character length cannot be less than zero.");
                }

                if (requirements.maxLength <= requirements.minLength) {
                    errors = true;
                    error_messages.push(attribute_name + "'s maximum character length cannot be less or equal to minimum character length.");
                }
            }
        }

        // For boolean validation, we only need to make sure that True, False or null are the values 
        // of the attribute and nothing lese
        if (requirements.dataType == 'Boolean') {
            if (attribute_value != true && attribute_value != false && attribute_value != null) {
                errors = true;
                error_messages.push(attribute_name + ' needs to be true or false');
            }
        }

        // For email validation, we use regular expression to make sure that input is an email format
        if (requirements.dataType == 'Email') {
            function validateEmail(email) {
                var re = /\S+@\S+\.\S+/;
                return re.test(email);
            }

            if (validateEmail(attribute_value) == false) {
                errors = true;
                error_messages.push(attribute_name + ' was not written in a valid email format.');
            }
        }

        //After going through the validation process, error is returned as true or false and
        // the error_messages array is returned as well if it exists

        return { error: errors, messages: error_messages }
    }

}