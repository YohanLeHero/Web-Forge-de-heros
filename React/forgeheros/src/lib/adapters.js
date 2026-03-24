const races = ['Humain', 'Elfe', 'Nain', 'Halfelin', 'Demi-Orc', 'Gnome', 'Tieffelin', 'Demi-Elfe']
const classes = ['Barbare', 'Barde', 'Clerc', 'Druide', 'Guerrier', 'Mage', 'Paladin', 'Ranger', 'Sorcier', 'Voleur']
const skillsByClass = {
  Barbare: ['Athletisme', 'Intimidation'],
  Barde: ['Representation', 'Persuasion', 'Tromperie'],
  Clerc: ['Religion', 'Medecine', 'Perspicacite'],
  Druide: ['Nature', 'Survie', 'Dressage'],
  Guerrier: ['Athletisme', 'Perception'],
  Mage: ['Arcanes', 'Histoire', 'Investigation'],
  Paladin: ['Religion', 'Persuasion', 'Intimidation'],
  Ranger: ['Survie', 'Perception', 'Dressage'],
  Sorcier: ['Arcanes', 'Tromperie'],
  Voleur: ['Discretion', 'Escamotage', 'Acrobaties'],
}

function stat(base) {
  return Math.max(8, Math.min(15, base))
}

export function toSimpleCharacter(hero) {
  const className = classes[hero.id % classes.length]
  const raceName = races[hero.id % races.length]
  const strength = stat(8 + (hero.id % 8))
  const dexterity = stat(8 + ((hero.id + 2) % 8))
  const constitution = stat(8 + ((hero.id + 3) % 8))
  const intelligence = stat(8 + ((hero.id + 4) % 8))
  const wisdom = stat(8 + ((hero.id + 5) % 8))
  const charisma = stat(8 + ((hero.id + 6) % 8))
  return {
    id: hero.id,
    name: hero.name ?? 'Unknown',
    image: hero.image ?? '',
    race: raceName,
    className,
    level: 1 + (hero.id % 20),
    description: hero.description ?? '',
    affiliation: hero.affiliation ?? '',
    skills: skillsByClass[className] ?? [],
    strength,
    dexterity,
    constitution,
    intelligence,
    wisdom,
    charisma,
  }
}

export function toSimpleCharacters(items) {
  return items.map(toSimpleCharacter)
}
