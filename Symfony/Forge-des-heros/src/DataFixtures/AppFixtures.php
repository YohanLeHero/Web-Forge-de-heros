<?php

namespace App\DataFixtures;

use App\Entity\Character;
use App\Entity\CharacterClass;
use App\Entity\Party;
use App\Entity\Race;
use App\Entity\Skill;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $user = new User();
        $user->setEmail('demo@forge-heros.local');
        $user->setPassword('demo');
        $user->setUsername('demo');
        $user->setRoles('ROLE_USER');
        $manager->persist($user);

        $races = $this->persistRaces($manager);
        $classes = $this->persistCharacterClasses($manager);
        $skills = $this->persistSkills($manager);
        $this->wireClassSkills($classes, $skills);

        $manager->flush();

        $chars = [
            $this->makeCharacter($user, $races['Human'], $classes['Fighter'], 'Aldric', 5, 16, 14, 15, 10, 12, 8, 11, 45),
            $this->makeCharacter($user, $races['Elf'], $classes['Mage'], 'Lyralei', 4, 8, 14, 12, 17, 15, 10, 13, 22),
            $this->makeCharacter($user, $races['Dwarf'], $classes['Cleric'], 'Thorin', 6, 14, 10, 16, 10, 14, 12, 9, 52),
            $this->makeCharacter($user, $races['Halfling'], $classes['Rogue'], 'Pippa', 3, 8, 17, 12, 13, 12, 10, 14, 18),
            $this->makeCharacter($user, $races['half-Orc'], $classes['Barbarian'], 'Grok', 7, 18, 12, 16, 8, 10, 8, 9, 68),
        ];

        foreach ($chars as $c) {
            $manager->persist($c);
        }

        $party1 = new Party();
        $party1->setName('The Vanguard');
        $party1->setDescription('Front-line explorers of the northern roads.');
        $party1->setMaxSize(5);
        $party1->setUser($user);
        $party1->addCharacter($chars[0]);
        $party1->addCharacter($chars[1]);
        $manager->persist($party1);

        $party2 = new Party();
        $party2->setName('Silver Marches');
        $party2->setDescription('Scholars and scouts — recruiting.');
        $party2->setMaxSize(4);
        $party2->setUser($user);
        $party2->addCharacter($chars[2]);
        $manager->persist($party2);

        $manager->flush();
    }

    /**
     * @return array<string, Race>
     */
    private function persistRaces(ObjectManager $manager): array
    {
        $defs = [
            'Human' => 'Polyvalent and ambitious, humans are the most common race.',
            'Elf' => 'Graceful and long-lived, elves have a natural affinity for magic.',
            'Dwarf' => 'Sturdy and resilient, dwarves are skilled warriors and craftsmen.',
            'Halfling' => 'Small and nimble, halflings are known for their luck and stealth.',
            'half-Orc' => 'Fierce warriors combining orc strength with human adaptability.',
            'Gnome' => 'Ingenious and curious, gnomes excel with magic and craft.',
            'Tiefling' => 'Heirs of infernal bloodlines, tieflings bear a unique mark.',
            'Half-Elf' => 'Versatile diplomats blending elven and human heritage.',
        ];
        $out = [];
        foreach ($defs as $name => $desc) {
            $r = new Race();
            $r->setName($name);
            $r->setDescription($desc);
            $manager->persist($r);
            $out[$name] = $r;
        }

        return $out;
    }

    /**
     * @return array<string, CharacterClass>
     */
    private function persistCharacterClasses(ObjectManager $manager): array
    {
        $defs = [
            'Barbarian' => ['Savage warrior driven by rage.', 12],
            'Bard' => ['Weaves magic through music and tale.', 8],
            'Cleric' => ['Divine spellcaster serving the gods.', 8],
            'Druid' => ["Nature's guardian; shapeshifter.", 8],
            'Fighter' => ['Master of weapons and tactics.', 10],
            'Mage' => ['Arcane scholar.', 6],
            'Paladin' => ['Holy knight blending steel and faith.', 10],
            'Ranger' => ['Wilderness tracker and hunter.', 10],
            'Sorcerer' => ['Innate arcane talent.', 6],
            'Rogue' => ['Stealth, deception, precision.', 8],
        ];
        $out = [];
        foreach ($defs as $name => [$desc, $dice]) {
            $c = new CharacterClass();
            $c->setName($name);
            $c->setDescription($desc);
            $c->setHealthDice($dice);
            $manager->persist($c);
            $out[$name] = $c;
        }

        return $out;
    }

    /**
     * @return array<string, Skill>
     */
    private function persistSkills(ObjectManager $manager): array
    {
        $defs = [
            'Acrobatics' => 'Dexterity',
            'Arcana' => 'Intelligence',
            'Athletics' => 'Strength',
            'Stealth' => 'Dexterity',
            'Animal Handling' => 'Wisdom',
            'Sleight of Hand' => 'Dexterity',
            'History' => 'Intelligence',
            'Intimidation' => 'Charisma',
            'Investigation' => 'Intelligence',
            'Medicine' => 'Wisdom',
            'Nature' => 'Intelligence',
            'Perception' => 'Wisdom',
            'Insight' => 'Wisdom',
            'Persuasion' => 'Charisma',
            'Religion' => 'Intelligence',
            'Performance' => 'Charisma',
            'Survival' => 'Wisdom',
            'Deception' => 'Charisma',
        ];
        $out = [];
        foreach ($defs as $name => $ability) {
            $s = new Skill();
            $s->setName($name);
            $s->setAbility($ability);
            $manager->persist($s);
            $out[$name] = $s;
        }

        return $out;
    }

    /**
     * @param array<string, CharacterClass> $classes
     * @param array<string, Skill>         $skills
     */
    private function wireClassSkills(array $classes, array $skills): void
    {
        $map = [
            'Barbarian' => ['Athletics', 'Intimidation'],
            'Bard' => ['Performance', 'Persuasion', 'Deception'],
            'Cleric' => ['Religion', 'Medicine', 'Insight'],
            'Druid' => ['Nature', 'Survival', 'Animal Handling'],
            'Fighter' => ['Athletics', 'Perception'],
            'Mage' => ['Arcana', 'History', 'Investigation'],
            'Paladin' => ['Religion', 'Persuasion', 'Intimidation'],
            'Ranger' => ['Survival', 'Perception', 'Animal Handling'],
            'Sorcerer' => ['Arcana', 'Deception'],
            'Rogue' => ['Stealth', 'Sleight of Hand', 'Acrobatics'],
        ];
        foreach ($map as $className => $skillNames) {
            foreach ($skillNames as $sn) {
                $classes[$className]->addSkill($skills[$sn]);
            }
        }
    }

    private function makeCharacter(
        User $user,
        Race $race,
        CharacterClass $class,
        string $name,
        int $level,
        int $str,
        int $dex,
        int $con,
        int $int,
        int $wis,
        int $cha,
        int $hp,
    ): Character {
        $c = new Character();
        $c->setUser($user);
        $c->setRace($race);
        $c->setCharacterClass($class);
        $c->setName($name);
        $c->setLevel($level);
        $c->setStrength($str);
        $c->setDexterity($dex);
        $c->setConstitution($con);
        $c->setIntelligence($int);
        $c->setWisdom($wis);
        $c->setCharisma($cha);
        $c->setHealthPoint($hp);
        $c->setImage(null);

        return $c;
    }
}
