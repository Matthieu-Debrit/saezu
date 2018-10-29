const checkRules = function (v, rules) {
    for (let rule of rules) {
        const error = rule(v);
        if (error !== true) {
            return error;
        }
    }
    return false;
};

const usernameTest = /^\w*$/;
const usernameRules = [
    (v) => !!v || 'Required',
    (v) => (v && v.length < 16) || 'Must have less than 16 characters',
    (v) => (v && v.length >= 2) || 'Must have more than 2 characters',
    (v) => (v && usernameTest.test(v)) || 'Can only contain alphanumeric characters and underscores'
];

const nameTest = /\S/;
const nameRules = [
    (v) => !!v || 'Required',
    (v) => (v && v.length < 51) || 'Must have less than 51 characters',
    (v) => (v && v.length > 0) || 'Can\'t be empty',
    (v) => (v && nameTest.test(v)) || 'Must contain a least a non-whitespace character'
];

const passwordRules = [
    (v) => !!v || 'Required',
    (v) => (v && v.length < 160) || 'Must have less than 160 characters',
    (v) => (v && v.length >= 6) || 'Must have more than 6 characters'
];

const postMax = 256;
const postTest = /\S/;
const postRules = [
    (v) => !!v || 'Required',
    (v) => (v && v.length <= postMax) || `Max ${postMax} characters`,
    (v) => (v && v.length > 0) || 'Can\'t be empty',
    (v) => (v && postTest.test(v)) || 'Must contain a least a non-whitespace character'
];

module.exports = {
    checkRules,
    usernameRules,
    nameRules,
    passwordRules,
    postRules,
    postMax
};