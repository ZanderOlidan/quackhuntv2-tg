import { tangibleSingularProperties, tangibleMultipleProperties, adjectives, adverbs } from './Data.js';

const pluralPronouns = ['you', 'they'];

const pronoun = term => pluralPronouns.includes(term.toLowerCase()) ? 'are' : 'is';

const finalTemplates = [
    name => `${name} ${pronoun(name)} ` + getDescriptor(),
    name => `${name} ${pronoun(name)} ` + getAbstractProperty()
];

const templates = [
    name => '9 out of 10 doctors say ' + getFinalTemplate(name),
    name => 'Bibe can tell ' + getFinalTemplate(name),
    name => "Bibe couldn't believe " + getFinalTemplate(name),
    name => 'I must say: ' + getFinalTemplate(name),
    name => 'Bibe reckons ' + getFinalTemplate(name),
    name => 'Bibe thinks ' + getFinalTemplate(name),
    name => 'Bibe has always thought ' + getFinalTemplate(name),
    name => 'Bibe has heard ' + getFinalTemplate(name),
    name => "It's true, " + getFinalTemplate(name),
    name => 'Other ducklings say ' + getFinalTemplate(name),
    name => 'They say ' + getFinalTemplate(name)
].concat(finalTemplates);

const abstractProperties = [
    function () { return [makeSingularForm(getDescriptor()), getTangibleSingularProperty()].join(' '); },
    function () { return [getDescriptor(), getTangibleMultipleProperty()].join(' '); }
];

const makeSingularForm = (text) => {
    if (text.match(/^[aeiou]/i)) {
        return 'an ' + text;
    } else {
        return 'a ' + text;
    }
};

const getTemplate = name => templates[Math.floor(Math.random() * templates.length)](name);

const getFinalTemplate = name => finalTemplates[Math.floor(Math.random() * finalTemplates.length)](name);

const getAbstractProperty = () => abstractProperties[Math.floor(Math.random() * abstractProperties.length)]();

const getTangibleSingularProperty = () => tangibleSingularProperties[Math.floor(Math.random() * tangibleSingularProperties.length)];

const getTangibleMultipleProperty = () => tangibleMultipleProperties[Math.floor(Math.random() * tangibleMultipleProperties.length)];

const getAdjective = () => adjectives[Math.floor(Math.random() * adjectives.length)];

const getAdverb = () => adverbs[Math.floor(Math.random() * adverbs.length)];

const getDescriptor = () => [getAdverb(), getAdjective()].join(' ');

const makeCompliment = (name = 'you') => getTemplate(name);

export {
    makeCompliment
};
